ansatte = [
{"navn": "Kari", "avdeling": "IT", "lønn": 620000},
{"navn": "Ola", "avdeling": "HR", "lønn": 540000},
{"navn": "Lise", "avdeling": "IT", "lønn": 710000},
{"navn": "Per", "avdeling": "HR", "lønn": 490000},
{"navn": "Anne", "avdeling": "IT", "lønn": 580000},
]

liste_it = []

for ansatt in ansatte:
    if ansatt["lønn"] > 600000 and ansatt["avdeling"] == "IT":
        liste_it.append(ansatt["navn"].upper())


print(liste_it)

