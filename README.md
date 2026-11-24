# bioONE — 3D Molecular Atlas

A cutting‑edge interactive spatial biology platform that visualizes molecular structures and dynamics in 3D. Explore DNA, mitochondrial electron transport chain, ATP synthase, and more with real‑time physics and immersive WebGL visualizations.

---

## Overview

**bioONE** is an interactive web‑based atlas for spatial biology, enabling researchers and educators to navigate, manipulate, and observe biomolecular systems in three dimensions. The platform combines high‑performance HTML5 Canvas double‑helix physics, interactive WebGL viewers for B‑DNA, and simulations of the Mitochondrial Electron Transport Chain (ETC) and ATP Synthase. Designed for seamless integration into web pages and educational tools, bioONE provides an engaging way to understand the physical and functional dynamics of life at the molecular scale.

---

## Key Scientific & Technical Features

- **60 FPS HTML5 Canvas Double‑Helix Physics** – Real‑time simulation of DNA strand dynamics with accurate torsional and bending forces, running at 60 frames per second on modern browsers.
- **Interactive 3D WebGL B‑DNA Viewer** – Fully rotatable, scalable, and selectable B‑DNA model with atom‑level detail, color‑coded elements, and intuitive controls.
- **Mitochondria Electron Transport Chain (ETC) Simulation** – Visualize electron flow through Complex I‑IV, proton pumping, and membrane potential dynamics.
- **ATP Synthase Simulation** – Observe rotational catalysis, proton‑driven synthesis, and ATP generation in real time.
- **Smooth Camera Controls** – Orbit, pan, and zoom using mouse/touch for comprehensive exploration of molecular interiors and surfaces.
- **Particle & Force Effects** – Visualize diffusion, conformational changes, and energy states with responsive visual feedback.
- **Responsive Design** – Adapts to desktop and mobile form factors while maintaining performance.

---

## Tech Stack

- **React** – Component‑based UI architecture.
- **Vite** – Fast development server and build tool.
- **Tailwind CSS** – Utility‑first styling for a clean, modern UI.
- **Three.js** – Core 3D rendering engine.
- **React Three Fiber** – React renderer for Three.js, enabling declarative scene composition.
- **HTML5 Canvas** – Custom double‑helix physics simulation.
- **ESLint / Prettier** – Code quality and formatting.

---

## Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:5173` (or the port indicated by Vite) to explore bioONE.

---

## Available Scripts

| Script      | Description                |
|------------|----------------------------|
| `npm run dev`   | Starts Vite dev server    |
| `npm run build` | Produces production build |
| `npm run lint`  | Runs ESLint               |
| `npm run fmt`   | Formats code with Prettier |

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

*bioONE — Visualizing the molecular world in 3D.*