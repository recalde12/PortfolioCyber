--- 
title: "Metaesploitable II"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux

-------------
# Escaneo activo

Hacemos un escaneo de los puertos y vemos la información de los servicios que corren por detrás con la herramienta nmap:
![[Pasted image 20240403173837.png]]
Como hay muchos puertos vemos mucha información por lo que vamos a ir escogiendo alguno, como el ftp que vemos que tiene la sesión como anónimo habilitada:
![[Pasted image 20240403174251.png]]

Nos conectamos como anónimo:
![[Pasted image 20240403174729.png]]
No vemos mucha información por lo que vamos a mirar otro puerto:

![[Pasted image 20240403175014.png]]

En el puerto 80 podemos ir probando a fuzzera por directorios, dirsearch es una herramienta  para hacer un escaneo de este tipo de manera rápida:

![[Pasted image 20240403174939.png]]
# 1ª Vulnerabilidad RCE

Exploramos el puerto 80 y algunas rutas:
![[Pasted image 20240403183026.png]] 
El usuario es 'admin' y la contraseña es 'password', una vez accedemos vemos que hay diferentes vulnerabilidades que podemos explotar, por la que vamos a empezar es por por una ejecucion remota de comandos:
![[Pasted image 20240416115100.png]]
Como vemos podemos ejecutar comandos por lo lo que vamos a probar a ejecutar una reverse shell en la maquina, lo primero que hacemos es inyectar un comando que nos envie una conexion a nuestra maquina de atacante por la que vamos a estar en escucha:
![[Pasted image 20240416120523.png]]Y estamos en escucha por el puerto 4444 y cuando nos llegue la conexión nos dará una consola:
![[Pasted image 20240416120612.png]]
Nos hemos enviado una sh para la conexión pero una vez que la recibimos hacemos un tratamiento de la tty para cambiarnos a una bash.

# 2ª Vulnerabilidad SQLI

Lo primero que vamos hacer es probar lo mas basico las comillas o el 'or 1=1':
![[Pasted image 20240416122139.png]]Como vemos es inyectable ya que nos devuelve todos los campos que tiene almacenados y que puede devolver.
Ahora sacamos las contraseñas:
![[Pasted image 20240416122736.png]]
Lo que estamos haciendo es inyectar lo siguiente en la consulta sql que hay programada por detras en el back:
```sql
	SELECT first_name, last_name FROM users WHERE user_id = '1' union select user, password from users --> #'
```

Al inyectar la comilla en el input del usuario conseguimos comentar el resto de la query e inyectar la siguiente instrucción que queremos que haga.

# 3ª Vulnerabilidad
Lo siguiente que vamos a estar explotando es un servicio que se llama tomcat, tiene las credenciales por defecto que son tomcat:tomcat por lo que podemos acceder al panel de administración:
![[Pasted image 20240416123759.png]]

Vamos a ver que versión esta utilizando para ver si existe alguna vulnerabilidad para este servicio:

![[Pasted image 20240416123729.png]]

No encontramos ninguna vulnerabilidad para este servicio en el panel administrativo pero si vemos que podemos ejecutar una subida de un archivo .war en el web application manager por lo que vamos a crearnos un .war malicioso que después nos entable una conexión en la que podamos conectarnos a la maquina:
![[Pasted image 20240416125235.png]]

Para crearnos un .war malicioso lo que tenemos que hacer es utilizar la herramienta msfvenom:
![[Pasted image 20240416160749.png]]

Este es el que vamos a subir a tomcat y vamos a ponernos en escucha:
![[Pasted image 20240416160824.png]]

Aquí recibimos la conexión y estaríamos conectados a la maquina.
# 4ª Vulnerabilidad

Vamos a vulnerar el WebDav que tenemos en el puerto 80:
![[Pasted image 20240418180548.png]]
Como vemos es un webdav, por lo que vamos a analizarlo con una herramienta que se llama davtest:
![[Pasted image 20240418180743.png]]
Vemos que nos deja crear directorios y subir archivos por lo que nos vamos crear un archivo en php que subamos al webdav y nos envie una conexión a nuestra maquina de atacante:
![[Pasted image 20240418181317.png]]
Lo subimos:
![[Pasted image 20240418181402.png]]
Cuando lo subimos nos deja acceder y nos ejecuta el php por lo que vamos a hacer una llamada al parámetro que le hemos indicado dentro de la función system para que nos ejecute el comando que le pasemos, este comando se ejecutara en el servidor:
![[Pasted image 20240418181523.png]]
Por lo que ahora nos podríamos mandar una reverse shell.
Ejecutamos el siguiente comando:
![[Pasted image 20240418182138.png]]

![[Pasted image 20240418181859.png]]
Y recibimos la conexión:
![[Pasted image 20240418182117.png]]