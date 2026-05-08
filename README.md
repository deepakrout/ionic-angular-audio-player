# ionic-angular-audio-player

A reusable **Ionic 8 / Angular 19+** standalone component that renders a custom audio player with a **live-synced, auto-scrolling transcript panel**.

![Angular](https://img.shields.io/badge/Angular-19+-DD0031?logo=angular) ![Ionic](https://img.shields.io/badge/Ionic-8-3880FF?logo=ionic) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript) ![License: MIT](https://img.shields.io/badge/License-MIT-green)

## Features

- 🎵 Custom play/pause, ±10 s skip, and playback-speed controls
- 📜 Collapsible transcript panel driven by timed `Segments[]`
- ✨ Active segment highlighted and auto-scrolled into view using `getBoundingClientRect()`
- ♿ Fully accessible — ARIA roles, keyboard-navigable scrubber
- 🎨 Themed via CSS custom properties — zero Ionic-specific colour hard-coding
- 🏗️ Angular standalone component — drop into any page with one import

## Prerequisites

| Tool | Version |
|------|--------|
| Node.js | 20+ |
| Angular CLI | 19+ |
| Ionic CLI | 7+ |
| Capacitor (optional) | 6+ |

## Setup

```bash
# Clone
git clone https://github.com/deepakrout/ionic-angular-audio-player.git
cd ionic-angular-audio-player

# Install deps
npm install

# Serve
ionic serve
```

## File structure

```
src/
  app/
    shared/
      audio-player/
        audio-player.component.ts    ← component logic
        audio-player.component.html  ← template
        audio-player.component.scss  ← styles + CSS vars
        index.ts                     ← barrel export
    pages/
      demo/
        demo.page.ts
        demo.page.html
  assets/
    data/
      sample-audio.ts               ← AudioResource sample data
```

## Usage

### 1. Copy the component

Drop the `audio-player/` folder into your `src/app/shared/` directory.

### 2. Import into your page

```ts
import { AudioPlayerComponent, AudioResource } from 'src/app/shared/audio-player';

@Component({
  standalone: true,
  imports: [CommonModule, AudioPlayerComponent],
})
export class MyPage {
  audioList: AudioResource[] = [ /* your data */ ];
}
```

### 3. Add to your template

```html
<app-audio-player [audio]="audio"></app-audio-player>
```

## AudioResource interface

```ts
export interface AudioSegment {
  start_time: string;   // "HH:MM:SS"
  end_time: string | null;
  speaker?: string;
  text: string;
}

export interface AudioResource {
  Id: string;
  Title: string;
  SubTitle?: string;
  AudioURL: string;
  CaptionURL?: string;
  CaptionLang?: string;
  CaptionLabel?: string;
  Transcript?: string;  // flat fallback
  Segments?: AudioSegment[];  // drives live highlight
}
```

## Theming

All colours are CSS custom properties on `:host`:

```scss
app-audio-player {
  --ap-primary:       var(--ion-color-primary);
  --ap-primary-light: var(--ion-color-primary-tint);
  --ap-accent:        #f0a500;
}
```

## License

MIT
