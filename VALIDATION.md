# Validation record

## Repository edition 1.0 — 31 October 2026

Passed in this build:

- All 18 Python physics tests retained below.
- Four Node SR test cases covering invariant intervals, inverse boosts, constant-time slices, proper-time rates and rejected invalid boosts.
- Both functional DOM harnesses for quantum and cosmology controls.
- Real Chromium checks of all five pages at 1280 and 360 pixels: no page-level horizontal overflow, local links resolve, tables retain their columns, native MathML has a rendered layout, and LaTeX source expands.
- Actual mouse drags on both tunnels and both relativity handles, touch dragging on the quantum tunnel, keyboard Home/End/arrow controls, state switching, contraction and blueshift. No JavaScript page errors or runtime HTTP requests.
- The standalone LaTeX document compiles with pdfLaTeX.

Desktop and narrow-screen screenshots were visually inspected; this caught and corrected malformed cells in the introductory table. The browser checks run in Chromium, not a cross-browser certification. The GitHub Actions workflow repeats the build and numerical/UI suites; a local pass is not a claim that remote CI has already run.

The earlier notes below are historical validation records. Their statement that a full browser was unavailable applies to those earlier editions only.

## Version 0.2: cosmology extension

Eight additional test methods pass, alongside the original ten quantum tests (18 total). The new checks cover:

- Exact flat matter, radiation, vacuum and empty-universe scale factors and light-path integrals.
- The exact parametric closed dust solution through expansion, turnaround and contraction.
- Three mixed-fluid histories compared with SciPy DOP853 at tighter tolerances.
- The Friedmann constraint across 27 combinations of matter, radiation and Lambda; the normalized residual remains below 1e-7.
- Matter/radiation density conservation laws, constant Lambda density, photon energy/wavelength scaling and radiation temperature.
- Monotonically increasing cosmic time and accumulated light path, scale-limit events and invalid input rejection.
- JavaScript/Python agreement for six presets at five sampled times each.

The cosmology DOM harness checks all six presets, each ingredient control, time scrubbing, contraction/blueshift, empty composition, offline operation and SVG bounds at 320 and 736 pixels. Mobile expansion and desktop recollapse diagrams were rendered and visually inspected. Full browser rendering remains untested in this environment.

The time-step error estimate uses a default tolerance of 1e-11 with Richardson-corrected adaptive RK4. This was tightened after an analytical comparison detected a small accumulated phase error late in contraction.

Run `python -m unittest -v test_model test_cosmology`, `node test_browser.cjs` and `node test_cosmology_browser.cjs` to reproduce the checks.

## Version 0.1: retained quantum module

Checked on 27 September 2026 with Python 3, NumPy 2.3.5, SciPy 1.17.0 and Node.js.

All 10 physics test methods passed, including:

- 72 comparisons with an independently constructed full 16×16 Lindblad generator, exponentiated using SciPy. These cover all three initial states and undamped, underdamped, critical, near-critical, overdamped and zero-coupling cases.
- Trace, Hermiticity, density-matrix positivity and conserved excitation number across 2,460 sampled states.
- Known coherent oscillation values and the maximally entangled point.
- Agreement of the restricted concurrence formula with twice the negativity of the partially transposed density operator.
- Equal local measurement probabilities for entangled and unentangled 50/50 states.
- Invariance of a remote marginal under a local unitary at a fixed instant. This is a no-signalling consistency check, not a test of relativistic mediator propagation.
- SR and Schwarzschild clock-rate examples, plus agreement at equal proper time.
- Stable late-time overdamped evaluation and rejection of invalid inputs.
- 108 JavaScript/Python engine comparisons.

The functional DOM harness passed initial rendering, all six control updates, both clock modes, state/readout changes, absence of network dependencies, and diagram-coordinate checks at widths 320, 360 and 736 pixels. The 320- and 736-pixel SVG diagrams were rendered and visually inspected.

A full browser rendering test was not available in the build environment. The DOM harness and SVG inspection do not certify every browser's layout behavior.

These checks validate the implementation against the specified small-system model. They do not validate a new theory of fundamental physics or establish experimental novelty.
