import type { PyExercise } from "./types";

/**
 * TEK-1501-utvidelse — fyller hullene som ikke ble dekket av tidligere
 * gaps/regdiag-batchene:
 *   • z-tester for gjennomsnitt (1 og 2 sample, kjent σ)
 *   • t-tester for små utvalg (1 sample, 2 sample Welch, paret)
 *   • χ²-test for uavhengighet og goodness-of-fit
 *   • Lineær regresjon fra bunn (least squares-formler)
 *   • Korrelasjonskoeffisient fra bunn
 *   • Bootstrap-konfidensintervall (Monte Carlo)
 *   • Statistisk power og sample-size-beregning
 *
 * Alle oppgavene bruker numpy + scipy.stats (begge i Pyodide).
 */
export const PY_TEK1_UTVIDELSE_EXERCISES: PyExercise[] = [
  // ============ Z-TEST ===============================================
  {
    id: "py-tek1-z-test-1samp",
    topic: "TEK-1501 — z-test",
    title: "1-sample z-test for gjennomsnitt (kjent σ)",
    description:
      "Et batteri har spesifikasjon μ=2.5 timer levetid, σ=0.4 (kjent fra produksjonshistorikk). Du måler 36 batterier og får snitt 2.62. Test H₀: μ=2.5 mot H₁: μ≠2.5 på 5% nivå. Beregn z, p-verdi (tosidig) og konkluder.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import norm

# === OPPGAVE ===
# Test-statistikk: z = (x_bar - mu_0) / (sigma / sqrt(n))
# p-verdi tosidig: 2 * (1 - Phi(|z|)) = 2 * norm.sf(|z|)
# Forkast H_0 hvis p < alpha

n = 36
x_bar = 2.62
mu_0 = 2.5
sigma = 0.4
alpha = 0.05

# TODO: beregn z og p
z = None
p = None

print(f"z = {z:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0?", "Ja" if p < alpha else "Nei")

assert abs(z - 1.8) < 0.01
assert abs(p - 0.0719) < 0.001
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import norm

n = 36
x_bar = 2.62
mu_0 = 2.5
sigma = 0.4
alpha = 0.05

se = sigma / np.sqrt(n)
z = (x_bar - mu_0) / se
p = 2 * norm.sf(abs(z))

print(f"z = {z:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0?", "Ja" if p < alpha else "Nei")

assert abs(z - 1.8) < 0.01
assert abs(p - 0.0719) < 0.001
print("OK")
`,
    hints: [
      "Standardfeilen til snittet er σ/√n.",
      "norm.sf(z) = 1 - norm.cdf(z) — bedre numerisk for store z.",
      "Tosidig p = 2 · norm.sf(|z|).",
    ],
    docs: [
      {
        title: "scipy.stats.norm",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html",
        note: ".cdf, .sf, .ppf, .isf gir kdf, overlevelse, kvantil, invers overlevelse.",
      },
    ],
  },

  {
    id: "py-tek1-z-test-2samp",
    topic: "TEK-1501 — z-test",
    title: "2-sample z-test (kjente standardavvik)",
    description:
      "To produksjonslinjer A og B. Linje A: n=50 målinger, snitt 102.3. Linje B: n=40, snitt 100.8. σ_A=5, σ_B=4 fra historikk. Test H₀: μ_A = μ_B mot H₁: μ_A > μ_B (énsidig) på 5% nivå.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import norm

# Énsidig: forkast hvis z > z_alpha
n_a, n_b = 50, 40
xbar_a, xbar_b = 102.3, 100.8
sig_a, sig_b = 5, 4
alpha = 0.05

# z = (x_a - x_b) / sqrt(sig_a^2/n_a + sig_b^2/n_b)
# p = norm.sf(z) for H_1: mu_a > mu_b
# TODO
z = None
p = None

print(f"z = {z:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0 (mu_A = mu_B)?", "Ja" if p < alpha else "Nei")

assert abs(z - 1.587) < 0.01
assert abs(p - 0.0563) < 0.001
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import norm

n_a, n_b = 50, 40
xbar_a, xbar_b = 102.3, 100.8
sig_a, sig_b = 5, 4
alpha = 0.05

se = np.sqrt(sig_a**2 / n_a + sig_b**2 / n_b)
z = (xbar_a - xbar_b) / se
p = norm.sf(z)

print(f"z = {z:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0 (mu_A = mu_B)?", "Ja" if p < alpha else "Nei")

assert abs(z - 1.587) < 0.01
assert abs(p - 0.0563) < 0.001
print("OK")
`,
    hints: [
      "Standardfeilen til differansen er √(σ_A²/n_A + σ_B²/n_B).",
      "Énsidig p = norm.sf(z) når H_1 er at venstre side er større.",
      "Husk: 0.0563 > 0.05 → IKKE statistisk signifikant.",
    ],
    docs: [
      {
        title: "Énsidig vs tosidig hypotesetest",
        url: "https://en.wikipedia.org/wiki/One-_and_two-tailed_tests",
        note: "Énsidig brukes når domeneteorien sier at effekten KUN kan gå én vei.",
      },
    ],
  },

  // ============ T-TEST ===============================================
  {
    id: "py-tek1-t-test-1samp",
    topic: "TEK-1501 — t-test",
    title: "1-sample t-test (lite utvalg, ukjent σ)",
    description:
      "Du måler reaksjonstid på 12 personer: gjennomsnitt 1.04 sek, standardavvik s=0.18. Tester om μ=1.0 (H₀) mot H₁: μ≠1.0. Bruk t-fordeling med df=11.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import t

n = 12
x_bar = 1.04
s = 0.18
mu_0 = 1.0
alpha = 0.05
df = n - 1

# t = (x_bar - mu_0) / (s / sqrt(n))
# p = 2 * t.sf(|t|, df)
# TODO
t_stat = None
p = None
t_crit = t.ppf(1 - alpha/2, df)

print(f"t = {t_stat:.3f}")
print(f"t_kritisk = ±{t_crit:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0?", "Ja" if p < alpha else "Nei")

assert abs(t_stat - 0.770) < 0.01
assert abs(p - 0.4577) < 0.001
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import t

n = 12
x_bar = 1.04
s = 0.18
mu_0 = 1.0
alpha = 0.05
df = n - 1

se = s / np.sqrt(n)
t_stat = (x_bar - mu_0) / se
p = 2 * t.sf(abs(t_stat), df)
t_crit = t.ppf(1 - alpha/2, df)

print(f"t = {t_stat:.3f}")
print(f"t_kritisk = ±{t_crit:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0?", "Ja" if p < alpha else "Nei")

assert abs(t_stat - 0.770) < 0.01
assert abs(p - 0.4577) < 0.001
print("OK")
`,
    hints: [
      "t-fordeling med df = n - 1 (frihetsgrader).",
      "t.sf(x, df) = sannsynlighet for å se en t-verdi STØRRE enn x.",
      "t.ppf(1-α/2, df) gir tosidig kritisk verdi.",
    ],
    docs: [
      {
        title: "scipy.stats.t",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.t.html",
        note: "Bruk t-fordeling når n < 30 OG σ ukjent. For n ≥ 30 nærmer t-fordelingen seg normalfordelingen.",
      },
    ],
  },

  {
    id: "py-tek1-t-test-2samp-welch",
    topic: "TEK-1501 — t-test",
    title: "Welch's t-test (to uavhengige utvalg, ulik varians)",
    description:
      "To medisiner mot blodtrykk. Gruppe A (n=15): snitt 132 mm Hg, s=8. Gruppe B (n=18): snitt 138, s=12. Test om μ_A ≠ μ_B (tosidig) med Welch's t-test (ikke pooled — variansene er ulike).",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import t

n_a, n_b = 15, 18
xbar_a, xbar_b = 132, 138
s_a, s_b = 8, 12
alpha = 0.05

# Welch:
# se = sqrt(s_a^2/n_a + s_b^2/n_b)
# t = (xbar_a - xbar_b) / se
# df_welch = (s_a^2/n_a + s_b^2/n_b)^2 / ((s_a^2/n_a)^2/(n_a-1) + (s_b^2/n_b)^2/(n_b-1))
# TODO
t_stat = None
df = None
p = None

print(f"t = {t_stat:.3f}")
print(f"df = {df:.2f}")
print(f"p = {p:.4f}")

assert abs(t_stat - (-1.713)) < 0.01
assert abs(df - 29.71) < 0.1
assert abs(p - 0.0971) < 0.001
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import t

n_a, n_b = 15, 18
xbar_a, xbar_b = 132, 138
s_a, s_b = 8, 12
alpha = 0.05

va_n = s_a**2 / n_a
vb_n = s_b**2 / n_b
se = np.sqrt(va_n + vb_n)
t_stat = (xbar_a - xbar_b) / se

# Welch–Satterthwaite degrees of freedom
df = (va_n + vb_n)**2 / (va_n**2 / (n_a - 1) + vb_n**2 / (n_b - 1))
p = 2 * t.sf(abs(t_stat), df)

print(f"t = {t_stat:.3f}")
print(f"df = {df:.2f}")
print(f"p = {p:.4f}")

assert abs(t_stat - (-1.713)) < 0.01
assert abs(df - 29.71) < 0.1
assert abs(p - 0.0971) < 0.001
print("OK")
`,
    hints: [
      "Welch antar IKKE lik varians — tryggere enn Student's t-test i praksis.",
      "Welch–Satterthwaite-formelen for df er stygg, men gir typisk en ikke-heltallig df.",
      "scipy har dette innebygd: stats.ttest_ind(a, b, equal_var=False) — men implementer fra bunn først for å forstå.",
    ],
    docs: [
      {
        title: "Welch's t-test",
        url: "https://en.wikipedia.org/wiki/Welch%27s_t-test",
        note: "R og scipy bruker Welch som default — Student's pooled t-test krever lik varians, en sjelden situasjon i praksis.",
      },
    ],
  },

  {
    id: "py-tek1-t-test-paired",
    topic: "TEK-1501 — t-test",
    title: "Paret t-test (før/etter-måling)",
    description:
      "10 atleter måler hjertepuls før (b=[68,72,75,70,77,80,65,71,69,74]) og etter (a=[64,70,71,68,73,76,63,69,67,71]) en treningsperiode. Test om endringen er signifikant. Paret t-test = 1-sample t-test på differansene mot 0.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import t

before = np.array([68, 72, 75, 70, 77, 80, 65, 71, 69, 74])
after  = np.array([64, 70, 71, 68, 73, 76, 63, 69, 67, 71])

# diff = before - after  (positiv = puls gikk ned)
# t = mean(diff) / (std(diff, ddof=1) / sqrt(n))
# H_0: mean(diff) = 0,  H_1: != 0
alpha = 0.05

# TODO
diff = None
t_stat = None
p = None

print(f"snitt-differanse = {diff.mean():.2f}")
print(f"t = {t_stat:.3f}, p = {p:.6f}")

assert abs(diff.mean() - 2.9) < 0.01
assert abs(t_stat - 9.222) < 0.05
assert p < 1e-4
print("OK — pulsen gikk signifikant ned etter trening")
`,
    solution: `import numpy as np
from scipy.stats import t

before = np.array([68, 72, 75, 70, 77, 80, 65, 71, 69, 74])
after  = np.array([64, 70, 71, 68, 73, 76, 63, 69, 67, 71])
alpha = 0.05

diff = before - after
n = len(diff)
df = n - 1
mean_d = diff.mean()
sd_d = diff.std(ddof=1)
se = sd_d / np.sqrt(n)
t_stat = mean_d / se
p = 2 * t.sf(abs(t_stat), df)

print(f"snitt-differanse = {mean_d:.2f}")
print(f"t = {t_stat:.3f}, p = {p:.6f}")

assert abs(mean_d - 2.9) < 0.01
assert abs(t_stat - 9.222) < 0.05
assert p < 1e-4
print("OK — pulsen gikk signifikant ned etter trening")
`,
    hints: [
      "Paret = de samme individene måles to ganger — analyser DIFFERANSEN.",
      "ddof=1 i np.std() gir utvalgsstandardavvik (delt på n-1), som t-test krever.",
      "df = n - 1 der n er antall PAR (ikke 2n).",
    ],
    docs: [
      {
        title: "Paired t-test",
        url: "https://en.wikipedia.org/wiki/Paired_difference_test",
        note: "Bruk paret når dataene er FØR/ETTER på samme enheter. Bruk uavhengig (Welch) når gruppene er forskjellige individer.",
      },
    ],
  },

  // ============ CHI-SQUARED =========================================
  {
    id: "py-tek1-chi2-uavhengighet",
    topic: "TEK-1501 — χ²-test",
    title: "χ²-test for uavhengighet (kontingenstabell)",
    description:
      "Spørreundersøkelse av røykevaner kontra utdanningsnivå. Test om de er uavhengige (H₀) eller assosierte (H₁) med χ²-test. Bruk scipy.stats.chi2_contingency.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import chi2_contingency

# Rader: utdanning (Grunnskole, VGS, Univ)
# Kolonner: røyker (Ja, Nei)
table = np.array([
    [35, 65],   # Grunnskole
    [25, 75],   # VGS
    [10, 90],   # Univ
])

# TODO: bruk chi2_contingency, hent ut chi2, p, df, expected
chi2, p, df, expected = None, None, None, None

print(f"chi2 = {chi2:.3f}")
print(f"df = {df}")
print(f"p = {p:.4f}")
print(f"forventet (under H_0):\\n{expected}")

assert abs(chi2 - 17.702) < 0.01
assert df == 2
assert p < 0.001
print("OK — utdanning og røyking er ikke uavhengige")
`,
    solution: `import numpy as np
from scipy.stats import chi2_contingency

table = np.array([
    [35, 65],
    [25, 75],
    [10, 90],
])

chi2, p, df, expected = chi2_contingency(table)

print(f"chi2 = {chi2:.3f}")
print(f"df = {df}")
print(f"p = {p:.4f}")
print(f"forventet (under H_0):\\n{expected}")

assert abs(chi2 - 17.702) < 0.01
assert df == 2
assert p < 0.001
print("OK — utdanning og røyking er ikke uavhengige")
`,
    hints: [
      "chi2_contingency returnerer (chi2, p, df, expected_array).",
      "Forventet i celle (i,j): (rad_sum_i × kol_sum_j) / total_sum.",
      "df = (antall_rader - 1) × (antall_kolonner - 1) — her 2×1 = 2.",
    ],
    docs: [
      {
        title: "scipy.stats.chi2_contingency",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chi2_contingency.html",
        note: "Bruker forutsetningen at hver forventet celleverdi er ≥ 5. Hvis ikke, bruk Fisher's exact i stedet.",
      },
    ],
  },

  {
    id: "py-tek1-chi2-goodness-of-fit",
    topic: "TEK-1501 — χ²-test",
    title: "χ²-goodness-of-fit (forventet fordeling)",
    description:
      "En terning er kastet 120 ganger med utfall: 1→18, 2→23, 3→16, 4→21, 5→17, 6→25. Test om terningen er rettferdig (H₀: hver side har p=1/6 = 20 forventet).",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import chisquare

obs = np.array([18, 23, 16, 21, 17, 25])
n = obs.sum()
expected = np.full(6, n / 6)  # 20 hver
alpha = 0.05

# Bruk chisquare. Returnerer (chi2, p)
# TODO
chi2 = None
p = None

print(f"obs sum = {n}, expected = {expected.tolist()}")
print(f"chi2 = {chi2:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0 (rettferdig terning)?", "Ja" if p < alpha else "Nei")

assert abs(chi2 - 3.2) < 0.01
assert abs(p - 0.6692) < 0.001
print("OK — terningen kan godt være rettferdig")
`,
    solution: `import numpy as np
from scipy.stats import chisquare

obs = np.array([18, 23, 16, 21, 17, 25])
n = obs.sum()
expected = np.full(6, n / 6)
alpha = 0.05

chi2, p = chisquare(obs, f_exp=expected)

print(f"obs sum = {n}, expected = {expected.tolist()}")
print(f"chi2 = {chi2:.3f}")
print(f"p = {p:.4f}")
print(f"forkast H_0 (rettferdig terning)?", "Ja" if p < alpha else "Nei")

assert abs(chi2 - 3.2) < 0.01
assert abs(p - 0.6692) < 0.001
print("OK — terningen kan godt være rettferdig")
`,
    hints: [
      "chisquare(observed, f_exp=expected) — gir (chi2, p).",
      "df = k - 1 (k = antall kategorier) når man tester mot kjent fordeling.",
      "Hvis du IKKE kjenner forventet fordeling og estimerer parametere fra dataene, må du subtrahere antall estimerte parametere fra df.",
    ],
    docs: [
      {
        title: "scipy.stats.chisquare",
        url: "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chisquare.html",
        note: "Gjerne kjent som Pearson chi-square goodness-of-fit. For svært små forventede frekvenser, bruk Fisher's exact eller G-test.",
      },
    ],
  },

  // ============ REGRESJON FRA BUNN ====================================
  {
    id: "py-tek1-ols-fra-bunn",
    topic: "TEK-1501 — Regresjon",
    title: "Lineær regresjon fra bunn (least squares-formler)",
    description:
      "Implementer enkel lineær regresjon (én x-variabel) fra bunn. Beregn β₀, β₁ med formlene β₁ = Σ(x-x̄)(y-ȳ) / Σ(x-x̄)², β₀ = ȳ - β₁·x̄. Verifisér mot scipy.stats.linregress.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import linregress

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
y = np.array([2.1, 3.9, 6.2, 8.1, 9.8, 12.1, 14.0, 16.2])

def lin_reg(x, y):
    """Returner (beta_0, beta_1) — intercept og slope."""
    # TODO: implementer least squares-formlene
    pass


b0, b1 = lin_reg(x, y)
print(f"y = {b0:.4f} + {b1:.4f} * x")

# Sammenlign med scipy
res = linregress(x, y)
print(f"scipy:  y = {res.intercept:.4f} + {res.slope:.4f} * x")

assert abs(b0 - res.intercept) < 1e-6
assert abs(b1 - res.slope) < 1e-6
print("OK — egen implementasjon matcher scipy")
`,
    solution: `import numpy as np
from scipy.stats import linregress

x = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
y = np.array([2.1, 3.9, 6.2, 8.1, 9.8, 12.1, 14.0, 16.2])

def lin_reg(x, y):
    x_bar = x.mean()
    y_bar = y.mean()
    b1 = np.sum((x - x_bar) * (y - y_bar)) / np.sum((x - x_bar)**2)
    b0 = y_bar - b1 * x_bar
    return b0, b1


b0, b1 = lin_reg(x, y)
print(f"y = {b0:.4f} + {b1:.4f} * x")

res = linregress(x, y)
print(f"scipy:  y = {res.intercept:.4f} + {res.slope:.4f} * x")

assert abs(b0 - res.intercept) < 1e-6
assert abs(b1 - res.slope) < 1e-6
print("OK — egen implementasjon matcher scipy")
`,
    hints: [
      "x_bar = x.mean(); y_bar = y.mean()",
      "Slope: dekomponer telleren og nevneren med np.sum((x - x_bar) * ...).",
      "Intercept: settes så regresjonslinjen går gjennom (x̄, ȳ).",
    ],
    docs: [
      {
        title: "Least squares — minste kvadraters metode",
        url: "https://en.wikipedia.org/wiki/Simple_linear_regression",
        note: "Formelen kommer fra å minimere SSR = Σ(y_i - β_0 - β_1·x_i)² ved å sette ∂/∂β_0 = 0 og ∂/∂β_1 = 0.",
      },
    ],
  },

  {
    id: "py-tek1-pearson-r-fra-bunn",
    topic: "TEK-1501 — Regresjon",
    title: "Pearson korrelasjon r fra bunn",
    description:
      "Implementer korrelasjonskoeffisienten r = Σ(x-x̄)(y-ȳ) / √(Σ(x-x̄)² · Σ(y-ȳ)²). Sammenlign med scipy.stats.pearsonr. Vurder også R² = r².",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import pearsonr

x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
y = np.array([2.1, 3.5, 5.2, 6.8, 8.9, 10.1, 12.5, 13.8, 16.2, 17.9])

def my_r(x, y):
    # TODO: implementer
    pass


r = my_r(x, y)
r_scipy, _ = pearsonr(x, y)
r2 = r ** 2

print(f"r       = {r:.4f}")
print(f"scipy r = {r_scipy:.4f}")
print(f"R^2     = {r2:.4f} ({r2*100:.1f}% av variansen forklart)")

assert abs(r - r_scipy) < 1e-6
assert r2 > 0.99
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import pearsonr

x = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dtype=float)
y = np.array([2.1, 3.5, 5.2, 6.8, 8.9, 10.1, 12.5, 13.8, 16.2, 17.9])

def my_r(x, y):
    dx = x - x.mean()
    dy = y - y.mean()
    return np.sum(dx * dy) / np.sqrt(np.sum(dx**2) * np.sum(dy**2))


r = my_r(x, y)
r_scipy, _ = pearsonr(x, y)
r2 = r ** 2

print(f"r       = {r:.4f}")
print(f"scipy r = {r_scipy:.4f}")
print(f"R^2     = {r2:.4f} ({r2*100:.1f}% av variansen forklart)")

assert abs(r - r_scipy) < 1e-6
assert r2 > 0.99
print("OK")
`,
    hints: [
      "Definer dx = x - x.mean(), dy = y - y.mean(). Bruk dem 3 ganger.",
      "Telleren er kovariansen ganger n. Nevneren er produktet av standardavvikene ganger n.",
      "R² er andelen variansen i y som forklares av lineær regresjon på x.",
    ],
    docs: [
      {
        title: "Pearson correlation",
        url: "https://en.wikipedia.org/wiki/Pearson_correlation_coefficient",
        note: "r ∈ [-1, 1]. r = ±1 er perfekt lineær. r = 0 er ingen LINEÆR sammenheng (men kan være ikke-lineær!).",
      },
    ],
  },

  // ============ BOOTSTRAP & POWER ===================================
  {
    id: "py-tek1-bootstrap-ci-mean",
    topic: "TEK-1501 — Bootstrap & power",
    title: "Bootstrap-CI for gjennomsnitt (Monte Carlo)",
    description:
      "Bootstrap = resample DATA med tilbakelegging mange ganger og se hvordan estimatet (gjennomsnittet) varierer. Lag 95% bootstrap-CI med 5000 resamplinger. Sammenlign med t-baseert CI.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import t

rng = np.random.default_rng(42)
data = np.array([4.2, 5.1, 6.3, 4.9, 5.5, 6.0, 5.8, 4.7, 5.3, 6.1, 5.0, 4.8])
n = len(data)

# Bootstrap: trekk n samples med tilbakelegging, beregn snitt, gjenta B ganger.
B = 5000
boot_means = np.empty(B)
# TODO: fyll inn boot_means

# 95% CI = persentilene 2.5 og 97.5
ci_low, ci_high = np.percentile(boot_means, [2.5, 97.5])

# Sammenlign med t-CI
mean = data.mean()
se = data.std(ddof=1) / np.sqrt(n)
t_crit = t.ppf(0.975, n - 1)
t_low, t_high = mean - t_crit * se, mean + t_crit * se

print(f"snitt           = {mean:.3f}")
print(f"bootstrap 95% CI = ({ci_low:.3f}, {ci_high:.3f})")
print(f"t-basert  95% CI = ({t_low:.3f}, {t_high:.3f})")

# Bootstrap-CI skal være innenfor 0.1 av t-CI for nesten-normale data
assert abs(ci_low - t_low) < 0.1
assert abs(ci_high - t_high) < 0.1
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import t

rng = np.random.default_rng(42)
data = np.array([4.2, 5.1, 6.3, 4.9, 5.5, 6.0, 5.8, 4.7, 5.3, 6.1, 5.0, 4.8])
n = len(data)

B = 5000
boot_means = np.empty(B)
for i in range(B):
    sample = rng.choice(data, size=n, replace=True)
    boot_means[i] = sample.mean()

ci_low, ci_high = np.percentile(boot_means, [2.5, 97.5])

mean = data.mean()
se = data.std(ddof=1) / np.sqrt(n)
t_crit = t.ppf(0.975, n - 1)
t_low, t_high = mean - t_crit * se, mean + t_crit * se

print(f"snitt           = {mean:.3f}")
print(f"bootstrap 95% CI = ({ci_low:.3f}, {ci_high:.3f})")
print(f"t-basert  95% CI = ({t_low:.3f}, {t_high:.3f})")

assert abs(ci_low - t_low) < 0.1
assert abs(ci_high - t_high) < 0.1
print("OK")
`,
    hints: [
      "rng.choice(data, size=n, replace=True) trekker n elementer med tilbakelegging.",
      "Loop B ganger. Hver iterasjon: trekk en bootstrap-sample, beregn statistikk, lagre.",
      "Persentil-CI: np.percentile(boot_means, [2.5, 97.5]).",
    ],
    docs: [
      {
        title: "Bootstrap (statistics)",
        url: "https://en.wikipedia.org/wiki/Bootstrapping_(statistics)",
        note: "Efron 1979 — bootstrap fungerer når formel-baserte CI er vanskelige (f.eks. CI for medianen, korrelasjon, eller komplekse estimatorer).",
      },
    ],
  },

  {
    id: "py-tek1-power-z-test",
    topic: "TEK-1501 — Bootstrap & power",
    title: "Power for 1-sample z-test",
    description:
      "Du planlegger studien: H₀: μ=100, H₁: μ=104, σ=8, n=25, α=0.05 (tosidig). Hva er power = P(forkast H₀ | H₁ sann)? Bruk normalfordeling.",
    requires: ["scipy"],
    starter: `import numpy as np
from scipy.stats import norm

mu_0 = 100
mu_1 = 104
sigma = 8
n = 25
alpha = 0.05

se = sigma / np.sqrt(n)
z_crit = norm.ppf(1 - alpha/2)  # ±1.96

# Beregn de to grensene som gjør at H_0 forkastes:
# x_bar < mu_0 - z_crit * se  ELLER  x_bar > mu_0 + z_crit * se
upper = mu_0 + z_crit * se
lower = mu_0 - z_crit * se

# Under H_1 (mu = 104), hva er P(x_bar > upper) + P(x_bar < lower)?
# Standardiser: Z = (x_bar - mu_1) / se
# TODO
power = None

print(f"kritiske grenser ved H_0: ({lower:.2f}, {upper:.2f})")
print(f"power = P(forkast H_0 | mu=mu_1) = {power:.3f}")
# Med så stor effekt (delta = 4, se = 1.6) er power høy
assert abs(power - 0.7054) < 0.005
print("OK")
`,
    solution: `import numpy as np
from scipy.stats import norm

mu_0 = 100
mu_1 = 104
sigma = 8
n = 25
alpha = 0.05

se = sigma / np.sqrt(n)
z_crit = norm.ppf(1 - alpha/2)
upper = mu_0 + z_crit * se
lower = mu_0 - z_crit * se

# Under H_1: x_bar ~ N(mu_1, se)
# P(x_bar > upper) = P(Z > (upper - mu_1)/se) = norm.sf((upper - mu_1)/se)
# P(x_bar < lower) = norm.cdf((lower - mu_1)/se)
power = norm.sf((upper - mu_1) / se) + norm.cdf((lower - mu_1) / se)

print(f"kritiske grenser ved H_0: ({lower:.2f}, {upper:.2f})")
print(f"power = P(forkast H_0 | mu=mu_1) = {power:.3f}")
assert abs(power - 0.7054) < 0.005
print("OK")
`,
    hints: [
      "Power = sannsynligheten for å forkaste H_0 GITT at H_1 er sann.",
      "Først: finn de to kritiske grensene under H_0 (de samme som for tosidig test).",
      "Så: beregn sannsynligheten for at observert x_bar (under H_1) faller utenfor disse grensene.",
    ],
    docs: [
      {
        title: "Statistical power",
        url: "https://en.wikipedia.org/wiki/Power_(statistics)",
        note: "Standard mål: ønsket power ≥ 0.80. For å øke power: større n, større effekt-størrelse, lavere σ, eller høyere α.",
      },
    ],
  },
];
