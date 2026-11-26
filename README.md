# rpg-convers

An RPG conversation box for the browser. Each line is typed out letter by letter, and every letter lands with its own small animation. The box also has:

- a name plate on the speaker's side;
- an optional portrait;
- a short typing sound, with a different voice for each speaker;
- a burst of sparks off the last letter;
- a box that rises in and sinks away.

There are four themes, and you can put any image behind the words.

```js
import Conversation from "rpg-convers"

const conv = new Conversation(document, 30, "./images/frame.webp", "oldgold")

conv.startConversation([
    { name: "Kraun", message: "Ah, a new face. Fresh recruit, unless I miss my guess.", isLeft: false },
    { name: "You",   message: "Who are you?", isLeft: true, imageDirectory: "./images/me.webp" },
], 0, () => console.log("the conversation is over"))
```

## new Conversation(document, speed, background, theme, options)

| argument | |
|---|---|
| `document` | the page's document |
| `speed` | milliseconds per letter (default `45`) |
| `background` | an image laid behind the words, stretched to the box; `null` for the theme's own look |
| `theme` | `"oldgold"`, `"blackpanther"`, `"whiteheaven"` or `"oldrpg"` (default `"oldgold"`) |
| `options` | see below. The third argument can be the options object itself: `new Conversation(document, 30, { theme: "oldrpg", sound: false })` |

### Options

| option | default | |
|---|---|---|
| `theme` | `"oldgold"` | as above |
| `background` | `null` | as above |
| `backgroundSize` | `"100% 100%"` | CSS `background-size` for the image (`"cover"` keeps its proportions) |
| `sound` | `true` | the typing voice |
| `volume` | `0.5` | its volume, 0 to 1 |
| `clickToAdvance` | `true` | a tap anywhere on the box does what the button does |
| `keys` | `[]` | keys that advance while the box is open, e.g. `["Enter"]` |
| `loadFonts` | `true` | adds the theme's Google Fonts to the page |
| `showName` | `true` | the speaker's name plate |
| `buttonLabel` | `"Next"` | the button's word when a line has no `btnName` |
| `bottom`, `width`, `zIndex` | | CSS overrides for where it sits (`zIndex` defaults to 900, over most game HUDs) |

## Themes

| theme | look | letters | voice |
|---|---|---|---|
| `oldgold` | dark leather and ebony with gold edges and engraved capitals | rise and glint gold | a quill's dry tick |
| `blackpanther` | obsidian and violet energy: angular, with a charge running along the edges | flicker on like neon | a deep synth thrum |
| `whiteheaven` | pearl and marble in soft gold, with light falling through | bloom out of a glow | a whisper of air |
| `oldrpg` | the classic blue window with a white border | pixel letters pop on | the old square-wave blip |

## Messages

`{ name, message, isLeft, btnName, imageDirectory }`

- **`name`**: shown on the name plate. It also sets the voice's pitch, so each speaker sounds a little different.
- **`isLeft`**: which side the speaker is on. The name plate and portrait go to that side.
- **`btnName`**: the button's word for this line.
- **`imageDirectory`**: the speaker's portrait, standing on the box at their side.
- **`message`**: the text. It is HTML, so only pass text you wrote, never text a player typed.
  - `<b>`, `<strong>` and `<em>` come out in the theme's accent colour.
  - A word in capitals of 3 or more letters (`NEVER`) is shouted: it slams in and shakes the box.
  - The typing pauses after commas and full stops, the way a voice would.

A tap while a line is still typing shows the rest of it at once. The callback runs once, after the last line, as the box closes.

## Methods

- `startConversation(messages, startIndex, callback)`
- `popAMessage(message, ms)`: one line that closes by itself
- `show(message, isLeft, btnName)`: a whole line at once
- `open()`, `close()`, `isOpen`
- `setTheme(name)`, `setBackground(url, size)`, `setSpeed(ms)`, `setSound(on)`, `setVolume(v)`
- `destroy()`

The elements from 1.x are still there: `mainContainer`, `convText`, `convNextBtn` and `convCharacImg`.

## From 1.x

2.0 is an ES module (`import`, not `require`). The box is styled by an injected stylesheet instead of inline styles, and the elements have new class names. `new Conversation(document, speed)` still works and gets the `oldgold` theme.
