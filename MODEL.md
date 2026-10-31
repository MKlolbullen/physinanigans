# State, geometry and history

Quantum-module foundation · introduced in version 0.1 · 27 September 2026

Version 0.2 adds evolving FLRW geometry and photon transport. See COSMOLOGY.md for that implemented extension; the status descriptions below refer to the original quantum module.

## 1. The revised idea

Keep exactly three spatial directions. Time labels a chosen sequence of spatial snapshots. Other variables describe what is present, its quantum state, its interactions, and the geometry. They are coordinates or degrees of freedom in a description, not additional directions in which a body can move.

A useful schematic record is:

$$
\mathcal U_t=(\Sigma_t,h_{ij}(t),K_{ij}(t),\rho_t),\qquad
\mathcal T=\{\mathcal U_t:t\in I\}.
$$

- Sigma_t is the three-dimensional spatial slice.
- h_ij describes distances and angles within it.
- K_ij describes how it sits in spacetime (and, with a coordinate choice, is related to its evolution).
- rho_t is the quantum density operator for the matter and field degrees of freedom retained in the model. It contains joint probabilities and coherences, including entanglement.
- T is the history represented by the tunnel.

This is a bookkeeping framework for a classical geometry and quantum matter approximation. It is not a completed quantum-gravity state, and writing the tuple does not supply its dynamics. Arbitrary h, K and matter data are not allowed: a dynamical gravity model must satisfy Einstein's constraints and use a consistent matter approximation. A global slicing assumes an appropriate spacetime, typically globally hyperbolic; not every mathematical GR spacetime admits it.

The time label depends on an observer/coordinate choice. The construction does not posit a universal present. The tunnel's drawn radius, surrounding space and hollow centre are graphical devices, not extra physical coordinates. A full three-dimensional universe cannot be faithfully embedded as an ordinary two-dimensional tube wall while preserving all its geometry.

## 2. Where the requested physics belongs

| Ingredient | Mathematical role | This version |
|---|---|---|
| Three spatial axes | Local coordinates x, y, z and spatial geometry | Two fixed sites with three-component position records |
| Time | Coordinate time t and local proper time tau | Both are tracked |
| Special relativity | Flat spacetime, causal structure, Lorentz transformations | Time-dilation comparison for an inertially moving small lab |
| General relativity / gravity | Spacetime metric; Einstein equations when geometry evolves | Prescribed Schwarzschild clock rate only |
| Quantum mechanics | Density operator, evolution, measurement probabilities | Two-qubit density matrix, exact for the specified master equation |
| Matter / particles | Quantum fields and their excitations in field theory | Two effective localized two-level systems, not a full particle inventory |
| Electromagnetism | Electromagnetic gauge field and charged matter | No Maxwell or QED solver; exchange is only an effective interaction |
| Strong interaction | SU(3) colour gauge field and quarks | Future field-theory module |
| Weak interaction | Electroweak gauge fields, matter and Higgs | Future field-theory module |
| Standard Model | Quantum field theory with SU(3)×SU(2)×U(1) gauge structure | Architecture reference, not implemented dynamics |
| Quantum gravity | Quantum treatment of geometry and matter together | Open extension; no solution asserted |
| Supersymmetry | Optional extension relating bosonic and fermionic fields | Not assumed |

Electromagnetism emerges from electroweak symmetry breaking; it should not be added to a full electroweak theory as an independent duplicate. Gravity is already the content of GR in this list, not a fifth interaction. Quantum mechanics is the framework used by the Standard Model rather than another force to add alongside it.

The broad reason “one scalar dimension per force” is insufficient is that each interaction has field components, internal indices and constraints. The fields can vary throughout three-dimensional space. Even a generic two-qubit density matrix needs 15 independent real parameters, whereas our symmetric restricted family uses only a few. A continuum field state has far more degrees of freedom.

At established low energies, the Standard Model and gravity can be organized together as an effective field theory. In units hbar = c = 1, a schematic action is:

$$
S_{\rm eff}=\int d^4x\sqrt{-g}\left[
\frac{M_{\rm Pl}^2}{2}(R-2\Lambda)+\mathcal L_{\rm SM}(g,\text{fields})
+\sum_{d>4}\frac{c_d\mathcal O_d}{\Lambda_{\rm cutoff}^{d-4}}
\right].
$$

Here M_Pl is the reduced Planck mass, Lambda is the cosmological constant, and Lambda_cutoff is a distinct high-energy scale. This line only sketches the leading GR/SM terms and higher-dimension corrections; a complete effective action also allows curvature-squared and other symmetry-permitted counterterms. It is an established organizing framework, not our new equation and not a complete high-energy theory. No part of the demo numerically solves this action.

## 3. The working quantum experiment

There are two localized two-level systems, A and B. State 1 means excited; state 0 means unexcited. Exactly one excitation is retained, so the evolving subspace is spanned by |10> and |01>. Both particles/sites remain present throughout; the excitation is what exchanges.

The interaction Hamiltonian is:

$$
H=\frac{\hbar J}{2}(X_A X_B+Y_A Y_B).
$$

X, Y and Z are Pauli operators. J is a coupling rate. For an ideal isolated system initially in |10>:

$$
|\psi(\tau)\rangle=\cos(J\tau)|10\rangle-i\sin(J\tau)|01\rangle.
$$

Therefore P(A=1) = cos²(J tau), P(B=1) = sin²(J tau), and concurrence C = |sin(2 J tau)|. No-collapse ensemble evolution is shown. The display does not sample individual measurement outcomes.

To model environmental dephasing, use the completely positive, trace-preserving Lindblad equation:

$$
\frac{d\rho}{d\tau}=-\frac{i}{\hbar}[H,\rho]
+\frac{\gamma}{4}\sum_{k=A,B}(Z_k\rho Z_k-\rho).
$$

Gamma is defined so that the |10><01| coherence decays at rate gamma when exchange is absent. It describes phase noise; it is not amplitude relaxation, a complete thermal model or a model of the universe's entire environment. The qubit-pair density operator is reduced: the noise-generating environment is traced out.

In the ordered two-dimensional subspace |10>, |01>, write:

$$
\rho=\frac12\begin{pmatrix}1+z & x-iy\\x+iy&1-z\end{pmatrix}.
$$

The real variables x, y, z here are **Bloch-state variables, not the spatial coordinates** of the sites. They obey:

$$
\dot x=-\gamma x,\quad \dot y=-\gamma y-2Jz,\quad \dot z=2Jy.
$$

The implementation solves these equations analytically, including underdamped, critically damped and overdamped cases. Thus no integration time-step setting is required. The displayed histories sample this continuous solution.

The initial options are:

1. A excited: (x,y,z) = (0,0,1).
2. Entangled: (|10>+|01>)/sqrt(2), with (x,y,z) = (1,0,0).
3. Mixture: half |10><10| plus half |01><01|, with (x,y,z) = (0,0,0).

For this restricted family, concurrence is C = sqrt(x²+y²) and purity is Tr(rho²) = (1+x²+y²+z²)/2. These simplified formulas are not general-purpose formulas for arbitrary two-qubit states. The fixed correlation <Z_A Z_B> = -1 illustrates that absence of entanglement does not mean absence of all correlation.

## 4. How relativity connects to the experiment

The quantum dynamics use local proper time tau. A selected observer supplies coordinate time t. For constant clock ratio a, tau = a t:

$$
a=1\quad\text{(local clock)},\qquad
a=\sqrt{1-v^2/c^2}\quad\text{(SR)},\qquad
a=\sqrt{1-2GM/(rc^2)}\quad\text{(static Schwarzschild lab)}.
$$

Equivalently d(rho)/dt = a times the displayed proper-time generator. Both J and gamma are specified locally. The comparison changes how much proper time elapses at a given t; it does not alter the locally calibrated interaction physics.

SR: v is the constant speed of the whole small lab in the comparison frame. The quantum description remains in the comoving lab frame. This is a clock comparison, not a full Lorentz transformation of an extended quantum system.

GR: M is the prescribed spherical source mass, r is exterior Schwarzschild areal radius, and t agrees with a stationary clock at infinity. The lab is held at fixed r, outside any material source and outside the horizon. Both systems are assumed small and close enough to share a common lapse; tidal and redshift gradients across the apparatus are neglected. This approximation does not include the supporting apparatus, gravitational particle creation or backreaction. The slider is restricted to compactness at most 0.8.

The two clock modes are alternatives. Their factors are not casually multiplied to claim a general spacetime solution. The entanglement line conveys no spacetime distance and cannot be used as a signal channel. The low-energy exchange model itself does not resolve mediator propagation; it should not be extrapolated to arbitrarily separated systems or times shorter than the validity of the effective interaction.

## 5. A realistic extension sequence

1. Add explicit measurement sampling and correlation measurements in several bases, retaining the present density-matrix reference tests.
2. Add a specified electromagnetic apparatus or field model and derive its effective J, rather than calling J an additional force dimension.
3. Add classical field evolution and causal propagation on a fixed spacetime.
4. Evolve classical geometry and suitable classical/semiclassical matter together, with constraints and an explicit domain of validity.
5. Add tractable discretized field-theory sectors. Full SM dynamics are a major computational and theoretical expansion, not three extra sliders.

Quantum gravity and supersymmetry belong to separately specified hypotheses. Holography is a possible conceptual comparison to a wall/interior picture, but the tunnel construction supplies no boundary/bulk duality or holographic equivalence.

## 6. Precedents and sources

- Eric Gourgoulhon, **3+1 Formalism and Bases of Numerical Relativity** (2007): spatial slices, geometric initial data, constraints and evolution. https://arxiv.org/abs/gr-qc/0703035
- Max Planck Institute for Gravitational Physics, **Spacetime**, Einstein Online: observer-dependent simultaneity and invariant causal structure. https://www.einstein-online.info/en/spacetime/
- Wojciech H. Zurek, **Decoherence, einselection, and the quantum origins of the classical** (2003): environmental decoherence. https://arxiv.org/abs/quant-ph/0105127
- William K. Wootters, **Entanglement of Formation of an Arbitrary State of Two Qubits** (1998): concurrence. https://arxiv.org/abs/quant-ph/9709029
- CERN, **The Standard Model**: electromagnetic, strong and weak interactions; gravity outside the SM. https://home.web.cern.ch/science/physics/standard-model/
- John F. Donoghue, **Quantum General Relativity and Effective Field Theory** (2022): low-energy gravity as effective field theory. https://arxiv.org/abs/2211.09902
- Tupac Bravo, Dennis Rätzel and Ivette Fuentes, **Gravitational time dilation in extended quantum systems: the case of light clocks in Schwarzschild spacetime** (2022): why finite clock size requires care. https://arxiv.org/abs/2204.07869

These references establish relevant ingredients, not novelty of the visualization or proof of a unified theory. The precise small-system calculation and display choices are documented above so that they can be reproduced and criticized.
