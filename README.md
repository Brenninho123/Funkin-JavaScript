# Friday Night Funkin (JS Port)

This is a JavaScript/PixiJS port of Friday Night Funkin, a game originally made for Ludum Dare 47 "Stuck In a Loop".

Play the Ludum Dare prototype here: https://ninja-muffin24.itch.io/friday-night-funkin
Play the Newgrounds one here: https://www.newgrounds.com/portal/view/770371
Support the project on the itch.io page: https://ninja-muffin24.itch.io/funkin

## Credits / shoutouts

- [ninjamuffin99](https://twitter.com/ninja_muffin99) - Programmer
- [PhantomArcade3K](https://twitter.com/phantomarcade3k) and [Evilsk8r](https://twitter.com/evilsk8r) - Art
- [Kawaisprite](https://twitter.com/kawaisprite) - Musician
- Brenninho - JS/PixiJS port

This game was made with love to Newgrounds and its community. Extra love to Tom Fulp.

## Tech stack

- JavaScript (ES modules)
- [PixiJS](https://pixijs.com/) for rendering
- [Vite](https://vitejs.dev/) for dev server and bundling
- Web Audio (via `HTMLAudioElement`) for sound

## Build instructions

### Requirements

- [Node.js](https://nodejs.org/) 18+
- npm

### Setup

```bash
npm install
```

### Development

```bash
npm start
```

This launches Vite's dev server (default port 8080) with hot reload.

### Production build

```bash
npm run build
```

Output goes to `export/release/html5/`. Serve that folder with any static file host.

## Project structure

```
projeto/
├── package.json
├── vite.config.js
├── index.html
├── assets/
├── src/
│   ├── main.js
│   ├── core/
│   ├── sprites/
│   ├── states/
│   ├── substates/
│   ├── shaders/
│   └── ui/
└── public/
```

## License

See original project license terms from the Friday Night Funkin repository.
