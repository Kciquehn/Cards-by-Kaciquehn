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

  // 1. Migrate the Compendium Pack database on disk
  const pack = game.packs.get(`${MODULE_ID}.decks`);
  if (pack) {
    const wasLocked = pack.locked;
    try {
      if (wasLocked) await pack.configure({ locked: false });
      
      const documents = await pack.getDocuments();
      let compendiumUpdatedDecks = 0;
      let compendiumUpdatedCards = 0;

      for (const doc of documents) {
        let deckChanged = false;
        const deckImg = migratePath(doc.img);
        if (deckImg !== doc.img) {
          await doc.update({ img: deckImg });
          compendiumUpdatedDecks += 1;
        }

        const cardUpdates = [];
        for (const card of doc.cards) {
          let changed = false;
          const cardSource = card.toObject();

          const faces = cardSource.faces.map((face) => {
            const img = migratePath(face.img);
            if (img !== face.img) {
              face.img = img;
              changed = true;
            }
            return face;
          });

          const back = foundry.utils.deepClone(cardSource.back ?? {});
          const backImg = migratePath(back.img);
          if (backImg !== back.img) {
            back.img = backImg;
            changed = true;
          }
          if (!back.img && doc.img) {
            back.img = doc.img;
            back.name ||= `${card.name} Back`;
            back.text ||= "";
            changed = true;
          }

          if (changed) {
            cardUpdates.push({
              _id: card.id,
              faces,
              back
            });
          }
        }

        if (cardUpdates.length) {
          await doc.updateEmbeddedDocuments("Card", cardUpdates);
          compendiumUpdatedCards += cardUpdates.length;
        }
      }

      if (compendiumUpdatedDecks || compendiumUpdatedCards) {
        ui.notifications.info(
          `Cards by Kaciquehn: Compêndio atualizado! Corrigidos ${compendiumUpdatedDecks} baralhos e ${compendiumUpdatedCards} cartas no banco de dados local.`
        );
      }
    } catch (err) {
      console.error("Erro ao migrar compêndio:", err);
    } finally {
      if (wasLocked) await pack.configure({ locked: true });
    }
  }

  // 2. Migrate existing world cards if any
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
      `Cards by Kaciquehn: Atualizados caminhos no mundo para ${updatedDecks} baralho(s) e ${updatedCards} carta(s).`
    );
  }
});

