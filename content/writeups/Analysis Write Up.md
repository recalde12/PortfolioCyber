--- 
title: "Analysis"
platform: "Hackthebox" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#windows #Hard 

----

Lo primero es escanear los puertos y los servicios que nos interesan en la maquina:
![[Pasted image 20240123205330.png]]
![[Pasted image 20240123205350.png]]
Probammos a conectarnos por rpcclient de manera anonima:
![[Pasted image 20240125141623.png]]
Nos deja conectarnos pero no parece que podamos hacer gran cosa por lo que seguimos con el fuzz.

Vemos que tenemos que incluir en el /etc/hosts el dominio analysis.htb, y además, explorando la web y fuzzeando por directorios no encontramos nada por lo que vamos  a buscar posibles subdominios:

![[Pasted image 20240123205222.png]]
Los metemos en el /etc/hosts:
![[Pasted image 20240123210123.png]]
Vamos a ver los directorios ahora haber si podemos encontrar alguno que nos interese:
![[Pasted image 20240123210612.png]]
Vemos la ruta users y employees vamos a probar a fuzzearlas:
![[Pasted image 20240123210806.png]]
Vemos como con employees vemos un panel de login:
![[Pasted image 20240123211101.png]]
Con la ruta users/ encontramos un list.php:
![[Pasted image 20240123211133.png]]
Como vemos que estamos con ldap, vamos a probar a hacer inyecciones con ldap haber si podemos sacar algo de información por ahí:
![[Pasted image 20240123212532.png]]
Probamos en el panel del login pero no parece que sea vulnerable a inyecciones ldap, por lo que vamos a probar con list.php si no probaremos con demás subdominios haber si podemos encontrar información, nos esta pidiendo un parámetro por lo que vamos a fuzzear por este:
![[Pasted image 20240125195129.png]]
Hemos hecho mach solo con lo que no nos devuelve nada en la respuesta ya que es el que va a ser valido, por que si no lo es nos devuelve la frase 'missing parameter', 
A través de este parámetro hemos encontrado una ldap inyection:
![[Pasted image 20240127130809.png]]

hemos sacado las siguientes credenciales de un usuario llamado technician:
![[Pasted image 20240126171841.png]]

Nos logueamos en la web:
![[Pasted image 20240126171921.png]]
Vemos que podemos subir un archivo.
Vamos a fuzzear a partir de dashboard a ver si encontramos algun directorio en el que se pueda estar subiendo:
![[Pasted image 20240126172453.png]]
Vemos el directorio uploads por lo que vamos a tratar de subir un archivo y ver si este se sube:
![[Pasted image 20240126172601.png]]
Vemos tras subir el archivo que efectivamente si que se sube en esta ruta 'uploads':
![[Pasted image 20240126172710.png]]

Vamos a tratar de mandarnos una reverse shell, como estamos en una maquina windows el archivo subido anteriormente no va a funcionar con un one-liner normal de bash obviamente por lo que en github hemos encontrado la siguiente herramienta:
https://github.com/Dhayalanb/windows-php-reverse-shell/blob/master/Reverse%20Shell.php
Subiendo un archivo con el código de la reverse shell anterior y modificando la ip a la que se lo manda y el puerto, cuando estemos en escucha por el puerto que le indiquemos nos dará la shell:
![[Pasted image 20240126174551.png]]
![[Pasted image 20240126180451.png]]
![[Pasted image 20240126180533.png]]

![[Pasted image 20240126174631.png]]
Ahora vamos a tratar de enumerar el sistema windows, para encontrar la flag de user.txt y 
después tratar de subir privilegios:
#enumerandowin
Tiramos la herramienta winPeas:https://github.com/carlospolop/PEASS-ng/releases/tag/20240124-4b54e914





hemos encontrado en el archivo list.php, las siguientes credenciales, gracias a WinPeas:
![[Pasted image 20240127020948.png]]

Ahora teniendo estas credenciales de webservice nos vamos a mandar una reverse shell para conectarnos con el usuario web service, debido a a que estamos con windows nos vamos a crear la reverse shell con metasploit:

**Foto de la reverse con meta**

Una vez nos conectamos con webservice, volvemos a enumerar el sistema con este, y vemos las credenciales de jdoe.

**foto Credenciales JDoe**

Nos conectamos con [evil-winrm](https://github.com/Hackplayers/evil-winrm):
![[Pasted image 20240127134434.png]]
Encontramos la flag:
![[Pasted image 20240127134152.png]]
Investigando por los directorio vemos Snort, hasta ahora no le habíamos hecho mucho caso, investigando al parecer es vulnerable, a un DLL hijacking:https://notchxor.github.io/oscp-notes/4-win-privesc/6-dll-hijacking/

![[Pasted image 20240127134045.png]]
Las dll normalmente son librerías, por lo que vamos a ver que permiso tenemos en las carpetas de lib:
![[Pasted image 20240127134814.png]]
Vemos que tenemos permiso de escritura en la carpeta donde se guardan las dll, por lo que con nuestro equipo vamos a crear un dll que nos entable una reverse shell, cuando el administrador ejecute el programa, nos enviara una reverse shell a nuestra maquina de atacante:
![[Pasted image 20240127175537.png]]
![[Pasted image 20240127175549.png]]

![](https://images-ext-2.discordapp.net/external/x8L6iHe937ohnVANXrvKXcu0ar2FX9kDWvzy50xlrCA/https/www.hackthebox.eu/storage/achievements/6e856756cd164dee7e8e3ff5c6c4d243.png?format=webp&quality=lossless)
