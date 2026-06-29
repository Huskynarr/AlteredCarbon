# Altered Carbon | Cortical Stack & DHF WebGL Visualizer

A high-performance 3D WebGL visualization of the Psychasec Cortical Stack and Digital Human Freight (DHF) memory transfer interface inspired by *Altered Carbon*. Built with Three.js, GSAP, and Vite.

## 🚀 Features

- **Interactive 3D Cortical Stack Model**: Procedurally rendered titanium outer casing, bioluminescent DHF memory capsule, double-helix quantum storage threads, spinal interface needles, and floating holographic telemetry rings.
- **Exploded View Assembly**: Interactively disassemble the Cortical Stack into individual components along the spinal axis.
- **DHF Needle Cast Simulator**: High-speed quantum particle transfer stream simulating consciousness upload/download to a sleeve.
- **Dynamic Aesthetic Themes**:
  - *Envoy Cyan* (Takeshi Kovacs Cyberpunk default)
  - *Meth Gold* (Bancroft luxury aesthetic)
  - *Psychasec Violet* (Clean corporate facility)
  - *Red Alert* (Emergency override)
- **Web Audio API Sound Engine**: Synthesized sci-fi acoustic effects for UI clicks, stack locking mechanisms, low-frequency hums, and needle casting.
- **Camera Presets**: Quick focus on overall orbit, core quantum threads, or spinal needles.

## 🛠️ Tech Stack

- **Core**: Three.js, Vite, HTML5 / Vanilla JavaScript (ES Modules)
- **Animation & FX**: GSAP, Canvas Confetti
- **Audio**: Web Audio API
- **Deployment**: GitHub Pages via GitHub Actions workflow

## 💻 Local Development

```bash
# Clone repository
git clone git@github.com:Huskynarr/AlteredCarbon.git
cd AlteredCarbon

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

## 🌐 GitHub Pages Deployment

Automatic deployment is configured via `.github/workflows/deploy.yml` whenever changes are pushed to the `main` branch. Alternatively, run:

```bash
npm run deploy
```
