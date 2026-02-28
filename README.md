# Loading Question Solver

Simple browser app for solving the uploaded NBC loading assignment style problem.

## Why the preview tab may not show

Most IDEs only show the **Preview** tab after they detect a running web server/port.
This project is static HTML/CSS/JS, so if no server is running yet, there is no preview tab.

Use one of these to start it:

```bash
npm run dev
```

or

```bash
python3 -m http.server 4173
```

Then open/forward `http://localhost:4173` and the preview tab should appear.

## What it computes

- Roof snow load using `Ws = Is[Ss(Cb Cw Cs Ca) + Sr]`
- Governing dead + snow load combination (`1.4D` vs `1.25D + 1.5S`)
- Column axial loads for columns A and B using tributary areas
- Beam point load, maximum shear and moment for symmetric point loads
- Snow-load deflection using:
  - virtual-work expression used in the solution sheet
  - approximate equivalent UDL method


## UI behavior

- Primary inputs shown by default: `L`, `w`, `bayX`, `bayY`, `E`, `I`.
- Optional parameters are hidden under **Optional: change extra variables** and can be expanded only when needed.
- Results are shown in a summary table, with step-by-step derivations inside collapsible sections.
