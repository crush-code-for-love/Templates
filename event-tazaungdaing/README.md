# Tazaungdaing Lantern Letter

A reusable, first-person festival confession letter made with plain HTML, CSS, and JavaScript. No installation, build tools, libraries, or backend.

The opening keeps the held heart lantern and torch in sharp focus, with small distant lanterns and a gold pagoda on the left. A distant city skyline, waving hands, recording phones, drifting haze, soft festival lights, and gently swaying crowd groups take inspiration from Tazaungdaing 1. Rose, peach, and champagne hearts keep opaque paper and a shallow opening. A gentle 12-degree tilt reveals a warm full moon.

## Open and play

Double-click `index.html` in this folder. Keep `css/` and `js/` beside it. Grab the torch by its flame or handle, drag its flame to the wick, and hold for about 2.5 seconds. Hovering does not move the torch. The supplied golden hour recording begins at 1:57 as soon as the torch flame first touches the fuel; grabbing alone is silent, and later heat changes do not restart the song. Keyboard: Tab to the scene, then hold Space or Enter. The camera looks up from a fixed eye height as your lantern rises away. A second lantern travels forward from behind the viewer, passes overhead, and keeps its constant upward speed when the note detaches. At liftoff, the greeting “ပျော်ရွှင်စရာ တန်ဆောင်တိုင် ဖြစ်ပါစေ” and fireworks run for five seconds. The already-written love note detaches, sways down, turns from portrait to landscape in midair, and settles flat against the screen. Close it with the top-right × (or Escape), then scroll, swipe, or use Up/Down arrows to look between the crowd and sky. After closing, one additional I ♥ U formation rises at the ordinary lantern speed while the existing lanterns continue untouched. Long letters scroll inside the landscape paper.

The Google Fonts stylesheet needs internet access for Noto Sans Myanmar. Without it, the browser uses Myanmar Text or another available system font. The scene itself runs locally; audio files are optional.

## Personalize

Edit `js/config.js`, save, and refresh the page:

- `letter.greeting`, `letter.body` (one string per paragraph), and `letter.signature` contain the letter.
- Set `letter.anonymous: true` to display `anonymousHint` instead of the signature.
- `language` selects `my` or `en` interface strings. The letter is your own text in either mode.
- `festival`, `paper`, `world.palette`, `colors`, and `note` control sky, lantern, flame, paper, and text colors. Use six-digit hex colors for glow sprites.
- `timings` controls lighting and opening hints. `camera.lookUpDuration` controls the look-up; `letterLantern.noteFallDuration` controls the paper flight. Values are seconds; use positive durations.
- `world.count` controls the fixed population (120 normal / 60 lite, including the held and letter lanterns). `counts` controls stars and torch particles. Keep lite values no greater than normal values.
- `camera` controls pitch in degrees, focal length, and fixed eye height. `world` controls depth, size, rise speed, sway, and wind drift. `focus` controls cached blur and focus transitions. `festival` controls the pagoda colors/position, haze, crowd sway, and light pulse. `letterLantern` controls its behind-viewer origin, continuous forward/rise speeds, note release time, thread, and note.
- `celebration` controls the five-second greeting, spark counts, and recorded firework volume.
- `formation` controls the one-time I ♥ U group: depth, width, and height. It adds 48 lanterns (24 in lite mode), retires after leaving the view, and never replaces the existing festival population.
- `explore` controls the unlocked camera range and wheel/swipe sensitivity after closing the note.

All displayed letter and URL text uses `textContent`; markup remains plain text. A share URL can override the greeting and body using `?to=...&msg=...`. Use `encodeURIComponent` when constructing each value, or use `URLSearchParams`:

```js
const link = new URL('https://your-host.example/');
link.searchParams.set('to', 'မင်း');
link.searchParams.set('msg', 'ပထမစာကြောင်း\nဒုတိယစာကြောင်း');
console.log(link.href);
```

`to` is limited to 80 characters, `msg` to 4,000; limits are editable under `sharing`. URL messages are visible to anyone who has the link. A static template does not keep its default letter secret from visitors who inspect its files.

## How the code fits together

- `main.js`: phase controller, input, replay, frame loop, performance and audio controls.
- `scene.js`: cached sky, stars, human silhouettes and temple; perspective projection from a fixed eye height.
- `lantern.js`: one shared heart-shaped paper renderer, cached sharp/blurred sprites, progressive heat, and the separate letter lantern’s note.
- `torch.js`: following torch, flickering flame, pooled embers, release fade.
- `crowd.js`: bounded 3D lantern pool, depth sorting, continuous rise paths, and replacements below the current view.
- `celebration.js`: pooled heart-shaped firework sparks and a real fireworks recording.
- `letter.js`: HTML note flight, safe text creation, written paper flight and close control.
- `css/style.css`: responsive canvas, paper texture, unfolding, typography and controls.
- `assets/`: empty until you add optional audio.

The state sequence is `IDLE -> LIGHTING -> LIFTOFF -> ASCENT -> MINGLE -> NOTE_DROP -> READING -> EXPLORE`. Replay returns to IDLE with fresh actors and particle pools, retaining the user's lite/sound preference. The canvas projects meter-based world coordinates into CSS pixels, with a device-pixel ratio cap of 2, cached drawings, and delta-time animation. The camera never translates. All lanterns exist at startup, including overhead objects that become visible when looking up. Outgoing lantern slots are reused below the view so the festival keeps rising indefinitely. Hidden tabs pause the story and audio.

## Performance and accessibility

The Sound control appears after the opening delay; the Lite button and post-letter caption are removed. Lite mode reduces lantern and particle work, and retains only one cached blur level. It also activates after roughly two seconds of consecutive frames below 24 fps; the threshold is configurable. Reduced-motion preferences use fades instead of camera rotation and paper flight, with stationary background lanterns and no sway or torch embers. Myanmar paragraphs are already written and remain intact throughout the paper flight. Text waits for `document.fonts.ready`.

## Optional sound

Add your own licensed files, then set paths under `audio`, for example:

```js
audio: { enabled: false, match: 'assets/match.mp3', crackle: 'assets/crackle.mp3', wind: 'assets/wind.mp3' }
```

The five-second heart fireworks use a public-domain recording by Stephan from SoundBible. golden hour starts at 117 seconds on first torch-flame contact with the fuel and softens during the note; both pause when the tab is hidden. See assets/AUDIO-CREDITS.md for sources. Sound starts enabled and can be muted with the Sound button. `match` plays once when lighting starts; crackle and wind loop in their respective phases. The music and fireworks files are included locally; optional extra tracks are loaded only when configured. Missing or blocked files turn audio off without interrupting the visual journey. The Sound toggle controls music, the recorded fireworks, and optional tracks.

## Host it

No deployment has been made for you. Upload the contents of this folder, with `index.html` at the site's root.

### GitHub Pages

Create a public repository and upload `index.html`, `css/`, `js/`, and any assets. In Settings > Pages, choose **Deploy from a branch**, select your branch and **/(root)**, and save. Open the published link once deployment finishes. See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Netlify Drop

Sign in to [Netlify Drop](https://app.netlify.com/drop) and drag the `lantern-letter` folder into the drop area. The folder must directly contain `index.html`. Upload the updated folder again to deploy edits. See [Netlify's manual deployment guide](https://docs.netlify.com/deploy/create-deploys/). Hosting is subject to each service's account and usage limits.

## Verification

JavaScript syntax and mocked DOM/canvas checks cover the phase sequence, 60/120 Hz behavior, resizing, reduced motion, URL text, anonymous mode, audio failure, lite mode, and replay. A real browser visual review remains outstanding because the available browser tool rejected local-file access. Before sharing, open the page yourself on your target phone and desktop, complete the story, scroll the letter, try replay, and test your optional audio files.

Latest checks also cover constant note-lantern velocity before/after detachment, five-second greeting/fireworks, sound mute cutoff, a ten-minute replenishment simulation, and close-to-explore controls. Browser visual and audible review remains outstanding.

Latest animation checks cover the portrait-to-landscape quarter-turn and one-time formation flight on desktop, portrait mobile, and lite mode without growing the lantern pool.

Interaction checks: pointer hover and off-torch clicks do not move the torch or start music; grabbing and dragging lights the wick; music begins at 117 seconds once, on first fuel contact; mute, hidden-tab pause/resume, and reset work in simulated mobile and desktop runs.

GitHub update: MP3 files are intentionally omitted from this commit. Add assets/golden-hour.mp3 and assets/fireworks.mp3 separately to enable the configured audio.
