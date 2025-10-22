# Forest Forager: Rites of the Grove

An expanded top-down adventure that uses the supplied SVG assets to stage a twelve-rite pilgrimage across a sprawling forest. Each rite introduces new gathering goals, meditation rituals, and regions to explore. Completing the cycle requires at least an hour of real-time play as you forage offerings and hold extended meditations within the shrines.

## Play the game

1. Serve the project directory with any static file server. For example:
   ```bash
   python -m http.server 8000
   ```
2. Open [http://localhost:8000](http://localhost:8000) in your browser.
3. Use the **WASD** or **arrow** keys to move, hold **Shift** to sprint, hold **Space** to meditate when you stand within the glowing shrine, press **M** to open the world map, and press **R** to restart the entire pilgrimage.

> **Tip:** Every rite ends with a five-minute meditation. Stay inside the shrine while holding Space to maintain progress—stepping away resets the timer. Plan your foraging routes so you can settle in comfortably before beginning each ritual.

## Game structure

- **World scale:** A 5,600 × 5,600 pixel forest with hundreds of obstacles, twelve shrines, and rotating collectible spawns for each rite.
- **Quest chain:** Twelve sequential rites with unique narrative prompts, offering requirements, and shrine destinations. Gather the requested items before meditating.
- **Meditation system:** After finishing the offering for a rite you must meditate for five continuous minutes. The complete pilgrimage therefore lasts at least one hour even for efficient foragers.
- **Navigation aids:** A quest log, inventory tracker, seasonal clock, meditation progress meter, and an in-game world map to monitor shrines and collectibles.

## Project structure

```
.
├── assets/           # SVG artwork used for the player, environment, and offerings
├── index.html        # Markup for the adventure interface
├── main.js           # World generation, quest chain, and canvas renderer
└── styles.css        # Layout and visual styling for the HUD and map
```

All assets remain lightweight inline-friendly SVGs so the game loads instantly without additional tooling.
