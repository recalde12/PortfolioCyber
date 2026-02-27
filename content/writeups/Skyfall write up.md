--- 
title: "Skyfall" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Insane" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#linux #insane

--------
Lo primero que hacemos es el escaneo de puertos abiertos:
![[Pasted image 20240204174208.png]]
Vemos la versión y el servicio que corren:
![[Pasted image 20240204174239.png]]
Vemos el launchpad:
![[Pasted image 20240204174303.png]]
Vemos que la versión del sistema operativo tiene dos posibles vulnerabilidades para luego intentar escalar privilegios.

Metemos en el /etc/hosts el dominio con la ip correspondiente y hacemos un whatweb:
![[Pasted image 20240204174641.png]]
Vemos que nos saca 3 correos que deben de estar en la web, vamos a explorarla:
![[Pasted image 20240204174724.png]]
Vemos una demos que nos dejan probar, pero tenemos que meter el subdominio primero:
![[Pasted image 20240204174930.png]]
entramos a la demo y vemos un panel de login al que podemos acceder con la contraseña y el usuario guest:guest:
![[Pasted image 20240204175018.png]]
vamos hacer un dirsearch de estos dos dominios que  tenemos:
![[Pasted image 20240204180158.png]]
En demo tampoco nos encuentra nada vamos a tratar de ver que podemos hacer en la demo que nos ofrecen.
Investigando la web demos que nos ofrecen, en un apartado donde no nos dejaba acceder por permisos y nos daba un 403 forbidden, podemos bypassearlo con '%0A', por lo que vemos información que no deberíamos,  por ejemplo el siguiente endpoint de la API MinIO:
![[Pasted image 20240205020823.png]]
Nos vamos al endopoint después de añadir el subdominio:
![[Pasted image 20240205022738.png]]
Vemos como una especie de log de la API MinIO.
Viendo MinIO, hay una vulnerabilidad que es la siguiente:
https://github.com/acheiii/CVE-2023-28432/blob/main/CVE-2023-28432.py

Esta vuln permite acceder a un recurso de una versión anterior de minio, permite ejecutarla si estamos en una release antigua, y nos devuelve las variables de entorno siguientes:
![[Pasted image 20240205161229.png]]
Con estas variables de entorno vamos a poder intentar listar directorios con la siguiente herramienta que hemos encontrado en github:
https://github.com/minio/mc

Lo primero que tenemos que hacer después de instalarnos la herramienta es crear un alias con el servidor de minio de skyfall.htb con las claves que hemos sacado:
![[Pasted image 20240205224442.png]]

Una vez creado el alias comprobamos si la conexión se ha establecido sin errores:
![[Pasted image 20240205224557.png]]
Vemos como la conexión se ha establecido.
Vamos a listar posibles buckets:
![[Pasted image 20240205224858.png]]
Nos copiamos en la maquina local el archivo del bucket askyy/home_backup.tar.gz:
![[Pasted image 20240205225015.png]]
Y investigamos el backup del home del usuario Askyy, nos descargamos los 3 backups, para ver que contiene cada uno.
En uno de los 3 en el archivo oculto .bashrc encontramos lo siguiente:
![[Pasted image 20240206030756.png]]
Viendo esto del vault exploramos lo que es, parece una herramienta de autenticación con la que podemos conectarnos de manera rápida a través del CLI, con un token que parece ser este, añadiendo las variables de entorno nosotros también podemos conectarnos:
![[Pasted image 20240206134411.png]]

y además debemos de añadir el nuevo subdominio al /etc/hosts.
Nos instalamos la herramienta del siguiente enlace, en concreto el binario:
https://developer.hashicorp.com/vault/install
![[Pasted image 20240206040416.png]]
Nos conectamos y el warning que nos salta es por que no haría falta añadir la variable de entorno del token solo tenemos que añadir la de 'VAULT_API_ADDR'.

**Otra manera por si no funciona la primera de conectarnos**
![[Pasted image 20240206133947.png]]

Una vez conectado con el servidor lo que vamos hacer es ver los permisos que tenemos sobre ssh:
![[Pasted image 20240206041209.png]]
Nos dice que tenemos el siguiente permiso el de listar.
Como podemos listar, listamos los permisos que tenemos con el siguiente token:

![[Pasted image 20240206041340.png]]

Vemos que tenemos el permiso de conectarnos con una contraseña temporal, por lo que vamos a intentar conectarnos:
https://developer.hashicorp.com/vault/docs/commands/ssh
![[Pasted image 20240206134539.png]]
Efectivamente con la contraseña temporal nos hemos podido conectar,  y tenemos user.txt, ahora debemos de escalar privilegios, vemos que tiene el privilegio de ejecutar vault-unseal algo escrito en yaml, como root, por lo que vamos a intentar ver que podemos hacer para escalar privilegios.
Hemos estado investigando y por lo que veo, lo que hace este comando que podemos ejecutar como sudo esta haciendo es des-sellar el vault y pasar el token nuevo como configuracion de autenticacion del admin, teniendo en cuenta que tenemos el privilegio del admin_otp_key_role, si le pasamos el token que tenemos como configuracion,  podremos conectarnos como admin, por lo que lo primero que tenemos que hacer es ejecutar el comando haber como funciona:
![[Pasted image 20240206150332.png]]
Nos crea un archivo debug.log el cual no podemos leer por que nos lo crea el script, con el permiso de root, por lo que vamos a borrarle y a crear nosotros uno nuevo antes de que lo cree el script:
![[Pasted image 20240206150508.png]]
Como vemos ahora podemos ver el debug.log y podemos ver el master token que crea para la conexión del usuario root.
Con este token es como nos tenemos que conectar como lo hemos hecho antes, cuando nos pida el token a la hora de autenticarnos con root, debemos de meter este master token.

![[Pasted image 20240206142417.png]]
Como vemos nos ha conectado como el usuario root, gracias al privilegio de la contraseña temporal como admin, y gracias a que hemos podido ver el master token.

https://www.hackthebox.com/achievement/machine/802953/586
![[Pasted image 20240206142211.png]]

