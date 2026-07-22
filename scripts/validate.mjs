import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const manifest = readJson("module.json");
const packageJson = readJson("package.json");

assert(manifest.id === "cards-by-kaciquehn", "module.json has an unexpected id");
assert(packageJson.name === manifest.id, "package.json name must match module.json id");
assert(packageJson.version === manifest.version, "package.json version must match module.json version");
assert(Number(manifest.compatibility?.minimum) <= 13, "Foundry v13 must remain supported");
assert(!manifest.compatibility?.maximum, "compatibility.maximum should be omitted unless required");
assert(manifest.download.endsWith("/cards-by-kaciquehn.zip"), "unexpected release download URL");

for (const file of [
  ...(manifest.esmodules ?? []),
  ...(manifest.styles ?? []),
  ...(manifest.languages ?? []).map((language) => language.path),
  ...(manifest.packs ?? []).map((pack) => pack.path)
]) {
  assert(fs.existsSync(path.join(root, file)), `manifest path does not exist: ${file}`);
}

const legacyPack = fs
  .readFileSync(path.join(root, "packs", "decks.db"), "utf8")
  .split(/\r?\n/u)
  .filter(Boolean)
  .map((line, index) => {
    try {
      return JSON.parse(line);
    } catch {
      failures.push(`packs/decks.db has invalid JSON on line ${index + 1}`);
      return null;
    }
  })
  .filter(Boolean);

const modulePrefix = `modules/${manifest.id}/`;
let cards = 0;
let imageReferences = 0;

function validateImage(image, location) {
  if (!image) {
    failures.push(`${location} has no image`);
    return;
  }
  if (!image.startsWith(modulePrefix)) {
    failures.push(`${location} uses an unexpected path: ${image}`);
    return;
  }

  imageReferences += 1;
  const relativePath = image.slice(modulePrefix.length);
  assert(fs.existsSync(path.join(root, relativePath)), `${location} references missing file: ${image}`);
}

for (const deck of legacyPack) {
  validateImage(deck.img, `${deck.name}.img`);
  for (const card of deck.cards ?? []) {
    cards += 1;
    validateImage(card.back?.img, `${deck.name}/${card.name}.back.img`);
    for (const [index, face] of (card.faces ?? []).entries()) {
      validateImage(face.img, `${deck.name}/${card.name}.faces[${index}].img`);
    }
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${legacyPack.length} decks, ${cards} cards, and ${imageReferences} image references.`
);
