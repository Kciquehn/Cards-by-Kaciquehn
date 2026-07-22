import assert from "node:assert/strict";

const callbacks = {};
globalThis.Hooks = {
  once(name, callback) {
    callbacks[name] = callback;
  }
};
globalThis.foundry = { utils: { deepClone: structuredClone } };

const settings = new Map();
const embeddedUpdates = [];

function makeCard(image, backImage = "") {
  return {
    id: "card1",
    name: "Card",
    faces: [{ img: image }],
    back: { img: backImage },
    toObject() {
      return structuredClone({ faces: this.faces, back: this.back });
    }
  };
}

function makeDeck(image, card) {
  return {
    img: image,
    cards: [card],
    async update(data) {
      Object.assign(this, data);
    },
    async updateEmbeddedDocuments(type, data) {
      embeddedUpdates.push({ type, data });
    }
  };
}

const moduleDeck = makeDeck(
  "modules/foundryvtt-cards/images/gray_back.png",
  makeCard("modules/foundryvtt-cards/images/ace_of_spades.png")
);
const unrelatedDeck = makeDeck("icons/svg/card-hand.svg", makeCard("icons/svg/card-joker.svg"));

globalThis.game = {
  user: { id: "gm" },
  users: { activeGM: { id: "gm" } },
  cards: [moduleDeck, unrelatedDeck],
  settings: {
    register() {},
    get: () => settings.get("migration") ?? 0,
    set: async (_module, _key, value) => settings.set("migration", value)
  },
  i18n: {
    format: () => "migration complete",
    localize: () => "migration failed"
  }
};
globalThis.ui = {
  notifications: {
    info() {},
    error() {
      assert.fail("Migration reported an unexpected failure");
    }
  }
};

await import("./migrate-card-images.mjs?test=1");
callbacks.init();
await callbacks.ready();

assert.equal(moduleDeck.img, "modules/cards-by-kaciquehn/images/gray_back.png");
assert.equal(embeddedUpdates.length, 1);
assert.equal(embeddedUpdates[0].type, "Card");
assert.equal(
  embeddedUpdates[0].data[0].faces[0].img,
  "modules/cards-by-kaciquehn/images/ace_of_spades.png"
);
assert.equal(embeddedUpdates[0].data[0].back.img, moduleDeck.img);
assert.equal(unrelatedDeck.img, "icons/svg/card-hand.svg");
assert.equal(settings.get("migration"), 1);

console.log("Migration scope test passed.");
