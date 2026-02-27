--- 
title: "Wifinetictwo" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#Medium #linux 

-----------
![[Pasted image 20240318134125.png]]
![[Pasted image 20240318134323.png]]

![[Pasted image 20240318135713.png]]

Hacemos fuzzing de directorios pero no encontramos nada, por lo que vamos a explorar la web:

![[Pasted image 20240318135743.png]]
Había un login de incio pero hemos buscado credenciales por default y ha funcionado.

Buscamos un exploit que haya para explotar esta version de openplc y lo encontramos:
![[Pasted image 20240318152349.png]]

![[Pasted image 20240318152441.png]]
Tenemos que cambiar esa linea y poner ese programa ya que es el que tenemos subido en la pagina de openplc:
![[Pasted image 20240318152533.png]]
Cuando ejecutamos el exploit y nos ponemos en escucha por el puerto indicado:
![[Pasted image 20240318152611.png]]
Nos dice que ha fallado a la hora de mandarnos la reverse shell pero si que nos da la conexion:
![[Pasted image 20240318152654.png]]Parece que estamos en una maquina aislada y que vamos a tener que pivotar a otra, hasta este punto ya tendríamos user.txt.

Por lo que hemos descubierto debemos de conectarnos a un wifi para poder conectarnos a otra maquina que esta en ese rango de red, para ello vamos a sacar la configuracion de este con herramientas y ataques pixie dust. 

**poner caps de como hacemos los ataques**.


Una vez hemos sacado la contraseña y el bssid, debemos de crear el siguiente archivo de configuracion:
![[Pasted image 20240323145528.png]]
Nos lo pasamos a la maquina victima con el comando:
```bash
	curl http://10.10.14.93:8888/supplicant.conf -o ./supplicant.conf
```

Ejecutamos el siguiente comando en la maquina victima para que coja esa configuracion y le añadimos una ip que este en el rango:
![[Pasted image 20240323145701.png]]
Ahora vamos a intentar conectarnos a la otra maquina que hemos visto que hay a la 192.168.1.1:
![[Pasted image 20240323145753.png]]
![[Pasted image 20240323145348.png]]
