matrise = [
[1, 2, 3, 4],
[5, 6, 7, 8],
[9, 10, 11, 12],
]

odde_tall = []

for i in matrise:
    for j in i:
        if j % 2 != 0:
            odde_tall.append(j)
        
        
print(odde_tall)