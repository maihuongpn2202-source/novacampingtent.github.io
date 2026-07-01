# Tent Defender: Survive the Storm

## Overview
Tent Defender: Survive the Storm is an educational simulation game that demonstrates the importance of modern camping tent technologies through interactive gameplay. Instead of simply reading about a tent's features, players experience how different weather conditions affect camping safety and learn how each feature protects the tent.

The game combines entertainment with product education, making it suitable for product demonstrations, exhibitions, and innovation competitions.

## Story
You are an outdoor camper spending several days in the wilderness. Every day, the weather changes unexpectedly. Your mission is to protect your tent, keep it comfortable, and survive until the end of the camping trip.

To succeed, you must activate the correct tent features at the right time before dangerous weather damages your shelter.

## Gameplay
Players manage a smart camping tent while facing dynamic weather conditions.

Possible weather includes:
- ☀️ Sunny
- ☁️ Cloudy
- 🌧️ Heavy Rain
- 🌪️ Strong Wind
- ⛈️ Thunderstorm

Each weather condition requires different strategies. For example:
- Heavy rain requires the **Waterproof System**.
- Strong winds require **Strong Stakes**.
- Sunny weather lets the **Solar Fan** improve comfort and recharge the battery.
- Thunderstorms demand both Waterproof and Stakes at once.

Wrong decisions reduce the tent's safety, comfort, and durability. Running out of safety or durability ends the trip early; surviving all days completes it.

## Main Features
- Dynamic, weighted-random weather system with a "next weather" forecast
- Interactive tent upgrades (Waterproof, Stakes, Solar Fan) toggled live
- Real-time safety, comfort, battery, and durability monitoring
- Canvas-rendered rain, wind, and lightning effects
- Ambient animated topographic backdrop
- Survival scoring system with ranks (Novice Camper → Storm Master)

## Smart Tent Technologies
**Waterproof Fabric** — Prevents rainwater from leaking into the tent and protects campers during heavy rain and storms.

**Strong Stakes** — Keeps the tent stable during strong winds and storms.

**Solar Fan** — Uses solar energy to improve ventilation, reduce interior temperature, and recharge the battery when run in the sun.

**Smart Weather Awareness** — Players must read the weather gauge and forecast, then react before conditions turn.

## Objective
Survive the entire camping trip while maintaining the highest possible levels of Safety, Comfort, Battery, and Tent Durability. The better your resource management, the higher your final score.

## Project Structure
```
TentDefender/
│
├── index.html      # Page structure and HUD markup
├── style.css        # Field-journal / topographic visual theme
├── game.js           # Main loop, state, scoring, canvas rendering
├── weather.js         # Weather system and stat-effect rules
├── particles.js        # Rain / wind / lightning particle effects
├── ui.js                # DOM updates, buttons, overlays
├── assets/
│   ├── tent.svg
│   ├── tree.svg
│   ├── cloud.svg
│   ├── sun.svg
│   ├── rain.svg
│   └── lightning.svg
└── README.md
```

## Running the Game
No build step or server is required. Open `index.html` directly in a modern desktop browser (Chrome, Firefox, Edge, Safari), or serve the folder with any static file server.

## Educational Purpose
This project is designed to demonstrate how innovative camping equipment can improve outdoor safety, comfort, and sustainability. Instead of presenting product features in a traditional slideshow, the game allows users to interact with those features in realistic scenarios, creating a more engaging learning experience.

## Target Audience
- Outdoor enthusiasts and campers
- Students and STEM education participants
- Product exhibition visitors and innovation competition judges

## Technologies
- HTML5
- CSS3
- JavaScript
- HTML5 Canvas API

## Future Improvements
- Multiplayer mode
- Additional weather conditions
- Multiple camping locations
- More smart tent technologies
- Achievement system
- Mobile optimization
- Online leaderboard

## Project Goal
The goal of Tent Defender is to transform a camping tent from a passive product into an interactive learning experience. Through gameplay, users discover why modern tent technologies are important and how they improve camping safety in real-world situations.
