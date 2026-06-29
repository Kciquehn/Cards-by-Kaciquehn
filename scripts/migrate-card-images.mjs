const MODULE_ID = "cards-by-kaciquehn";
const NEW_PREFIX = `modules/${MODULE_ID}/images/`;
const OLD_PREFIXES = [
  "modules/foundryvtt-cards/images/",
  "modules/FoundryVTTCards/images/",
  "modules/Cards-by-Kaciquehn/images/",
  "modules/Cards by Kaciquehn/images/"
];

function migratePath(value) {
  if (typeof value !== "string") return value;
  for (const prefix of OLD_PREFIXES) {
    if (value.startsWith(prefix)) return value.replace(prefix, NEW_PREFIX);
  }
  return value;
}

function migrateCardSource(card, deck) {
  const source = card.toObject();
  const update = { _id: card.id };
  let changed = false;

  const faces = source.faces.map((face) => {
    const faceSource = foundry.utils.deepClone(face);
    const img = migratePath(faceSource.img);
    if (img !== faceSource.img) {
      faceSource.img = img;
      changed = true;
    }
    return faceSource;
  });

  const back = foundry.utils.deepClone(source.back ?? {});
  const backImg = migratePath(back.img);
  if (backImg !== back.img) {
    back.img = backImg;
    changed = true;
  }
  if (!back.img && deck.img) {
    back.img = deck.img;
    back.name ||= `${deck.name} Back`;
    back.text ||= "";
    changed = true;
  }

  if (changed) {
    update.faces = faces;
    update.back = back;
  }

  return changed ? update : null;
}

Hooks.once("ready", async () => {
  if (!game.user?.isGM) return;

  let updatedCards = 0;
  let updatedDecks = 0;

  for (const deck of game.cards ?? []) {
    const deckImg = migratePath(deck.img);
    if (deckImg !== deck.img) {
      await deck.update({ img: deckImg });
      updatedDecks += 1;
    }

    const cardUpdates = Array.from(deck.cards)
      .map((card) => migrateCardSource(card, deck))
      .filter(Boolean);

    if (cardUpdates.length) {
      await deck.updateEmbeddedDocuments("Card", cardUpdates);
      updatedCards += cardUpdates.length;
    }
  }

  if (updatedDecks || updatedCards) {
    ui.notifications.info(
      `Cards by Kaciquehn: updated image paths for ${updatedDecks} deck(s) and ${updatedCards} card(s).`
    );
  }
});
