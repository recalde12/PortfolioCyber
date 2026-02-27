--- 
title: "CozyHosting" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

--------
Lo primero hacemos un escaneo de los puertos de la maquina:
![[Pasted image 20240113201549.png]]
Detectamos la versión y servicio de los servicios que corren en la maquina:
![[Pasted image 20240113201730.png]]
Vemos la versión y servicio que corren por detrás de estos puertos.
Con el lunchpad copiamos la linea que nos devuelve ssh y nos dirá a la version de ubuntu que nos estamos enfrentando:
![[Pasted image 20240113202014.png]]
Nos dice que la versión tiene fallos de seguridad.

Fuzzeamos la web haber si encontramos algo:
![[Pasted image 20240113202956.png]]

Y no encontramos nada con gobuster sin embargo probamos con otro  fuzzer haber si obtenemos los mismos resultados:
![[Pasted image 20240113204719.png]]
Vemos las siguiente ruta /actuator sessions:
![[Pasted image 20240113204758.png]]
Nos da un usuario que puede ser valido y además nos da como una cookie de sesión además hemos interceptado la petición con burpsuite de cuando intentamos logguearnos y si que esta arrastrando cookies:
![[Pasted image 20240113205048.png]]
Vamos a probar a copiarnos estas posibles cookies del usuario kanderson, a recargar la pagina con su cookie de sesión:
![[Pasted image 20240113205606.png]]
Abajo nos deja añadir un hostname y un usuario para conectarnos por ssh, esta linea se añade en:
![[Pasted image 20240113210625.png]]

Vamos a interceptar las peticiones con burpsuite:
![[Pasted image 20240114002301.png]]

Como vemos en la cabecera de la petición nos devuelve una especie de ayuda del comando 'ssh', por lo que podemos llegar a pensar que tenemos un RCE.
Lo primero que vamos a hacer es ver si tenemos posibilidad de ejecutar comandos:
![[Pasted image 20240114005725.png]]
Nos dice que no puede tener espacios, como por detrás esta corriendo una bash vamos a probar a quitar los espacios o remplazarlos a través de un echo:
![[Pasted image 20240114005900.png]]
 Vemos como nos ejecuta el comando, y nos mete los espacios.
 ![[Pasted image 20240114010443.png]]
 Hemos pasado a base64 el comando whoami.
 Ahora vamos a crear el siguiente payload:
 ![[Pasted image 20240114010731.png]]
 Lo hemos probado y no funciona ya que no muestra la salida del comando.
 Asi que vamos a ver si al menos lo ejecuta y  nos mandamos una reverse shell, pasamos el one liner a base64:
 ![[Pasted image 20240114012230.png]]
Lo metemos en el payload:
![[Pasted image 20240114012325.png]]
Nos ponemos en escucha y mandamos el payload:
![[Pasted image 20240114012700.png]]
Y nos da la reverse shell:
![[Pasted image 20240114012721.png]]
Hacemos el tratamiento de la tty y vemos que estamos conectados pero tenemos que pivotar al usuario josh ya que no tenemos permisos para listar este:
![[Pasted image 20240114013749.png]]
Asi que vamos a ver en /app el archivo que hay:
![[Pasted image 20240114020154.png]]
Para leerlo nos hemos instalado jd-gui en nuestra maquina windows real,  desde  la pagina oficial de jd-gui: https://java-decompiler.github.io/
Visualizamos un usuario y una contraseña de una base de datos postgres:
![[Pasted image 20240114045437.png]]

Nos probamos a conectar:
![[Pasted image 20240114050555.png]]
Nos conectamos y vemos la tabla de usuarios:
![[Pasted image 20240114051243.png]]Vemos el hash de dos usuarios del usario kanderson y el del admin, nos quedamos con el hash del admin, y con jhon tratamos de crakearla:
![[Pasted image 20240114052111.png]]
![[Pasted image 20240114052054.png]]
Nos conectamos via ssh al usario josh que vemos que esta en el /etc/passwd:
![[Pasted image 20240114052213.png]]
```bash
	ssh josh@cozyhosting.htb
```
contraseña manchesterunited, y una vez conectados revisamos algunas cosas haber de que manera podemos escalar privilegios:
![[Pasted image 20240114053434.png]]
Vemos como en a nivel de sudoers tenemos el privilegio de usar ssh como root.
En gtfobins nos dan una forma de escalar privilegios si tenemos permiso para ejecutar ssh con sudo:
![[Pasted image 20240114053917.png]]
Lo ejecutamos:
![[Pasted image 20240114053940.png]]
Y ya estariamos como root.
![[Pasted image 20240114054242.png]]