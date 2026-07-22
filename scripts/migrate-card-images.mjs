const MODULE_ID = "cards-by-kaciquehn";
const MIGRATION_SETTING = "imagePathMigration";
const MIGRATION_VERSION = 1;
const NEW_PREFIX = `modules/${MODULE_ID}/images/`;
const OLD_PREFIXES = [
  "modules/foundryvtt-cards/images/",
  "modules/FoundryVTTCards/images/",
  "modules/Cards-by-Kaciquehn/images/",
  "modules/Cards by Kaciquehn/images/"
];

function isModuleImage(value) {
  if (typeof value !== "string") return false;
  return value.startsWith(NEW_PREFIX) || OLD_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function migratePath(value) {
  if (typeof value !== "string") return value;
  for (const prefix of OLD_PREFIXES) {
    if (value.startsWith(prefix)) return value.replace(prefix, NEW_PREFIX);
  }
  return value;
}

function isModuleDeck(deck) {
  if (isModuleImage(deck.img)) return true;
  return Array.from(deck.cards ?? []).some((card) => {
    if (isModuleImage(card.back?.img)) return true;
    return Array.from(card.faces ?? []).some((face) => isModuleImage(face.img));
  });
}

function prepareCardUpdate(card, deckImg) {
  const source = card.toObject();
  const faces = source.faces.map((face) => {
    const copy = foundry.utils.deepClone(face);
    copy.img = migratePath(copy.img);
    return copy;
  });
  const back = foundry.utils.deepClone(source.back ?? {});
  back.img = migratePath(back.img);

  if (!back.img && deckImg) {
    back.img = deckImg;
    back.name ||= `${card.name} Back`;
    back.text ||= "";
  }

  const facesChanged = faces.some((face, index) => face.img !== source.faces[index]?.img);
  const backChanged = back.img !== source.back?.img;
  if (!facesChanged && !backChanged) return null;

  return { _id: card.id, faces, back };
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, MIGRATION_SETTING, {
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
});

Hooks.once("ready", async () => {
  if (game.users.activeGM?.id !== game.user.id) return;
  if (game.settings.get(MODULE_ID, MIGRATION_SETTING) >= MIGRATION_VERSION) return;

  let updatedCards = 0;
  let updatedDecks = 0;

  try {
    for (const deck of game.cards ?? []) {
      if (!isModuleDeck(deck)) continue;

      const deckImg = migratePath(deck.img);
      if (deckImg !== deck.img) {
        await deck.update({ img: deckImg });
        updatedDecks += 1;
      }

      const cardUpdates = Array.from(deck.cards ?? [])
        .map((card) => prepareCardUpdate(card, deckImg))
        .filter(Boolean);

      if (cardUpdates.length) {
        await deck.updateEmbeddedDocuments("Card", cardUpdates);
        updatedCards += cardUpdates.length;
      }
    }

    await game.settings.set(MODULE_ID, MIGRATION_SETTING, MIGRATION_VERSION);

    if (updatedDecks || updatedCards) {
      ui.notifications.info(
        game.i18n.format("CARDSBYKACIQUEHN.MigrationComplete", {
          decks: updatedDecks,
          cards: updatedCards
        })
      );
    }
  } catch (error) {
    console.error(`${MODULE_ID} | Image path migration failed`, error);
    ui.notifications.error(game.i18n.localize("CARDSBYKACIQUEHN.MigrationFailed"));
  }
});
