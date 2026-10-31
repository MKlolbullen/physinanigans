# An evolving tunnel: version 0.2

The quantum lab from version 0.1 remains at `quantum.html`. The new `expansion.html` follows the large-scale geometry of a homogeneous, isotropic universe. Its dynamical state is (a, v, chi): scale factor, scale-factor velocity and accumulated comoving photon path length.

## A concrete connection between layers

Contents affect spacetime geometry through Einstein's equations in their FLRW reduction. Geometry changes separations and dilutes matter and radiation. Light propagates on that geometry; its wavelength changes, and the quantum relation E = hf supplies its photon energy. These are real connections between the implemented layers.

The older two-qubit experiment is still a separate local lab. A bound atomic system is not automatically stretched by the cosmic scale factor, and its exchange constant J has not been made to depend on a without a physical apparatus model.

## Geometry and time

The spacetime line element can be written

$$
ds^2=-c^2dt^2+a^2(t)\,d\ell_k^2,
$$

where d(ell_k)² is a reference three-dimensional constant-curvature metric. For the flat case it is dx²+dy²+dz². The reference comoving length coordinates carry length units; a is dimensionless. The simulator uses u = H_ref(t − t_start). Cosmic time t is proper time along the comoving observers of this homogeneous model.

A fixed comoving separation has proper length proportional to a. The drawing represents this with ring radius proportional to a. The radius is scaled to fit each history; the ring is not a claim that physical space is two-dimensional, circular, finite, or embedded inside a larger room. Width changing along a schematic tube is not itself the spatial curvature parameter.

## Ingredients

At the reference scale a = 1, Omega_m, Omega_r and Omega_Lambda specify densities in units of the reference critical density. Matter includes baryonic matter and cold dark matter combined as a pressureless fluid. Radiation is an ideal relativistic fluid with pressure one-third of its energy density. Lambda has constant energy density and pressure equal to minus that density. These are effective fluids, not individual simulated particles.

The inputs obey closure through

$$
\Omega_k=1-\Omega_m-\Omega_r-\Omega_\Lambda.
$$

Positive Omega_k corresponds to negative spatial curvature (open); negative Omega_k corresponds to positive spatial curvature (closed in the usual simply connected case). Curvature is geometric, not an additional material energy density. The composition bar therefore normalizes only matter, radiation and Lambda.

The defaults (0.3, 0.0001, 0.6999) are illustrative and spatially flat. They are not presented as a current fit to cosmological observations. No value in seconds or Gyr for H_ref is assumed.

## Equations

$$
\left(\frac{H}{H_{\rm ref}}\right)^2
=\frac{\Omega_r}{a^4}+\frac{\Omega_m}{a^3}+\frac{\Omega_k}{a^2}+\Omega_\Lambda,
\qquad H=\frac{1}{a}\frac{da}{dt}.
$$

Let a prime denote d/du, and v = a'. The engine evolves

$$
a'=v,\qquad
v'=-\frac{\Omega_r}{a^3}-\frac{\Omega_m}{2a^2}+\Omega_\Lambda a,
\qquad
\chi'=\frac1a.
$$

The initial expanding branch uses

$$
v_{\rm start}=\sqrt{\Omega_r/a_{\rm start}^2+
\Omega_m/a_{\rm start}+\Omega_k+\Omega_\Lambda a_{\rm start}^2}.
$$

Evolving the acceleration equation avoids taking a permanently positive square root at every step. This matters: closed models can cross v = 0 and continue with v < 0. Curvature affects the initial constraint and the resulting trajectory even though it is absent explicitly from the acceleration equation.

The density laws in reference critical-density units are

$$
\rho_m=\Omega_m a^{-3},\qquad
\rho_r=\Omega_r a^{-4},\qquad
\rho_\Lambda=\Omega_\Lambda.
$$

These follow from local energy-momentum conservation for separately conserved fluids. Matter dilution reflects increasing volume. Radiation has another factor of 1/a because each freely propagating photon's energy redshifts. A cosmological-constant energy density remains constant. There is no added claim of a globally conserved total energy for arbitrary expanding spacetime.

## Light and the quantum energy relation

A negligible test photon is emitted at the first displayed slice, a_start = 0.2. Its locally measured wavelength and energy obey

$$
\frac{\lambda(t)}{\lambda_{\rm emit}}=\frac{a(t)}{a_{\rm start}},\qquad
\frac{E(t)}{E_{\rm emit}}=\frac{a_{\rm start}}{a(t)},\qquad E=hc/\lambda.
$$

The dimensionless accumulated path is chi = integral du/a; multiply it by c/H_ref for comoving length. This is path length since the selected emission slice, not the entire particle horizon since a Big Bang. In a closed universe the accumulated path can pass an antipode; it should not be read as shortest distance or radius of a ball on the spatial slice.

For a freely redshifting ideal blackbody bath with fixed relativistic species, T/T_start = a_start/a. The engine reports this ratio only when radiation density is nonzero. The plotted photon can still exist as a test particle in radiation-free backgrounds because its backreaction is neglected.

The sinusoid is a snapshot illustration of wavelength on a fixed display length scale. Its amplitude is held fixed for visibility; amplitude, polarization, interference, electromagnetic field energy transfer and full Maxwell dynamics are not solved by that line.

## Numerical method and domain

JavaScript and dependency-free Python engines implement adaptive RK4 step doubling with Richardson correction. A local error estimate controls step size. Root refinement locates scale-limit crossings and records the expansion-to-contraction turning point. Sampling integrates a short step from the preceding stored state rather than merely interpolating a coarse picture.

The default history begins at a = 0.2 and stops at a = 3, a = 0.05 on the contracting branch, or u = 8. These finite cutoffs are computational display boundaries, not claimed beginnings or endings of physics. The solver does not step through a = 0.

The code monitors the normalized Friedmann-constraint residual. Tests compare against exact matter, radiation, vacuum and empty solutions; the exact parametric closed dust solution; and an independently configured DOP853 integration for mixed fluids. They also verify density scalings, light-path integrals, end conditions and JavaScript/Python agreement.

## Scope of this layer

This is dynamical GR within a homogeneous, isotropic symmetry reduction. There are no density perturbations, galaxies, local gravitational collapse, field collisions, recombination, changing particle species, inflaton evolution or reheating yet. The matter fluid leaves the microscopic identity of dark matter unspecified. Lambda is a specified constant, not a derivation of vacuum energy from quantum field theory.

## Primary teaching sources

- David Tong, **Cosmology, 1: The Expanding Universe**. Geometry, Friedmann and continuity equations, density laws, redshift and analytic cosmologies: https://davidtong.org/teaching/cosmology/cosmohtml/S1
- Edward L. Wright, **Cosmology Tutorial, Part 2**. Scale factor, comoving motion, redshift and cosmic time: https://www.astro.ucla.edu/~wright/cosmo_02.htm

The equations are established; the tunnel is the project's visual organization of their evolving state.
