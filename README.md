# New Decks of Cards for FoundryVTT

- The Great Dalmuti
- 54 Playing Cards (standard 52 card deck + 2 Jokers)
- Three Dragon Ante
- Tarot Card Deck
- Dragon Age Deck
- Tarokka Deck

## To install in Foundry VTT v13

- Place this folder at `Data/modules/foundryvtt-cards`.
- Restart Foundry VTT.
- Enable **FoundryVTT Cards** in your world.

All the new card decks will be available for you to import from a compendium with the name **FoundryVTT Cards**.

Happy Gaming!

![Screen Shot](support/screenshot.png)

## Development information

### make the deck(s)

```shell
./make.sh
```

### Re-deploy

```shell
cd ~/foundryvtt_test/Data/modules/FoundryVTTCards && \
sudo rm -Rf * && \
sudo unzip ~/FoundryVTTCards.zip && \
sudo chown -R foundry.foundry ../FoundryVTTCards && \
docker container restart foundryvtt_test
docker logs foundryvtt_test --follow | grep -i card
```
