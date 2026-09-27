const { parseJob } = require("../.test-build/jv.cjs");
const base = { title: "Barista", region: "cork", area: "hospitality", employmentType: "part_time", shifts: ["morning"], visaInfo: "stamp_2_ok", ppsn: "unknown", description: "Make coffee" };
const fd = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) (Array.isArray(v) ? v : [v]).forEach((x) => f.append(k, x)); return f; };
const cases = [
  ["válido sem salário", {}, true],
  ["€14,50/hora com vírgula", { salaryMin: "14,50", salaryPeriod: "hour" }, true],
  ["€13/hora abaixo do mínimo", { salaryMin: "13", salaryPeriod: "hour" }, "belowMinimum"],
  ["exatamente €14.15", { salaryMin: "14.15", salaryPeriod: "hour" }, true],
  ["só 'até' €12/hora", { salaryMax: "12", salaryPeriod: "hour" }, "belowMinimum"],
  ["salário sem período", { salaryMin: "15" }, "periodNeeded"],
  ["máx menor que mín", { salaryMin: "16", salaryMax: "15", salaryPeriod: "hour" }, "maxBelowMin"],
  ["€500/semana (não checa mínimo)", { salaryMin: "500", salaryPeriod: "week" }, true],
  ["salário texto", { salaryMin: "abc", salaryPeriod: "hour" }, "invalidNumber"],
  ["salário negativo", { salaryMin: "-5", salaryPeriod: "hour" }, "invalidNumber"],
  ["70 horas", { hoursPerWeek: "70" }, "hoursRange"],
  ["20.5 horas", { hoursPerWeek: "20.5" }, "hoursRange"],
  ["visto inventado", { visaInfo: "anything" }, "chooseOne"],
  ["sem título", { title: "" }, "required"],
  ["turno inválido", { shifts: ["morning", "hack"] }, "chooseAtLeastOne"],
];
let fail = 0;
for (const [name, patch, expect] of cases) {
  const r = parseJob(fd({ ...base, ...patch }));
  const got = r.ok ? true : Object.values(r.errors);
  const pass = expect === true ? r.ok : !r.ok && got.includes(expect);
  if (!pass) fail++;
  console.log(pass ? "PASS" : "FAIL", name, pass ? "" : JSON.stringify(got));
}
const ok = parseJob(fd({ ...base, salaryMin: "14,50", salaryPeriod: "hour", ppsn: "no" }));
console.log("dados:", ok.data.salaryMin, ok.data.salaryPeriod, ok.data.requiresPpsn);
process.exit(fail);
