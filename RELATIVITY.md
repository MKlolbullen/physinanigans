# Whose slice is now?

This experiment stress-tests the tunnel metaphor using Lorentz boosts in flat spacetime. Three spatial dimensions remain present; the drawing suppresses two. This is a coordinate diagram, not an optical camera view.

Let $T=ct/L$, $X=x/L$, $\beta=v/c$ and $\Gamma=(1-\beta^2)^{-1/2}$. The frame moving in the positive x direction assigns coordinates

$$T'=\Gamma(T-\beta X),\qquad X'=\Gamma(X-\beta T).$$

A line of constant $T'$ therefore has $T=\beta X+T'/\Gamma$. The moving observer's worldline is $X=\beta T$. Along it, $T'=T/\Gamma$, so $d\tau/dt=1/\Gamma$. Equal scales on T and X put light rays at 45 degrees. Every boost preserves

$$-T'^2+X'^2=-T^2+X^2.$$

Events A=(0,-1), B=(0,+1) have spacelike separation. At beta=0.6, Gamma=1.25, so T'_A=+0.75 and T'_B=-0.75. Reversing beta reverses their assigned order. Neither event can causally influence the other. This does not imply that causally connected events can exchange order under an ordinary Lorentz boost.

## Controls

- Drag the teal handle horizontally. It lies at T=2 on the observer worldline, so its X-coordinate is 2 beta.
- Drag the purple handle vertically. It lies at X=0, T=T'/Gamma on the selected simultaneity slice.
- Both controls have native range inputs for keyboard and assistive technology. Pointer capture supports dragging outside a handle and pointer cancellation.
- Changing velocity chooses a different constant-velocity frame; it does not simulate acceleration.

The tests in `tests/relativity.test.cjs` check invariant intervals, inverse transformations, constant transformed time along each slice, clock rates and invalid inputs. The browser test checks actual pointer interactions.

## Sources

- [Einstein Online: spacetime](https://www.einstein-online.info/en/spacetime/).
- [Einstein Online: Lorentz transformation](https://www.einstein-online.info/en/explandict/lorentz-transformation-2/).
- [Einstein Online: the definition of now](https://www.einstein-online.info/en/spotlight/Now/).

The tunnel uses a chosen foliation. In general curved spacetime, a global slicing needs appropriate assumptions. This is not a general foliation solver.
