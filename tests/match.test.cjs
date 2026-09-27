const { computeMatch, sortByMatch } = require("../.test-build/match.cjs");
// Perfil de teste do Gilson: Dublin City, warehouse + construction, Stamp 2, Basic, both, afternoon/night/flexible
const gilson = { region: "dublin_city", jobAreas: ["warehouse", "construction"], visa: "stamp_2", english: "basic", employmentType: "both", shifts: ["afternoon", "night", "flexible"] };
const job = (o) => ({ region: "dublin_city", area: "hospitality", visaInfo: "stamp_2_ok", englishRequired: null, employmentType: "part_time", shifts: ["morning"], hoursPerWeek: 20, ...o });
let fail = 0;
const check = (name, cond, info) => { if (!cond) fail++; console.log(cond ? "PASS" : "FAIL", name, cond ? "" : JSON.stringify(info)); };

// vagas demo relevantes
const warehouse = computeMatch(gilson, job({ region: "dublin_county", area: "warehouse", englishRequired: "basic", employmentType: "both", shifts: ["evening","night"], hoursPerWeek: null }));
const barista = computeMatch(gilson, job({ englishRequired: "intermediate", shifts: ["weekend","morning"] }));
const porter = computeMatch(gilson, job({ visaInfo: "work_permit_required", englishRequired: "advanced", employmentType: "full_time", shifts: ["night"], hoursPerWeek: 39 }));
const stockEU = computeMatch(gilson, job({ region: "limerick", area: "retail", visaInfo: "eu_only", englishRequired: "basic", employmentType: "full_time", shifts: ["night"], hoursPerWeek: 39 }));
const delivery = computeMatch(gilson, job({ region: "dublin_county", area: "delivery", visaInfo: "not_informed", shifts: ["morning","afternoon"], hoursPerWeek: 16 }));
console.log({ warehouse, barista, porter, stockEU, delivery });

check("warehouse é o melhor match", warehouse.score > barista.score && warehouse.score > porter.score, warehouse);
check("warehouse: Dublin vizinho + área + visto + inglês + horário + tipo", warehouse.score === 15+25+20+10+10+5, warehouse);
check("barista: inglês acima do Basic gera aviso", barista.warnings.includes("englishAbove"), barista);
check("night porter: bloqueado (Stamp 2 x work permit)", porter.blocked && porter.warnings.includes("visaPermit") && porter.score <= 20, porter);
check("night porter: aviso de 39h > 20h", porter.warnings.includes("stamp2Hours"), porter);
check("stock EU only: bloqueado", stockEU.blocked && stockEU.warnings.includes("visaEuOnly"), stockEU);
check("delivery: visto não informado gera aviso", delivery.warnings.includes("visaUnknown"), delivery);
check("score nunca negativo", [warehouse,barista,porter,stockEU,delivery].every(m => m.score >= 0 && m.score <= 100));

// outros perfis
const eu = { ...gilson, visa: "eu_eea", english: "fluent" };
const euStock = computeMatch(eu, job({ visaInfo: "eu_only" }));
check("cidadão EU passa em vaga EU only", !euStock.blocked && euStock.reasons.includes("visa"), euStock);
const s4 = computeMatch({ ...gilson, visa: "stamp_4" }, job({ visaInfo: "work_permit_required", hoursPerWeek: 39 }));
check("Stamp 4 passa em vaga que pede permit, sem aviso de horas", !s4.blocked && !s4.warnings.includes("stamp2Hours"), s4);
const ft = computeMatch(gilson, job({ employmentType: "full_time", hoursPerWeek: null }));
check("Stamp 2 + full-time sem horas: aviso", ft.warnings.includes("stamp2FullTime"), ft);
const empty = computeMatch({ region: null, jobAreas: [], visa: null, english: null, employmentType: null, shifts: [] }, job({}));
check("perfil vazio não quebra e dá 0", empty.score === 0 && !empty.blocked, empty);
const perfect = computeMatch({ region: "cork", jobAreas: ["cleaning"], visa: "stamp_2", english: "intermediate", employmentType: "part_time", shifts: ["evening"] }, job({ region: "cork", area: "cleaning", englishRequired: "basic", shifts: ["evening"], hoursPerWeek: 12 }));
check("match perfeito = 100", perfect.score === 100 && perfect.warnings.length === 0, perfect);

// ordenação
const sorted = sortByMatch([{ n: "porter", m: porter }, { n: "warehouse", m: warehouse }, { n: "barista", m: barista }], (x) => x.m).map((x) => x.n);
check("ordenação: warehouse, barista, porter", sorted.join() === "warehouse,barista,porter", sorted);
process.exit(fail);
