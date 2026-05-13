import type { PyExercise } from "./types";

// Tek-1501 — ANOVA og inferens for proporsjoner.
// Disse er kjørbare via Pyodide og verifiserer hånd-regning fra
// stack-leksjonene `tek1-anova` og `tek1-proporsjoner`.

export const PY_TEK1_GAPS_EXERCISES: PyExercise[] = [
  // ---------- ANOVA (4) ----------
  {
    id: "py-tek1-anova-3grupper",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 ANOVA: 3 sammensetninger av staal",
    description:
      "3 sammensetninger av stål er testet for bruddstyrke. Kjør en ettveis ANOVA med scipy.stats.f_oneway og konkluder ved α = 0.05.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

A = np.array([412, 408, 419, 405, 410, 417])
B = np.array([428, 435, 421, 432, 425, 430])
C = np.array([419, 422, 415, 425, 420, 418])

# H_0: mu_A = mu_B = mu_C
# H_1: minst ett par skiller seg

# TODO:
# 1. Kjør stats.f_oneway(A, B, C)
# 2. Skriv ut F-statistikk og p-verdi
# 3. Konkluder ved alpha = 0.05

# Forventet: F ≈ 16.28, p ≈ 0.00024 → forkast H_0
`,
    solution: `import numpy as np
from scipy import stats

A = np.array([412, 408, 419, 405, 410, 417])
B = np.array([428, 435, 421, 432, 425, 430])
C = np.array([419, 422, 415, 425, 420, 418])

F, p = stats.f_oneway(A, B, C)
print(f"F = {F:.3f}, p = {p:.5f}")

alpha = 0.05
if p < alpha:
    print(f"p < {alpha}: FORKAST H_0 — minst en sammensetning skiller seg")
else:
    print(f"p >= {alpha}: BEHOLD H_0")

# Snitt per gruppe (til intuisjon)
for label, arr in [("A", A), ("B", B), ("C", C)]:
    print(f"  {label}: mean={arr.mean():.2f}, std={arr.std(ddof=1):.2f}, n={len(arr)}")
`,
    hints: [
      "stats.f_oneway(*grupper) returnerer (F_statistic, p_value).",
      "Bruk array.std(ddof=1) for stikkprøve-standardavvik.",
      "F-statistikken er MS_between / MS_within. Stor F = stor forskjell mellom gruppene.",
    ],
  },
  {
    id: "py-tek1-anova-manuelt",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 ANOVA: regn SS_between, SS_within manuelt",
    description:
      "Regn ANOVA-tabellen fra bunn: SS_between, SS_within, MS, F. Verifiser mot scipy.stats.f_oneway.",
    requires: ["numpy", "scipy"],
    starter: `import numpy as np
from scipy import stats

# Tre grupper med ulike n
g1 = np.array([5.1, 4.9, 5.3, 5.0, 5.2])
g2 = np.array([5.8, 5.6, 5.9, 5.7])
g3 = np.array([6.2, 6.0, 6.3, 6.1, 6.4, 6.2])

groups = [g1, g2, g3]

# TODO:
# 1. Beregn grand mean over ALLE observasjoner
# 2. Beregn SS_between = sum(n_i * (mean_i - grand_mean)^2)
# 3. Beregn SS_within = sum_over_i sum_over_j (x_ij - mean_i)^2
# 4. df_between = k - 1, df_within = N - k
# 5. F = MS_between / MS_within
# 6. Sammenlign med stats.f_oneway

# Forventet at F er ganske stor — gruppene skiller seg tydelig.
`,
    solution: `import numpy as np
from scipy import stats

g1 = np.array([5.1, 4.9, 5.3, 5.0, 5.2])
g2 = np.array([5.8, 5.6, 5.9, 5.7])
g3 = np.array([6.2, 6.0, 6.3, 6.1, 6.4, 6.2])
groups = [g1, g2, g3]

all_vals = np.concatenate(groups)
N = len(all_vals)
k = len(groups)
grand_mean = all_vals.mean()

ss_between = sum(len(g) * (g.mean() - grand_mean) ** 2 for g in groups)
ss_within = sum(((g - g.mean()) ** 2).sum() for g in groups)

df_between = k - 1
df_within = N - k

ms_between = ss_between / df_between
ms_within = ss_within / df_within
F_manual = ms_between / ms_within

print(f"SS_between = {ss_between:.4f}, df = {df_between}, MS = {ms_between:.4f}")
print(f"SS_within  = {ss_within:.4f}, df = {df_within}, MS = {ms_within:.4f}")
print(f"F (manuelt) = {F_manual:.4f}")

F_scipy, p = stats.f_oneway(*groups)
print(f"F (scipy)   = {F_scipy:.4f}, p = {p:.6f}")
assert np.isclose(F_manual, F_scipy), "skal være identiske"
print("OK — manuelt = scipy")
`,
    hints: [
      "Bruk np.concatenate for å samle alle observasjonene før du beregner grand mean.",
      "SS_between = sum av n_i*(mean_i - grand_mean)^2 — VIKTIG: vekt med n_i.",
      "Sjekk at SS_total = SS_between + SS_within (identiteten).",
    ],
  },
  {
    id: "py-tek1-anova-tukey",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 ANOVA: post-hoc med Tukey HSD",
    description:
      "ANOVA har forkastet H_0 — kjør Tukey HSD via statsmodels for å finne hvilke par av grupper som skiller seg.",
    requires: ["numpy", "scipy", "statsmodels"],
    starter: `import numpy as np
from scipy import stats
from statsmodels.stats.multicomp import pairwise_tukeyhsd

# 4 grupper (eks: 4 marketing-kanaler)
A = np.array([12.1, 11.8, 13.2, 12.5, 11.9])
B = np.array([14.2, 13.8, 14.5, 14.0, 13.9])
C = np.array([15.8, 16.1, 15.5, 16.3, 15.9])
D = np.array([14.0, 13.9, 14.2, 14.1, 13.8])

# TODO:
# 1. Kjør stats.f_oneway for å bekrefte at minst ett par skiller seg
# 2. Bygg en samlet array av data + en labels-array (['A','A',...,'D'])
# 3. Bruk pairwise_tukeyhsd(data, labels, alpha=0.05)
# 4. Skriv ut resultatet
`,
    solution: `import numpy as np
from scipy import stats
from statsmodels.stats.multicomp import pairwise_tukeyhsd

A = np.array([12.1, 11.8, 13.2, 12.5, 11.9])
B = np.array([14.2, 13.8, 14.5, 14.0, 13.9])
C = np.array([15.8, 16.1, 15.5, 16.3, 15.9])
D = np.array([14.0, 13.9, 14.2, 14.1, 13.8])

F, p = stats.f_oneway(A, B, C, D)
print(f"ANOVA: F = {F:.3f}, p = {p:.5f}\\n")

data = np.concatenate([A, B, C, D])
labels = ['A']*len(A) + ['B']*len(B) + ['C']*len(C) + ['D']*len(D)

tukey = pairwise_tukeyhsd(data, labels, alpha=0.05)
print(tukey)
`,
    hints: [
      "Tukey-tabellen viser meandiff og om p-adj < 0.05 (rejected=True).",
      "B vs D bør IKKE skille seg (begge ~14). A vs C skiller seg klart.",
      "Tukey HSD justerer for multiple sammenligninger — sikrere enn Bonferroni ved mange grupper.",
    ],
  },
  {
    id: "py-tek1-anova-f-critical",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 ANOVA: kritisk F og p-verdi fra F-fordelingen",
    description:
      "Beregn kritisk F-verdi og finn p-verdi for en gitt observert F. Bruk scipy.stats.f.",
    requires: ["scipy"],
    starter: `from scipy import stats

# Vi har k = 4 grupper og N = 32 totalt antall observasjoner.
# Observert F = 4.85

k = 4
N = 32
F_obs = 4.85
alpha = 0.05

# TODO:
# 1. Beregn df_between = k - 1 og df_within = N - k
# 2. Beregn kritisk F = stats.f.ppf(1 - alpha, df_between, df_within)
# 3. Beregn p-verdi = 1 - stats.f.cdf(F_obs, df_between, df_within)
#    (eller stats.f.sf(F_obs, df_between, df_within) som er mer numerisk stabil)
# 4. Konkluder
`,
    solution: `from scipy import stats

k = 4
N = 32
F_obs = 4.85
alpha = 0.05

df1 = k - 1
df2 = N - k

F_crit = stats.f.ppf(1 - alpha, df1, df2)
p_val = stats.f.sf(F_obs, df1, df2)  # samme som 1 - cdf, men stabilere

print(f"df = ({df1}, {df2})")
print(f"F_kritisk ved alpha = {alpha}: {F_crit:.3f}")
print(f"F observert: {F_obs}, p-verdi = {p_val:.5f}")

if F_obs > F_crit:
    print(f"F_obs > F_crit → FORKAST H_0")
else:
    print(f"F_obs <= F_crit → BEHOLD H_0")
`,
    hints: [
      "stats.f.ppf(q, df1, df2) = inverse CDF — gir kritisk verdi.",
      "stats.f.sf(x, df1, df2) = 1 - cdf — gir p-verdi for høyresidig F-test.",
      "F-fordelingen er asymmetrisk og kun definert for x ≥ 0.",
    ],
  },

  // ---------- PROPORSJONER (4) ----------
  {
    id: "py-tek1-prop-wilson-vs-wald",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 Proporsjoner: Wald vs Wilson vs Agresti-Coull",
    description:
      "Sammenlign de tre CI-metodene ved ulik p̂. Se hvordan Wald feiler nær 0.",
    requires: ["numpy", "scipy", "statsmodels"],
    starter: `from statsmodels.stats.proportion import proportion_confint

# Tre scenarier
cases = [
    ("Stor n, midt-p̂", 200, 90),     # p̂ = 0.45 — alle CI bør være like
    ("Liten n, ekstrem p̂", 30, 2),    # p̂ ≈ 0.067 — Wald feiler
    ("Liten n, helt 0", 25, 0),        # p̂ = 0 — Wald kollapser
]

# TODO:
# For hvert scenario: print Wald, Wilson, Agresti-Coull CI (95 %).
# Sammenlign bredde og posisjon.
`,
    solution: `from statsmodels.stats.proportion import proportion_confint

cases = [
    ("Stor n, midt p̂", 200, 90),
    ("Liten n, ekstrem p̂", 30, 2),
    ("Liten n, p̂=0", 25, 0),
]

for label, n, x in cases:
    p_hat = x / n
    wald = proportion_confint(x, n, alpha=0.05, method='normal')
    wilson = proportion_confint(x, n, alpha=0.05, method='wilson')
    ac = proportion_confint(x, n, alpha=0.05, method='agresti_coull')
    print(f"\\n{label}: n={n}, x={x}, p̂={p_hat:.3f}")
    print(f"  Wald          : [{wald[0]:.4f}, {wald[1]:.4f}] bredde={wald[1]-wald[0]:.4f}")
    print(f"  Wilson        : [{wilson[0]:.4f}, {wilson[1]:.4f}] bredde={wilson[1]-wilson[0]:.4f}")
    print(f"  Agresti-Coull : [{ac[0]:.4f}, {ac[1]:.4f}] bredde={ac[1]-ac[0]:.4f}")
`,
    hints: [
      "method='normal' i statsmodels = Wald-CI.",
      "Når p̂ = 0 kollapser Wald til [0, 0] — meningsløs.",
      "Wilson er asymmetrisk om p̂; AC er symmetrisk om en justert p̃.",
    ],
  },
  {
    id: "py-tek1-prop-1samp-test",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 Proporsjoner: 1-prop z-test",
    description:
      "Markedsfører påstår at andelen vinnere er 30 %. Vi observerer 24 vinnere av 100. Test H_0: p = 0.30.",
    requires: ["numpy", "statsmodels"],
    starter: `import numpy as np
from statsmodels.stats.proportion import proportions_ztest

n = 100
x = 24
p0 = 0.30
alpha = 0.05

# TODO:
# 1. Sjekk CLT: n*p0 >= 10 og n*(1-p0) >= 10
# 2. Beregn z manuelt: z = (p̂ - p0) / sqrt(p0*(1-p0)/n)
# 3. Sammenlign med proportions_ztest (NB: bruker p̂ i SE, ikke p0!)
# 4. Beregn p-verdi (tosidig)
`,
    solution: `import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

n = 100
x = 24
p0 = 0.30
alpha = 0.05

p_hat = x / n
print(f"p̂ = {p_hat}")
print(f"CLT-sjekk: n*p0 = {n*p0}, n*(1-p0) = {n*(1-p0)} — begge ≥ 10? {min(n*p0, n*(1-p0)) >= 10}")

# Manuell z-test (SE under H_0 bruker p_0)
se = np.sqrt(p0 * (1 - p0) / n)
z = (p_hat - p0) / se
p_two = 2 * (1 - stats.norm.cdf(abs(z)))
print(f"\\nManuell (SE med p_0):  z = {z:.3f}, p = {p_two:.4f}")

# statsmodels (bruker p̂ i SE — så litt annerledes)
z_sm, p_sm = proportions_ztest(x, n, value=p0)
print(f"statsmodels (SE med p̂): z = {z_sm:.3f}, p = {p_sm:.4f}")

if p_two < alpha:
    print(f"\\nForkast H_0 — observert andel skiller seg fra {p0:.0%}")
else:
    print(f"\\nBehold H_0 — ikke signifikant forskjell")
`,
    hints: [
      "Manuell test bruker SE = √(p_0(1-p_0)/n) — UNDER H_0.",
      "statsmodels.proportion_ztest bruker p̂ i SE som default (en variant). Begge er gangbare; vit hvilken du bruker.",
      "Tosidig p = 2 * P(Z > |z|). Bruk scipy.stats.norm.cdf eller .sf.",
    ],
  },
  {
    id: "py-tek1-prop-2samp-test",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 Proporsjoner: 2-prop z-test (pooled)",
    description:
      "Sammenlign konverteringsraten på to landingssider. Bruk pooled SE for testen og unpooled SE for KI.",
    requires: ["numpy", "scipy", "statsmodels"],
    starter: `import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

# Landingsside A: 48 konverteringer av 320
# Landingsside B: 30 konverteringer av 280

n1, x1 = 320, 48
n2, x2 = 280, 30

# TODO:
# 1. Regn p̂_1, p̂_2, og p̂_pool = (x1+x2)/(n1+n2)
# 2. Pooled SE = √(p̂_pool*(1-p̂_pool) * (1/n1 + 1/n2))
# 3. z = (p̂_1 - p̂_2) / pooled_SE
# 4. Verifiser med proportions_ztest(count=[x1,x2], nobs=[n1,n2])
# 5. Bygg 95 %-KI for p_1 - p_2 med UNPOOLED SE
`,
    solution: `import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest

n1, x1 = 320, 48
n2, x2 = 280, 30

p1 = x1 / n1
p2 = x2 / n2
diff = p1 - p2
print(f"p̂_1 = {p1:.4f}, p̂_2 = {p2:.4f}, diff = {diff:+.4f}")

# Pooled SE for test
p_pool = (x1 + x2) / (n1 + n2)
se_pool = np.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))
z = diff / se_pool
p_two = 2 * (1 - stats.norm.cdf(abs(z)))
print(f"\\nPooled (test): z = {z:.3f}, p = {p_two:.4f}")

z_sm, p_sm = proportions_ztest([x1, x2], [n1, n2])
print(f"statsmodels:    z = {z_sm:.3f}, p = {p_sm:.4f}")

# Unpooled SE for KI
se_unpool = np.sqrt(p1*(1-p1)/n1 + p2*(1-p2)/n2)
z_crit = stats.norm.ppf(0.975)
ci_lo, ci_hi = diff - z_crit*se_unpool, diff + z_crit*se_unpool
print(f"\\n95% KI for p_1 - p_2 (unpooled SE): [{ci_lo:+.4f}, {ci_hi:+.4f}]")
print("KI inneholder 0?", ci_lo <= 0 <= ci_hi)
`,
    hints: [
      "Pooled SE i TEST (under H_0: p_1 = p_2 må vi estimere én felles p).",
      "Unpooled SE i KI (vi antar IKKE likhet).",
      "Hvis 95 %-KI inneholder 0, er p-verdi ≥ 0.05 — testen og KI-en sier samme sak.",
    ],
  },
  {
    id: "py-tek1-prop-sample-size",
    topic: "Statistikk-grunnlag",
    title: "TEK-1501 Proporsjoner: sample-size for ønsket margin",
    description:
      "Du planlegger en spørreundersøkelse. Hvor mange respondenter trenger du for ±3 % margin ved 95 %?",
    requires: ["scipy"],
    starter: `from scipy import stats

# Mål: 95 %-KI med margin of error E = 0.03 (±3 prosentpoeng)
E = 0.03
alpha = 0.05

# TODO:
# 1. Konservativ p̂* = 0.5 (maksimerer p̂*(1-p̂*) = 0.25)
# 2. z = norm.ppf(1 - alpha/2)
# 3. n = z² * p̂*(1 - p̂*) / E²
# 4. Rund opp til heltall
# 5. Bonus: regn for E = 0.05 og E = 0.01
`,
    solution: `import math
from scipy import stats

alpha = 0.05
z = stats.norm.ppf(1 - alpha/2)
print(f"z (95%) = {z:.4f}")

# Konservativ p̂* = 0.5
p_star = 0.5

for E in [0.05, 0.03, 0.01]:
    n = (z**2 * p_star * (1 - p_star)) / E**2
    print(f"E = ±{E:.2%}  →  n = {math.ceil(n)}")

# Med forhåndsestimat p̂* = 0.30 (eks: gammelt valgresultat)
print("\\nMed forhåndsestimat p̂* = 0.30:")
for E in [0.05, 0.03, 0.01]:
    n = (z**2 * 0.30 * 0.70) / E**2
    print(f"E = ±{E:.2%}  →  n = {math.ceil(n)}")
`,
    hints: [
      "p̂* = 0.5 gir største n — alltid trygt.",
      "n vokser kvadratisk når E krympes: halver E → 4x n.",
      "Politiske gallups med ±3 % margin → ~1067 respondenter.",
    ],
  },
];
