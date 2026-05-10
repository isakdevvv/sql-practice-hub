produkter = [
{"id": "A101", "navn": "Tastatur", "pris": 899, "lager": 12}, 
{"id": "B205", "navn": "Skjerm", "pris": 4990, "lager": 0},
{"id": "C310", "navn": "Mus", "pris": 449, "lager": 34},
{"id": "D412", "navn": "Headset", "pris": 1299, "lager": 0}, 
{"id": "E517", "navn": "Webkamera", "pris": 699, "lager": 7},
]


        
        

print(tilgjengelig)







""" 
for produkt in produkter:
    if produkt["pris"] < 1000 and produkt["lager"] > 0:
        tilgjengelig
     """







#Lag en dictionary tilgjengelig der nøkkelen er produkt-ID og verdien er produktnavnet - 
# men kun for produkter som er på lager (lager > 0) og koster under 1000 kr.

# Forventet resultat: {"A101": "Tastatur", "C310": "Mus", "E517": "Webkamera"}



