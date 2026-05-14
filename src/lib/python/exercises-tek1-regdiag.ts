import type { PyExercise } from "./types";

// TEK-1501 — Regresjon-diagnostikk.
// Speil av mini-kurset `tek1-regresjon-diagnostikk`.

export const PY_TEK1_REGDIAG_EXERCISES: PyExercise[] = [
  {
    id: "tek1-py-regdiag-ols-summary",
    topic: "Statistikk-grunnlag",
    title: "OLS + diagnostikk via statsmodels",
    description:
      "Tilpass en lineær regresjon med statsmodels. Print summary med R², R²-adj, p-verdier, Durbin-Watson og Jarque-Bera. Plukk ut residualer for videre analyse.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(0)
n = 30
x = np.linspace(0, 10, n)
y = 2 + 0.8 * x + rng.normal(0, 1.2, n)

# TODO:
# 1) Legg til intercept-kolonne med sm.add_constant
# 2) Fit OLS, print model.summary()
# 3) Print R², R²-adj separat fra model.rsquared og model.rsquared_adj
# 4) Hent ut residualer (model.resid) og fitted (model.fittedvalues)
`,
    solution: `import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(0)
n = 30
x = np.linspace(0, 10, n)
y = 2 + 0.8 * x + rng.normal(0, 1.2, n)

X = sm.add_constant(x)
model = sm.OLS(y, X).fit()
print(model.summary())

print(f"\\nR²     = {model.rsquared:.4f}")
print(f"R²-adj = {model.rsquared_adj:.4f}")

resid = model.resid
fitted = model.fittedvalues
print(f"residual stats: mean={resid.mean():.3f}, std={resid.std():.3f}")
`,
    hints: [
      "sm.add_constant lager en kolonne med 1-ere — gir intercept-leddet.",
      "model.summary() er den kanoniske statistiske rapporten.",
      "Sjekk om snittet av residualer er ≈ 0 (det skal det være per konstruksjon).",
    ],
  },
  {
    id: "tek1-py-regdiag-residualplot",
    topic: "Statistikk-grunnlag",
    title: "Residualplott: spotte ikke-linearitet og trakt",
    description:
      "Lag tre datasett (pent / kvadratisk / heteroskedastisk). Fit lineær OLS på alle og print residual-statistikker som avslører bruddet.",
    requires: ["numpy"],
    starter: `import numpy as np

rng = np.random.default_rng(0)
n = 50
x = np.linspace(0, 10, n)

datasets = {
    "pent":              2 + 0.8 * x + rng.normal(0, 1.0, n),
    "kvadratisk":        1 + 0.4 * x + 0.18 * (x - 5)**2 + rng.normal(0, 0.5, n),
    "heteroskedastisk":  2 + 0.8 * x + (0.3 + 0.25 * x) * rng.normal(0, 1.0, n),
}

# TODO:
# For hvert datasett:
# 1) Fit OLS, hent residualer
# 2) Beregn korrelasjon mellom residualer og fitted (skal være 0 ved random sky)
# 3) Beregn korrelasjon mellom abs(residualer) og fitted (avslører trakt)
# 4) Print en kort konklusjon per datasett
`,
    solution: `import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(0)
n = 50
x = np.linspace(0, 10, n)
datasets = {
    "pent":              2 + 0.8 * x + rng.normal(0, 1.0, n),
    "kvadratisk":        1 + 0.4 * x + 0.18 * (x - 5)**2 + rng.normal(0, 0.5, n),
    "heteroskedastisk":  2 + 0.8 * x + (0.3 + 0.25 * x) * rng.normal(0, 1.0, n),
}

X = sm.add_constant(x)
for name, y in datasets.items():
    fit = sm.OLS(y, X).fit()
    r = fit.resid; f = fit.fittedvalues
    corr_rf = np.corrcoef(r, f)[0, 1]
    corr_absrf = np.corrcoef(np.abs(r), f)[0, 1]
    print(f"\\n{name}:")
    print(f"  R²              = {fit.rsquared:.3f}")
    print(f"  corr(e, ŷ)      = {corr_rf:+.3f}  (≈0 hvis OK)")
    print(f"  corr(|e|, ŷ)    = {corr_absrf:+.3f}  (>0 = trakt)")
`,
    hints: [
      "Per konstruksjon er corr(e, ŷ) = 0 for OLS — så det avslører ikke ikke-linearitet alene.",
      "corr(|e|, ŷ) er en proxy for Breusch-Pagan: stiger ved heteroskedastisitet.",
      "Bedre test for ikke-linearitet: regresser e mot x² og sjekk om koeffisienten er signifikant.",
    ],
  },
  {
    id: "tek1-py-regdiag-cook",
    topic: "Statistikk-grunnlag",
    title: "Cook's distance: finn innflytelsesrike punkter",
    description:
      "Sett inn ett ekstremt outlier-punkt. Bruk statsmodels for å beregne Cook's D og se hvilke punkter som overstiger 4/n-terskelen.",
    requires: ["numpy"],
    starter: `import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(0)
n = 25
x = np.linspace(0, 10, n)
y = 2 + 0.8 * x + rng.normal(0, 0.7, n)
# Sett inn outlier: lift y[20] med 6
y[20] += 6

X = sm.add_constant(x)

# TODO:
# 1) Fit OLS
# 2) Hent Cook's D via model.get_influence().cooks_distance[0]
# 3) Print indeksene der D > 4/n
# 4) Print model.params med outlier; refit uten den og print params igjen
`,
    solution: `import numpy as np
import statsmodels.api as sm

rng = np.random.default_rng(0)
n = 25
x = np.linspace(0, 10, n)
y = 2 + 0.8 * x + rng.normal(0, 0.7, n)
y[20] += 6

X = sm.add_constant(x)
fit = sm.OLS(y, X).fit()

infl = fit.get_influence()
cooks = infl.cooks_distance[0]
thresh = 4 / n
flagged = np.where(cooks > thresh)[0]
print(f"Cook's D > {thresh:.3f}: indekser {flagged.tolist()}")
print(f"Cook's D for outlier-punkt (i=20): {cooks[20]:.3f}")

print(f"\\nMed outlier:   intercept={fit.params[0]:.3f}, slope={fit.params[1]:.3f}")
mask = np.ones(n, dtype=bool); mask[20] = False
fit2 = sm.OLS(y[mask], X[mask]).fit()
print(f"Uten outlier:  intercept={fit2.params[0]:.3f}, slope={fit2.params[1]:.3f}")
`,
    hints: [
      "get_influence().cooks_distance returnerer (cooks, p-values).",
      "Tommelfingerregel: D > 4/n undersøk; D > 1 alvorlig.",
      "Sammenlign hvor mye β̂ endrer seg med/uten det innflytelsesrike punktet.",
    ],
  },
  {
    id: "tek1-py-regdiag-qq",
    topic: "Statistikk-grunnlag",
    title: "Q-Q-plot manuelt: residual mot normal-kvantiler",
    description:
      "Bygg et Q-Q-plot fra bunn med scipy.stats.norm.ppf. Vis hvordan tunge haler (t-fordelt residual) avslører seg.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
n = 100

# Normal residualer
resid_normal = rng.normal(0, 1, n)
# Tunge haler — t-fordeling med 3 df
resid_heavy = rng.standard_t(3, n)

# TODO:
# For hver residual-serie:
# 1) Sortér
# 2) Beregn empiriske kvantiler i = (i + 0.5) / n
# 3) Beregn teoretiske kvantiler stats.norm.ppf(p_i)
# 4) Print (teoretisk, empirisk) for et utvalg i, og sammenlign
`,
    solution: `import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
n = 100
resid_normal = rng.normal(0, 1, n)
resid_heavy = rng.standard_t(3, n)

for name, r in [("normal", resid_normal), ("t(3) tunge haler", resid_heavy)]:
    sorted_r = np.sort(r)
    p = (np.arange(n) + 0.5) / n
    theo = stats.norm.ppf(p)
    diff = sorted_r - theo
    print(f"\\n{name}:")
    print(f"  min  resid: empirisk = {sorted_r[0]:.2f}, teoretisk = {theo[0]:.2f}")
    print(f"  q25:        empirisk = {sorted_r[24]:.2f}, teoretisk = {theo[24]:.2f}")
    print(f"  q75:        empirisk = {sorted_r[74]:.2f}, teoretisk = {theo[74]:.2f}")
    print(f"  max  resid: empirisk = {sorted_r[-1]:.2f}, teoretisk = {theo[-1]:.2f}")
    print(f"  haleavvik (max - theoretisk): {sorted_r[-1] - theo[-1]:+.2f}")

# For t(3): halen er klart videre — sorted_r[-1] >> theo[-1].
# I et Q-Q-plot ville punktene i halen ligget BORTE fra diagonalen.
`,
  },
  {
    id: "tek1-py-regdiag-vif",
    topic: "Statistikk-grunnlag",
    title: "VIF: avslør multikollinearitet",
    description:
      "Beregn VIF for hver prediktor via regresjon mot de andre. Vis at to korrelerte features (BMI ≈ vekt/høyde²) gir høy VIF.",
    requires: ["numpy"],
    starter: `import numpy as np

rng = np.random.default_rng(42)
n = 100
vekt = rng.normal(75, 10, n)
hoyde = rng.normal(1.75, 0.1, n)
bmi = vekt / (hoyde ** 2) + rng.normal(0, 0.1, n)   # nesten avhengig av vekt og høyde
alder = rng.uniform(20, 70, n)

X = np.column_stack([vekt, hoyde, bmi, alder])
feature_names = ["vekt", "hoyde", "bmi", "alder"]

# TODO:
# For hver kolonne j:
# 1) Regresser X[:, j] mot alle andre X[:, k != j]
# 2) Hent R²_j
# 3) VIF_j = 1 / (1 - R²_j)
# 4) Print vif per feature; flag vif > 5
`,
    solution: `import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(42)
n = 100
vekt = rng.normal(75, 10, n)
hoyde = rng.normal(1.75, 0.1, n)
bmi = vekt / (hoyde ** 2) + rng.normal(0, 0.1, n)
alder = rng.uniform(20, 70, n)

X = np.column_stack([vekt, hoyde, bmi, alder])
feature_names = ["vekt", "hoyde", "bmi", "alder"]

print(f"{'feature':<10} {'R²_j':>8} {'VIF':>8}")
for j in range(X.shape[1]):
    Xj = X[:, j]
    Xrest = np.delete(X, j, axis=1)
    r2 = LinearRegression().fit(Xrest, Xj).score(Xrest, Xj)
    vif = 1 / (1 - r2)
    flag = "  <-- HØY" if vif > 5 else ""
    print(f"{feature_names[j]:<10} {r2:>8.4f} {vif:>8.2f}{flag}")

# Forventet: vekt, hoyde og bmi har høy VIF (BMI er definert via vekt/høyde²).
# Alder skal være lav — den er uavhengig av de andre.
`,
    hints: [
      "VIF_j = 1 / (1 - R_j²) der R_j² er fra regresjon av x_j mot alle andre prediktorer.",
      "VIF > 5: bekymring. VIF > 10: alvorlig.",
      "Fiks: drop én av de korrelerte, eller bruk Ridge-regresjon.",
    ],
  },
];
