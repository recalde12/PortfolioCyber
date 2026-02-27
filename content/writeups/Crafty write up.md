--- 
title: "Crafty" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#windows #easy

--------
Lo primero que hacemos es hacer un escaneo de puertos de la maquina:
![[Pasted image 20240211151753.png]]
Vemos que tiene dos puertos abiertos la maquina, uno de ellos parece ser el minecraft.
Vamos a analizar la versión y servicio que corren por detrás:
![[Pasted image 20240211151958.png]]
Metemos el dominio en el /etc/hosts. Y investigamos la  web:
![[Pasted image 20240211152134.png]]
Vemos que existe un subdominio llamado play.crafty.htb, vamos a meter este también en el /etc/hosts para explorarlo, pero nos redirige este subdominio a la pagina en la que estamos.

Viendo la versión y buscando una posible vulnerabilidad, vemos que la versión de minecraft, que corre el servidor es vulnerable a log4shell, por lo que nos clonamos el siguiente repositorio:
https://github.com/kozmer/log4j-shell-poc
Y nos descargamos en el jdk correspondiente:https://www.oracle.com/es/java/technologies/javase/javase8-archive-downloads.html
![[Pasted image 20240212012624.png]]
Ya que si no nos va a funcionar.
Lanzamos el poc.py:
![[Pasted image 20240212140525.png]]
nos ponemos en escucha por el puerto que hayamos indicado en el poc.py, es decir por el 9001 y con pycraft una herramienta que nos permite conectarnos al server de minecraft nos conectamos al server y mandamos el mensaje que nos pide que mandemos el poc.py cuando lo lanzamos:
![[Pasted image 20240212140621.png]]
Y por donde estábamos en escucha en el puerto 9001, ganaremos una conexión al servidor:
![[Pasted image 20240212140938.png]]

Hasta aqui tenemos user.txt, si nos vamos al escritorio del usuario, vamos a pasarnos una reverse shell con metasploit:
![[Pasted image 20240212182717.png]]
![[Pasted image 20240212182703.png]]

Conseguimos una shell por lo que ahora vamos a descargarnos los archivos para explorarlos y ver que encontramos:
![[Pasted image 20240213134610.png]]
Hemos encontrado la siguiente contraseña para conectarnos al servidor, en un archivo de los plugins, en la ruta server/plugins:
![[Pasted image 20240213140138.png]]
Vamos a pasarnos la herramienta runascs para intentar conectarnos con privilegios de administrador, no nos va a dejar copiarnos el porgrama en ninguna carpeta que no sea la temporal ya que no tenemos permisos:
![[Pasted image 20240213141558.png]]
Nos da la consola como admin en el puerto 4444 por el que estamos en escucha:
![[Pasted image 20240213141637.png]]
Una vez conectados sacamos root.txt:
![[Pasted image 20240213141707.png]]
https://www.hackthebox.com/achievement/machine/802953/587
![[Pasted image 20240213141737.png]]





