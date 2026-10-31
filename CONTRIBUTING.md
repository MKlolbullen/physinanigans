# Contributing

Keep the project approachable and physically inspectable. A useful new layer includes:

1. A question the user can explore, with defined variables and units.
2. Equations of motion and constraints, plus explicit approximation limits.
3. A meaningful connection to an existing layer, where one is claimed.
4. A test against an analytic limit or independent numerical method.
5. A diagram key explaining exactly what visual marks encode.

Use native controls alongside draggable diagrams. Keep pages usable offline and with keyboard input, label compressed spatial dimensions, and distinguish a drawing convention from a physical prediction. Do not label an arbitrary control as a force without specifying a physical model.

Edit source templates and JavaScript engines, then run `npm run build`. Commit the generated HTML. Run the relevant physics and browser tests. A source change that alters the mathematics should update the corresponding Markdown and LaTeX notes. Avoid tests that only repeat the implementation.

Future density-growth, Maxwell-field or reaction-network modules should state their domain before extending it. Speculative hypotheses belong in clearly labeled experiments with their assumptions exposed.
