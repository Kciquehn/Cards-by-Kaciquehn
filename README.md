# Cards by Kaciquehn

[![Foundry VTT 13](https://img.shields.io/badge/Foundry_VTT-13-5c3c24)](https://foundryvtt.com/)
[![Foundry VTT 14](https://img.shields.io/badge/Foundry_VTT-14_ready_for_testing-5c3c24)](https://foundryvtt.com/)
[![Latest release](https://img.shields.io/github/v/release/Kciquehn/Cards-by-Kaciquehn?display_name=tag)](https://github.com/Kciquehn/Cards-by-Kaciquehn/releases/latest)
[![Issues](https://img.shields.io/github/issues/Kciquehn/Cards-by-Kaciquehn)](https://github.com/Kciquehn/Cards-by-Kaciquehn/issues)

Cards by Kaciquehn is a system-agnostic content module that adds six ready-to-use card decks to Foundry Virtual Tabletop. The decks are distributed through a compendium, so you can import only the ones needed in each world.

![Cards by Kaciquehn compendium preview](support/screenshot.png)

## Included decks

| Deck | Cards |
| --- | ---: |
| Dragon Age | 86 |
| Tarokka | 54 |
| Three-Dragon-Ante | 99 |
| Tarot | 78 |
| Standard Playing Cards, including two Jokers | 54 |
| The Great Dalmuti | 91 |
| **Total** | **462** |

## Features

- Six complete decks in a single `Cards` compendium.
- System-agnostic content that can be enabled in any game world.
- Local image assets with no external hosting dependency during play.
- Automatic, one-time migration for decks imported from earlier versions of the module.
- English and Brazilian Portuguese notifications.

## Compatibility

| Foundry VTT generation | Status |
| --- | --- |
| Version 13 | Verified |
| Version 14 | Supported by the module code; final runtime verification is pending |

The manifest intentionally has no maximum Foundry version. Version 13 remains the functional baseline.

## Installation

### Foundry package browser

After the module is accepted into the official Foundry package directory:

1. Open **Configuration and Setup**.
2. Select **Add-on Modules** and click **Install Module**.
3. Search for **Cards by Kaciquehn**.
4. Click **Install**.

### Manifest URL

Until the official listing is available, paste this URL into the **Manifest URL** field in Foundry's module installer:

```text
https://raw.githubusercontent.com/Kciquehn/Cards-by-Kaciquehn/refs/heads/main/module.json
```

You can also download the latest package from the [GitHub Releases page](https://github.com/Kciquehn/Cards-by-Kaciquehn/releases/latest).

## Usage

1. Enable **Cards by Kaciquehn** in the world's module management screen.
2. Open the **Compendium Packs** sidebar.
3. Open the **Cards by Kaciquehn** compendium.
4. Import the desired deck into the world.
5. Open the imported deck from the **Card Stacks** sidebar to shuffle, draw, deal, or reset cards using Foundry's standard card controls.

Existing decks imported from older releases are checked once for obsolete module image paths. The migration only touches decks that reference this module's assets.

## Support

- Report a problem or request an improvement through [GitHub Issues](https://github.com/Kciquehn/Cards-by-Kaciquehn/issues).
- Include the Foundry version, game system, module version, and browser console error when reporting a technical problem.
- Release history and update notes are available on the [Releases page](https://github.com/Kciquehn/Cards-by-Kaciquehn/releases).

## Development

The canonical package ID is `cards-by-kaciquehn`. For local development, the folder must be named accordingly:

```text
Data/modules/cards-by-kaciquehn
```

Run the complete validation suite before creating a release:

```shell
npm run validate
```

Releases are published from tags matching the version in `module.json`, for example `v2.0.2`. The release workflow builds `cards-by-kaciquehn.zip`, which is the asset consumed by Foundry's installer.

## Credits and legal notice

Originally created by [Jay Colson](https://github.com/jcolson) as FoundryVTT Cards. This continuation is maintained by [Kaciquehn](https://github.com/Kciquehn) with permission.

Foundry Virtual Tabletop is a trademark of Foundry Gaming, LLC. Other game names, card names, artwork, and trademarks belong to their respective owners. This is an unofficial, community-maintained module and is not affiliated with or endorsed by Foundry Gaming, LLC or the referenced game publishers.
