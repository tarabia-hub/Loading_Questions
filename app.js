const defaults = {
  L: 24,
  w: 18,
  Ss: 3,
  Sr: 0.1,
  Is: 1,
  Cw: 1,
  Cb: 0.8,
  Ca: 1,
  Cs: 1,
  wD: 1.35,
  bayX: 6,
  bayY: 4.5,
  Lb: 4.5,
  a: 1.5,
  joistTrib: 3,
  joistSpacing: 1.5,
  E: 200,
  I: 102000000,
  IsSls: 0.9,
};

const form = document.getElementById('solver-form');
const results = document.getElementById('results');

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function f(v, d = 3) {
  return Number(v).toFixed(d);
}

function gather() {
  const data = {};
  new FormData(form).forEach((v, k) => {
    data[k] = num(v);
  });
  return data;
}

function solve(data) {
  const Lc = 2 * data.w - (data.w ** 2) / data.L;
  const LcLimit = 70 / (data.Cw ** 2);
  const Ws = data.Is * (data.Ss * (data.Cb * data.Cw * data.Cs * data.Ca) + data.Sr);

  const combo14D = 1.4 * data.wD;
  const combo125D15S = 1.25 * data.wD + 1.5 * Ws;
  const governingRoof = Math.max(combo14D, combo125D15S);

  const areaA = data.bayX * data.bayY;
  const areaB = (data.bayX / 2) * (data.bayY / 2);
  const columnA = areaA * combo125D15S;
  const columnB = areaB * combo125D15S;

  const factoredSurface = combo125D15S;
  const Pf = 2 * factoredSurface * data.joistTrib * data.joistSpacing;
  const Vmax = Pf;
  const Mmax = Pf * data.a;

  const Ps = 2 * Ws * data.joistTrib * data.joistSpacing * data.IsSls;
  const deltaVirtual = (23 * Ps * (data.Lb * 1000) ** 3) / (27 * 24 * data.E * data.I);

  const qeq = (2 * Ps) / data.Lb;
  const qeqKnPerMm = qeq / 1000;
  const deltaApprox = (5 * qeqKnPerMm * (data.Lb * 1000) ** 4) / (384 * data.E * data.I);

  return {
    Lc,
    LcLimit,
    Ws,
    combo14D,
    combo125D15S,
    governingRoof,
    areaA,
    areaB,
    columnA,
    columnB,
    Pf,
    Vmax,
    Mmax,
    Ps,
    deltaVirtual,
    qeq,
    deltaApprox,
  };
}

function render(data, r) {
  results.innerHTML = `
    <h2>Results</h2>
    <p class="small">Tabulated outputs are shown first. Expand each step only when you need to verify the calculations.</p>

    <table class="table">
      <thead>
        <tr><th>Item</th><th>Result</th><th>Unit</th></tr>
      </thead>
      <tbody>
        <tr><td>Roof snow load, Ws</td><td>${f(r.Ws)}</td><td>kPa</td></tr>
        <tr><td>Roof design load (governing)</td><td>${f(r.governingRoof)}</td><td>kPa</td></tr>
        <tr><td>Column A axial load</td><td>${f(r.columnA)}</td><td>kN</td></tr>
        <tr><td>Column B axial load</td><td>${f(r.columnB)}</td><td>kN</td></tr>
        <tr><td>Beam point load, Pf (each)</td><td>${f(r.Pf)}</td><td>kN</td></tr>
        <tr><td>Beam max shear, Vmax</td><td>${f(r.Vmax)}</td><td>kN</td></tr>
        <tr><td>Beam max moment, Mmax</td><td>${f(r.Mmax)}</td><td>kN·m</td></tr>
        <tr><td>Deflection (virtual work)</td><td>${f(r.deltaVirtual, 2)}</td><td>mm</td></tr>
        <tr><td>Deflection (equivalent UDL)</td><td>${f(r.deltaApprox, 2)}</td><td>mm</td></tr>
      </tbody>
    </table>

    <details class="calc-block">
      <summary>a) Roof snow load step-by-step</summary>
      <pre>Lc = 2w - w²/L = ${f(r.Lc)} m, compare with 70/Cw² = ${f(r.LcLimit)} m
Ws = Is[Ss(Cb·Cw·Cs·Ca) + Sr]
   = ${f(data.Is)}[${f(data.Ss)}(${f(data.Cb)}·${f(data.Cw)}·${f(data.Cs)}·${f(data.Ca)}) + ${f(data.Sr)}]
   = ${f(r.Ws)} kPa</pre>
    </details>

    <details class="calc-block">
      <summary>b) Governing factored load step-by-step</summary>
      <pre>1.4D = 1.4(${f(data.wD)}) = ${f(r.combo14D)} kPa
1.25D + 1.5S = 1.25(${f(data.wD)}) + 1.5(${f(r.Ws)}) = ${f(r.combo125D15S)} kPa
Governing load = max(1.4D, 1.25D + 1.5S) = ${f(r.governingRoof)} kPa</pre>
    </details>

    <details class="calc-block">
      <summary>c) Column loads step-by-step</summary>
      <pre>AreaA = bayX × bayY = ${f(data.bayX)} × ${f(data.bayY)} = ${f(r.areaA)} m²
Cf,A = AreaA(1.25wD + 1.5Ws) = ${f(r.columnA)} kN

AreaB = (bayX/2) × (bayY/2) = ${f(r.areaB)} m²
Cf,B = AreaB(1.25wD + 1.5Ws) = ${f(r.columnB)} kN</pre>
    </details>

    <details class="calc-block">
      <summary>d) Beam shear & moment step-by-step</summary>
      <pre>Pf = 2[(1.25wD)+(1.5Ws)](joistTrib)(joistSpacing)
   = ${f(r.Pf)} kN (each point load)
Vmax = Pf = ${f(r.Vmax)} kN
Mmax = Pf·a = ${f(r.Mmax)} kN·m</pre>
    </details>

    <details class="calc-block">
      <summary>e) Deflection step-by-step</summary>
      <pre>Ps = 2Ws(joistTrib)(joistSpacing)Is,sls = ${f(r.Ps)} kN
δmax (virtual work) = 23PsL³/(27·24·E·I) = ${f(r.deltaVirtual, 2)} mm
qeq = 2Ps/L = ${f(r.qeq, 2)} kN/m
δmax (equivalent UDL) = 5qeqL⁴/(384EI) = ${f(r.deltaApprox, 2)} mm</pre>
    </details>
  `;
}

function run() {
  const data = gather();
  const r = solve(data);
  render(data, r);
}

document.getElementById('solve').addEventListener('click', run);
document.getElementById('reset').addEventListener('click', () => {
  Object.entries(defaults).forEach(([k, v]) => {
    form.elements[k].value = v;
  });
  document.getElementById('advanced-inputs').open = false;
  run();
});

run();
