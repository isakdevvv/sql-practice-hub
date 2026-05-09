logger = [
"ERROR 192.168.1.1 disk full",
"WARNING 192.168.1.2 high load",
"ERROR 192.168.1.1 disk full",
"INFO 192.168.1.3 backup ok",
"ERROR 192.168.1.4 timeout",
"WARNING 192.168.1.2 high load",
"ERROR 192.168.1.1 disk full",

]

feil_ip = []

for log in logger:
    if log.__contains__("ERROR"):
        log = log.split()
        ip = log[1]
        if ip not in feil_ip:
            feil_ip.append(ip)
            
            
for ip in feil_ip:
    print(ip)