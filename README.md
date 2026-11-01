# Physinanigans · Universe Tunnel Lab

**What if a universe looked like a tunnel?** Three spatial dimensions, a sequence of time slices, and extra visual layers for the information a picture of space cannot show.

This is Victor's fun thought experiment, developed into an educational JavaScript lab. The picture is imaginative; each implemented calculation uses a stated physical model. You can drag through quantum histories, change a universe's ingredients, and tilt an observer's definition of “now.”

![A tunnel of snapshots](assets/tunnel.svg)

## Try it

The site is live at <https://mklolbullen.github.io/physinanigans/>. To use it offline, download or clone the repository, then open **`index.html`** in a modern browser. Keep the folder together. The committed pages work offline without installation, an account, a server or runtime network requests. A browser with native MathML support displays the rendered equations; expandable LaTeX source is also included.

Alternatively, run `python3 -m http.server 8000` here and visit <http://localhost:8000>.

| Experiment | Drag or change | What is calculated |
|---|---|---|
| `wavepacket.html` | Change time, width, momentum, mass and initial position | Exact free Gaussian wavepacket evolution: probability density, complex amplitude, center and spreading |
| `quantum.html` | Drag the time slice; change the initial state, coupling, dephasing or clock | Analytic two-qubit exchange plus Lindblad dephasing; SR and static Schwarzschild clock comparisons |
| `expansion.html` | Drag cosmic time; vary matter, radiation and Λ | Adaptive FLRW evolution, including recollapse, density scaling and test-photon redshift |
| `relativity.html` | Drag the observer or simultaneity slice | Lorentz transformations, relative simultaneity and invariant intervals |
| `guide.html` | Expand an equation's LaTeX source | Plain-language connections to the Standard Model, GR and state spaces |

Every draggable has a native slider for keyboard use. There is no required animation or autoplay.

## The idea in one equation

A schematic record of a slice, within a suitable classical-geometry/quantum-matter approximation, is

```MathML
$$
\mathcal U_t=(\Sigma_t,h_{ij},K_{ij},\rho_t),\qquad\mathcal T=\{\mathcal U_t:t\in I\}.
$$
```

Here $\Sigma_t$ is three-dimensional space at a chosen time label, $h_{ij}$ its spatial geometry, $K_{ij}$ its extrinsic curvature and $\rho_t$ the retained quantum state. This is a way to organize data; equations of motion and constraints still have to be supplied. Classical field models store field values and conjugate momenta instead. A global stack of slices needs suitable spacetime assumptions.


The wall shows selected observables. Interior lines show relationships such as entanglement. The interior is not extra physical space or a signal channel. “More dimensions” means more independent state information, not additional directions in the room. The relativity experiment shows explicitly that a chosen stack of slices is not a universal present.

## New: Gaussian wavepacket laboratory

Open [**wavepacket.html**](wavepacket.html) to visualize the exact free-particle solution of the one-dimensional Schrödinger equation. Its controls modify initial position, width, mean momentum and mass; a time slider shows dispersion and group motion. This uses dimensionless units with ℏ = 1 and a fixed viewport. It is **not** a generic potential solver, field theory or gravitational model.

Run the two independent checks with `node --test tests/wavepacket.test.cjs` and `python3 -m unittest -v test_wavepacket`.

## Three experiments worth trying

1. **Same probabilities, different states.** In the quantum lab, compare the entangled and unentangled 50/50 initial states. Both show equal local excitation probabilities. Only one has nonzero concurrence. Add dephasing to watch that distinction fade.
2. **A universe that turns around.** Choose “Closed universe · recollapse” in Expansion. Drag past the widest slice and follow contraction. A sufficiently late photon can become more energetic than it was at emission.
3. **Change who calls two events simultaneous.** In Relativity, set velocity to zero, then drag the observer to β=0.6. Events A and B keep their locations in the original diagram but acquire moving-frame times +0.75 and −0.75.

These are three scoped demonstrations. The qubit exchange coupling is not arbitrarily changed by cosmic expansion. Full Standard Model interactions, nonlinear structure formation and quantum gravity are described as extensions, not claimed as implemented.

## Mathematics and reading

- [Field notes](templates/guide.html) — HTML source for the plain-language guide; open `guide.html` in a browser.
- [MODEL.md](MODEL.md) — quantum dynamics, assumptions, state-space architecture and sources.
- [COSMOLOGY.md](COSMOLOGY.md) — Friedmann equations, units, redshift and numerical method.
- [RELATIVITY.md](RELATIVITY.md) — Lorentz transformations and the draggable coordinate diagram.
- [LaTeX document](docs/tunnel-notes.tex) — self-contained mathematical notes; compile with `pdflatex tunnel-notes.tex` in `docs/`.
- [ROADMAP.md](ROADMAP.md) — where electromagnetism, strong/weak interactions, structure and other layers could fit.
- [VALIDATION.md](VALIDATION.md) — what was checked and what the checks establish.

The sources are primary physics papers and teaching material from their authors or institutions. They establish the ingredients, not a novelty claim for this metaphor.

## Develop and verify

Prerequisites: Python 3.10+ and Node.js 20+. To rebuild the pages and rendered mathematics:

```sh
npm ci
npm run build
```

LaTeX is converted at build time by pinned KaTeX into native MathML. The browser does not fetch a math library, fonts or a CDN. Edit templates and engines, then rebuild; the generated HTML is committed so readers can open it immediately.

```sh
python3 -m pip install -r requirements-test.txt
npm run test:physics
npm test
npx playwright install chromium
npm run test:ui
```

The physics suite compares quantum evolution with an independent full Lindblad matrix exponential, cosmology with analytic solutions and SciPy integration, and JavaScript results with Python reference engines. The SR tests check invariants and inverse boosts. The Chromium test opens local files, exercises real mouse/touch/keyboard controls, checks narrow layouts, equation rendering and absence of network requests.

## Project layout

```text
model.js / model.py             quantum engines
cosmology.js / cosmology.py     FLRW engines
relativity.js                  pure Lorentz-transform functions
assets/drag.js                 pointer interaction helper
*-fragment.template.html       quantum and cosmology UI sources
templates/                     page sources and relativity UI
assets/                        CSS and original SVG illustration
build.py                       page assembly
scripts/render-math.cjs         LaTeX → MathML
tests/ and test_*.py/.cjs       numerical and UI checks
docs/tunnel-notes.tex           printable mathematical source
```

See [CONTRIBUTING.md](CONTRIBUTING.md) before adding a physical layer. The static pages can be served by any ordinary static host. A GitHub Actions workflow (`.github/workflows/pages.yml`) publishes the committed pages to GitHub Pages on every push to `main`, after confirming they match their sources.

## Credit and reuse

Concept: Victor. Code and explanatory draft developed with AI assistance. Corrections, clearer explanations and independent validation are welcome. No claim of a new complete physical theory or of priority for the visualization is made. Code, text and the original diagram are available under the [MIT license](LICENSE); third-party build dependencies retain their own licenses.
