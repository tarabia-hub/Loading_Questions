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
    <p class="small">Formulas follow the same structure used in your uploaded solution sheets.</p>

    <h3>a) Roof snow load (NBC 2020 format)</h3>
    <pre>Lc = 2w - w²/L = ${f(r.Lc)} m,  compare with 70/Cw² = ${f(r.LcLimit)} m
Ws = Is[Ss(Cb·Cw·Cs·Ca) + Sr]
   = ${f(data.Is)}[${f(data.Ss)}(${f(data.Cb)}·${f(data.Cw)}·${f(data.Cs)}·${f(data.Ca)}) + ${f(data.Sr)}]
   = ${f(r.Ws)} kPa</pre>

    <h3>b) Governing factored roof load under D and S</h3>
    <table class="table">
      <tr><th>Combination</th><th>Value (kPa)</th></tr>
      <tr><td>1.4D</td><td>${f(r.combo14D)} </td></tr>
      <tr><td>1.25D + 1.5S</td><td>${f(r.combo125D15S)} </td></tr>
      <tr><td><strong>Governing</strong></td><td><strong>${f(r.governingRoof)}</strong></td></tr>
    </table>

    <h3>c) Column axial loads under 1.25D + 1.5S</h3>
    <pre>Column A tributary area = ${f(data.bayX)} × ${f(data.bayY)} = ${f(r.areaA)} m²
Cf,A = AreaA(1.25wD + 1.5Ws) = ${f(r.columnA)} kN

Column B tributary area = (${f(data.bayX)}/2) × (${f(data.bayY)}/2) = ${f(r.areaB)} m²
Cf,B = AreaB(1.25wD + 1.5Ws) = ${f(r.columnB)} kN</pre>

    <h3>d) Beam actions (same method as shown)</h3>
    <pre>Pf = 2[(1.25wD)+(1.5Ws)](joistTrib)(joistSpacing)
   = ${f(r.Pf)} kN (each point load)

For two symmetric point loads at distance a from supports:
Vmax = Pf = ${f(r.Vmax)} kN
Mmax = Pf·a = ${f(r.Mmax)} kN·m</pre>

    <h3>e) Beam deflection under snow only</h3>
    <pre>Ps = 2Ws(joistTrib)(joistSpacing)Is,sls = ${f(r.Ps)} kN (each snow-only point load)

Virtual-work expression (as in provided sheet):
δmax = 23PsL³/(27·24·E·I) = ${f(r.deltaVirtual, 2)} mm

Approximate equivalent UDL method:
qeq = (total point loads)/L = 2Ps/L = ${f(r.qeq, 2)} kN/m
δmax = 5qeqL⁴/(384EI) = ${f(r.deltaApprox, 2)} mm</pre>
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
  run();
});

run();
