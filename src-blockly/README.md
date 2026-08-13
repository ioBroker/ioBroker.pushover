# Blockly blocks

Source of `admin/blockly.js`, the two blocks ioBroker.javascript's Blockly editor shows in its
`sendTo` category - `pushover` (notification) and `glances` (the Glances widget).
**`admin/blockly.js` is generated - never edit it directly.**

```bash
npm run build:blockly   # type check + bundle into admin/blockly.js
```

`npm run build` runs it too, so a release always ships a bundle that matches this source.

The bundle stays committed: installations from GitHub do not run `prepublishOnly`, so the built file
has to be in the repository.

| file | |
|---|---|
| `blockly.ts` | entry point, installs the words and both blocks |
| `blocks/pushover.ts`, `blocks/glances.ts` | one block each |
| `helpers.ts` | the dropdowns, the log line and the generator registration they share |
| `sounds.ts` | the sound list |
| `words.ts`, `i18n/*.json` | the words |

## Take the types from `blockly`, the runtime from `window`

`blockly` is a **dev** dependency - it contributes types and nothing else:

```ts
import type { Block } from 'blockly/core';

const Blockly = window.Blockly;
```

Never `import * as Blockly from 'blockly/core'` here. The editor loads this file long after it has
created its own Blockly instance, and an import would bundle a *second*, private one. The blocks
would register themselves on that private instance and stay invisible to the editor - with no error
anywhere.

The globals the editor provides (`window.Blockly` including its ioBroker extras `Words`, `Translate`
and `Sendto`, plus `window.main` and `window.systemLang`) are declared in `iobroker-blockly.d.ts`.

## Words

`i18n/*.json` holds one file per language, keyed by word - the layout `translate-adapter` expects,
which is why `npm run translate` passes `-b src-blockly/i18n/en.json` next to the admin base file.
`words.ts` imports them and turns them inside out into `Blockly.Words` (keyed by word, then
language).

A language file is allowed to be incomplete: `Blockly.Translate` falls back to English for a word it
does not find, which is what the hand-written table relied on - outside en/de/ru only the four
`glances_*` words were ever translated. Run `npm run translate` to fill the gaps.

The two help URLs are not in there. They are links, not words, so `words.ts` sets them directly.

They are bundled rather than fetched: the editor loads `admin/blockly.js` as a classic script and
`Blockly.Words` has to be filled before the blocks register themselves, so there is no point at which
the files could be loaded over the network.

## Registering the generator

```ts
Blockly.JavaScript.forBlock.pushover = …;
```

Blockly 10 removed the fallback that used to look generators up as `Blockly.JavaScript.<type>`. The
editor migrates that old slot to `forBlock`, but older editors did so *before* loading any adapter's
`blockly.js`, so a block registered the old way was never migrated and failed with _"generator does
not know how to generate code for block type"_. `registerGenerator()` therefore writes to `forBlock`
directly and falls back to the old slot only for editors too old to have it.

## Traps this code works around

- **`valueToCode` returns an empty string** for an unconnected input. Emitting `message: ,` or
  `'…' + )` is a syntax error that takes the user's whole script down, so those parts are left out.
- **The generated code is text, not a value.** `parseInt` on it yields `NaN` for anything that is not
  a bare literal, so `glances` rounds its count and percent where the script runs, not while it is
  generated.
- **Connection checks are case sensitive.** `setCheck('number')` matches nothing - number blocks
  output `Number`.
