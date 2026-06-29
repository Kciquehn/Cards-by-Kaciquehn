const MODULE_ID = "cards-by-kaciquehn";
const NEW_PREFIX = `modules/${MODULE_ID}/images/`;
const OLD_PREFIXES = [
  "modules/foundryvtt-cards/images/",
  "modules/FoundryVTTCards/images/",
  "modules/Cards by Kaciquehn/images/"
];

function migratePath(value) {
  if (typeof value !== "string") return value;
  for (const prefix of OLD_PREFIXES) {
    if (value.startsWith(prefix)) return value.replace(prefix, NEW_PREFIX);
  }
  return value;
}

function migrateCardSource(card) {
  const update = { _id: card.id };
  let changed = false;

  const faces = card.faces.map((face) => {
    const source = foundry.utils.deepClone(face);
    const img = migratePath(source.img);
    if (img !== source.img) {
      source.img = img;
      changed = true;
    }
    return source;
  });

  const back = foundry.utils.deepClone(card.back ?? {});
  const backImg = migratePath(back.img);
  if (backImg !== back.img) {
    back.img = backImg;
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

    const cardUpdates = deck.cards
      .map((card) => migrateCardSource(card))
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
