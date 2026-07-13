# beatbaker
BeatBaker is a web based beat maker built with TypeScript. It allows users to create drum patterns and melodies on an interactive step sequencer, play them back in real time, and export their creations as WAV audio files.

## Features

### Piano Sequencer

* 6 rows of notes arranged in a step grid
* Click cells to add or remove notes
* Real-time playback using synthesized square-wave tones
* Multiple notes can play simultaneously to create chords

### Drum Machine

* Kick drum track
* Snare drum track
* Program rhythms using a 16-step sequencer
* Synthesized drum sounds generated directly in the browser

### Playback Controls

* Play and stop beat patterns
* Spacebar shortcut to start or stop playback
* Visual playhead showing the current step
* Clear button to reset the entire pattern

### Tempo Control

* Adjustable BPM from 60 to 180
* Tempo updates instantly during playback
* Current BPM value displayed in the interface

### Volume Control

* Master volume slider
* Controls piano and drum output together

### Theme System

* Dark mode and light mode support
* Animated theme transitions
* Theme preference saved using local storage

### WAV Export

* Export a complete 16-step loop as a WAV audio file
* Includes piano notes, kick drum, and snare drum
* Download generated audio directly from the browser
* No server required

## Keyboard Shortcuts

| Key   | Action      |
| ----- | ----------- |
| Space | Play / Stop |

## How to Use

1. Click cells in the Piano grid to place notes.
2. Click cells in the Drum grid to add kicks and snares.
3. Adjust BPM and volume as desired.
4. Press Play or hit Spacebar.
5. Use the Download WAV button to export your beat.

## Technologies Used

* TypeScript
* HTML5
* CSS3
* Web Audio API
* OfflineAudioContext for audio rendering and export

## Project Structure

```text
BeatBaker/
├── index.html
├── src/
│   └── index.ts
├── style/
│   └── style.css
└── dist/
    └── index.js
```