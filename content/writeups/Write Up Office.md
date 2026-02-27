---
title: "Office" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#Hard #windows 

----
Lo primero que hacemos es escanear los puertos de la maquina:
![[Pasted image 20240218231857.png]]Vemos la información de los servicios que corren por estos puertos:
![[Pasted image 20240218231937.png]]
Añadimos el dominio al /etc/hosts -> office.htb, y le hacemos un whatweb y la exploramos:
![[Pasted image 20240218232128.png]]
![[Pasted image 20240218233202.png]]
Hacemos un dirsearch sobre la web:
![[Pasted image 20240218233102.png]]
Explorando la web y los directorios hemos encontrado un panel de administración de joomla:
![[Pasted image 20240218233224.png]]
Por lo que vamos a clonarnos el joomscan de github: git clone https://github.com/rezasp/joomscan.git, y escaneamos el joomla:
![[Pasted image 20240219000259.png]]
Vemos la versión del joomla, vamos a buscar en google por la versión haber si existe alguna vulnerabilidad, y vemos que existe una para esta version de joomla:
https://github.com/0xNahim/CVE-2023-23752
Por lo que vamos a probar a testear si es posible ejecutarla en esta maquina:
![[Pasted image 20240219000953.png]]
Como vemos si que es vulnerable, y nos da un usuario y una contraseña, hemos intentado conectarnos a smb, con evil-winrm pero no nos deja, por lo que con kerberos vamos a intentar enumerar posibles usuarios:

Vemos los posibles usuarios que existen por lo que vamos a probar a conectarnos con Kerberos, pero no nos va a dejar, por lo que vamos a probar con todos los usuarios a conectarnos por smb:
![[Pasted image 20240219183611.png]]
Como vemos con el usuario dwolfe y la contraseña que hemos sacado gracias a la vuln en joomla, nos deja conectarnos y listar los recursos compartidos:

![[Pasted image 20240221224145.png]]
>Hemos descargado el archivo .pcap que había dentro de SOC Analysis, vamos a analizarlo.

En el archivo .pcap, encontramos un hash NTLM de autenticación de un usuario:
![[Pasted image 20240222201221.png]]

Nos lo copiamos en un archivo, pero no nos va a valer, por lo que vamos a filtrar ahora por kerberos:
![[Pasted image 20240223002656.png]]

Vemos dos paquetes Krb5, y vemos hasta 3 hashes, nos interesa el cipher, con este podemos crear un hash, que podremos intentar crackear gracias al siguiente articulo https://vbscrub.com/2020/02/27/getting-passwords-from-kerberos-pre-authentication-packets/:
![[Pasted image 20240223094837.png]]
Lo crakeamos con el hashcat con el siguiente comando:
```bash
	hashcat -a 0 -m 19900 cipher.txt /usr/share/wordlist/rockyou.txt
```
Y nos da la contraseña playboy69.

Con esta contraseña podemos acceder al panel administrativo de Joomla con la contraseña de tstark que es la que hemos sacado con el hash que hemos creado administrator:playboy69:

![[Pasted image 20240223095225.png]]

Hay una forma muy sencilla de ganar acceso a la shell desde aqui ya, lo que tenemos que hacer es irnos a los templates, y añadir una reverse shell al código:
![[Pasted image 20240223120806.png]]

Nos ponemos en escucha por el puerto que le hayamos indicado, en la reverse y recargamos la ruta para acceder a dicho archivo en la web, y nos dará la shell:

![[Pasted image 20240223120902.png]]
![[Pasted image 20240223120916.png]]
Esta parte la explica muy bien S4vitar(https://www.youtube.com/watch?v=2ZzVu5mdzgA), ahora lo que tenemos que hacer es ir viendo como podemos conectarnos con usuarios con mas privilegios ya que con este no tenemos todavía ni user flag.

Una vez estamos conectados probamos a vulnerar el libreoffice, con el siguiente script en python https://github.com/rmdavy/badodf/, este lo que va hacer es generarnos un archivo odt malicioso que si se ejecuta en la maquina victima y nos ponemos en escucha con el responder nos llegara el hash del usuario que lo ejecute.

![[Pasted image 20240223135616.png]]
Conseguimos el hash del usuario web_account. Pero no vamos a poder hacer mucho con este, por lo que vamos a intentar hacer mas cosas, como por ejemplo con RunasCs.exe intentar conectarnos con el usuario tstark del cual tenemos la contraseña, por lo que nos pasamos el RunasCs.exe con certutil, y lo ejecutamos:
![[Pasted image 20240223152511.png]]
Y por donde estamos en escucha recibo la shell:
![[Pasted image 20240223152546.png]]
Lo que vemos una vez estamos como tstark, es que parece ser que la aplicación esta montada con XAMPP, sabemos que tenemos una versión de libre office vulnerable, también vemos que tienen un puerto abierto el 8083,  vamos hacer portforwarding con chisel.
Desde la maquina victima ejecutamos con chisel el siguiente comando:
![[Pasted image 20240224180715.png]]
Y desde la atacante:
![[Pasted image 20240224180754.png]]
Una vez hecho el portforwarding, lo que tenemos que hacer es irnos a nuestro puerto local 8083 que sera el de la maquina victima y veremos el contenido:
![[Pasted image 20240224180841.png]]

Si nos vamos a subbmit application:
![[Pasted image 20240224180916.png]]
Vemos esto.
Pero no nos deja subir el archivo nose por que puede que sea error de mi maquina, vámonos al código fuente haber en que ruta guarda los archivos que subimos:
![[Pasted image 20240224181322.png]]
Por lo que vamos a crear un payload, para hacer una reverse en windows y lo tenemos que subir a una ruta en la que todos los usuarios puedan leer:
![[Pasted image 20240224181521.png]]
Nos compartimos el recurso levantandonos un server con python por ejemplo, y nos los descargamos en la maquina con certutil:
![[Pasted image 20240224181757.png]]
Ahora creamos el odt malicioso con el siguiente exploit de un POC https://github.com/elweth-sec/CVE-2023-2255:
![[Pasted image 20240224181913.png]]
Y este archivo le subimos a la ruta en donde la aplicación lo guardaría si lo subiésemos desde esta:
![[Pasted image 20240224182031.png]]
Nos ponemos en escucha con metasploit por el puerto en el que hemos configurado en el payload:
![[Pasted image 20240224182122.png]]
Y ganamos una shell, pivotando al usuario ppots.
Ahora con este usuario vamos a ver como podemos pivotar al siguiente usuario, vamos a ver las credenciales que tenemos guardadas:
![[Pasted image 20240224185851.png]]
![[Pasted image 20240224190621.png]]
Vemos que tenemos unas credenciales guardadas del usuario hhogan.

Tenemos que sacar el identificador de seguridad del usuario hhogan con el siguiente comando:
![[Pasted image 20240224193729.png]]


[https://www.hackthebox.com/achievement/machine/802953/588](https://www.hackthebox.com/achievement/machine/802953/588 "https://www.hackthebox.com/achievement/machine/802953/588
(https://www.hackthebox.com/achievement/machine/802953/588)")
