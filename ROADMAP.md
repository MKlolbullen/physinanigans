# Building outward from the tunnel

The aim is to grow one inspectable state-and-history framework. Each added layer needs defined variables, evolution laws, connections to existing layers, and a testable limiting case. This avoids assembling disconnected sliders with impressive names.

| Layer | Role | Current status | Useful next experiment |
|---|---|---|---|
| Three-dimensional space and time | Geometry, locations and histories | 3D site metadata; FLRW geometry and cosmic time | Compare comoving and proper separations |
| Local quantum state | Amplitudes, mixtures, entanglement and measurements | Two coupled qubits with dephasing | Add measurements in several bases and joint correlations |
| SR and GR clocks | Relate local proper time to coordinates | Inertial SR and static Schwarzschild clock comparisons; draggable Lorentz slices | Move a small quantum clock along a specified worldline |
| Dynamical large-scale gravity | Contents determine expansion | Matter/radiation/Lambda FLRW evolution, including recollapse; linear growth of one matter overdensity on that background | Promote delta to a spatial field with a power spectrum and follow mode-by-mode growth |
| Light | Causal propagation, redshift and photon energy | Radial accumulated null path and wavelength/energy scaling | Add source/observer events and arrival times |
| Electromagnetic fields | Electric and magnetic fields, charges and currents | Photon kinematics only | Evolve a Maxwell wave packet, then couple charges |
| Matter and dark matter | Dynamical sources and particle content | One effective pressureless component | Split baryons and cold dark matter, then add interactions |
| Thermal history | Radiation temperature, species and transitions | Fixed-species temperature scaling in the engine | Cooling, ionization/recombination and photon decoupling |
| Strong and weak interactions | Nuclear structure, transformations and reactions | Not yet explicit | Begin with documented nuclear/reaction-rate networks; reserve lattice gauge theory for a later project |
| Higgs and particle masses | SM fields, symmetry breaking and couplings | Architecture only | An explicitly labeled effective scalar-field potential |
| Inflation | Early accelerated expansion and its end | Constant-Lambda exponential background only | A rolling scalar field with Friedmann backreaction |
| Entropy and an arrow of time | Coarse graining, mixing and irreversible behavior | Quantum dephasing; ideal fluids conserve entropy per comoving volume | Compare reversible closed dynamics with reduced open-system dynamics |
| Quantum gravity | Quantum geometry and matter | Research interface | Compare clearly specified toy hypotheses without mixing them into established modules |

## Next integration step

Done: a **linear matter overdensity** now rides on the evolving background. In the pressureless, subhorizon regime its growth equation involves only the background expansion and matter density, and solving it against the computed a(t) ties expansion history to emerging structure (see [COSMOLOGY.md](COSMOLOGY.md)). The result is one amplitude per slice. Natural follow-ups are a decomposition into comoving Fourier modes with a chosen initial spectrum, baryon pressure and the radiation-era suppression of growth inside the horizon.

Next, add **spatial fields and local causality**: a small periodic 3D domain with explicit units, wave propagation and particle/field coupling. The state stored on a time slice then becomes an actual spatial field dataset rather than a few uniform variables.

The tunnel view can continue to summarize each slice while a selected slice opens into its own spatial or quantum-state view. That allows the visual language to remain stable while the physics grows more detailed.
