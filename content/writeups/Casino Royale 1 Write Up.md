--- 
title: "Casino Royale I"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulnhub." 
---
#linux 

----------
Lo primero que hacemos es realizar un escaneo de la maquina y sus puertos:
![[Pasted image 20240327171447.png]]

![[Pasted image 20240327171654.png]]

Vamos a explorar el puerto 80 y 8081 de la maquina ya que parecen tener servidores web expuestos:
![[Pasted image 20240327172151.png]]
![[Pasted image 20240327172202.png]]
![[Pasted image 20240327172213.png]]
hacemos un whatweb de ambas paginas haber que corre por detras:
![[Pasted image 20240327172037.png]]
Vamos a fuzzear por directorios:
En el puerto 80 encontramos rutas interesantes:
![[Pasted image 20240327173527.png]]
En el puerto 8081 no encontramos nada.
Exlploramos la ruta /index.php/login:
![[Pasted image 20240327173852.png]]
Y encontramos esto:
![[Pasted image 20240327173953.png]]
Vamos a poner este dominio en nuestro /etc/hosts, y vamos a seguir explorando:
![[Pasted image 20240327175205.png]]
>En la ruta install vemos la versión de lo que puede estar corriendo por aquí vamos a ver si existe alguna vulnerabilidad o exploit: https://www.exploit-db.com/exploits/6766

Con el exploit que hemos encontrado vamos a intentar seguir las instrucciones que nos indican para explotar el insecure cookie handling.
-Buscamos la ruta que nos indica el exploit:
http://site.com/pokerleague/pokeradmin/configure.php
![[Pasted image 20240327175457.png]]Encontramos el login en una ruta parecida http://site.com/pokeradmin, vamos a intentar explotar este login.
Vamos a inyectar el siguiente exploit que nos indican en la consola de inspeccionar la pagina:
```javascript
	javascript:document.cookie = "ValidUserAdmin=admin";
```

***También podemos conseguir la contraseña y el usuario a través de una inyección sql:***
![[Pasted image 20240422170933.png]]

Una vez lo hayamos inyectado cuando recarguemos la pagina /pokeradmin/configure.php, nos dejara entrar:
![[Pasted image 20240327180508.png]]

Mirando en la información de los usuarios vemos una ruta nueva:
![[Pasted image 20240327182339.png]]
Accedemos a dicha ruta:
![[Pasted image 20240327182411.png]]
Buscamos información de alguna posible vulnerabilidad en este cms:
https://www.exploit-db.com/exploits/35301

#CSRF

Explorando la web vemos que hay una usuaria que verifica los correos para añadir a los nuevos clientes, por lo que vamos a utilizar el exploit que hemos encontrado para intentar añadir un usuario, primero vamos a verificar que valenka revisa los correos y cuando accede nos llega una petición.
Vemos que el puerto smtp esta abierto por lo que vamos a probar a mandarle un correo:
![[Pasted image 20240422173258.png]]
Vamos a enviar un mail a traves de smtp:
![[Pasted image 20240422173732.png]]
Como vemos no nos pide credenciales para conectarnos lo normal es que si pero en este caso no esta configurado, por lo que podemos falsificar un email y suplantar la identidad de otro.
![[Pasted image 20240422174536.png]]
Le metemos el comando data para intrducir el subject y el cuerpo del mensaje.
Si estamos en escucha por el puerto 80 nos llegara la peticion:
![[Pasted image 20240422180934.png]]
Por lo que ahora vamos a preparar el exploit:
![[Pasted image 20240422184115.png]]
Y vamos a enviar un nuevo email pero haciendo que acceda a este recurso:
![[Pasted image 20240422182152.png]]
Nos ha vuelto a llegar la petición por lo que debería de haberse creado el usuario que hemos metido en el html:
![[Pasted image 20240422183922.png]]
Como vemos nos ha dejado loguearnos con el usuario que nos ha creado y que habíamos configurado en el html.
Explorando el panel de admin y a los usuarios vemos que el usuario 'le' tiene lo siguiente en la descripcion:
![[Pasted image 20240422184606.png]]
Por lo que vamos a ver lo que hay en esta ruta:

#XEE

![[Pasted image 20240422184643.png]]Vamos a ver el código fuente de la pagina:
![[Pasted image 20240422185933.png]]
Vemos que nos están dando una pista de que tenemos que inyectar código en xml, vamos a interceptar la petición con burpsuite:
![[Pasted image 20240422190258.png]]vamos a probar a inyectar lo siguiente:
![[Pasted image 20240422190705.png]]Como vemos nos esta devolviendo el nombre del customer que le estamos metiendo, por lo que se esta aconteciendo un XXE.

Si buscamos en google XXE Portswiguer(https://portswigger.net/web-security/xxe) nos salen dos líneas que sirven para leer un archivo, las vamos a utilizar para leer el /etc/passwd por ejemplo:
![[Pasted image 20240422191054.png]]
Vemos que en el /etc/passwd hay un usuario que se llama 'ftpUserULTRA', y en el código ponía algo de cambiar la contraseña por lo que vamos a probar con hydra a crakear la contraseña:
![[Pasted image 20240422191642.png]]
La contraseña en bankbank, hemos hecho un diccionario personalizado ya que si no con el rockyou hubiéramos tardado 1h en que llegue a la linea en la que esta el bankbank.
#fileupload 
Probamos a conectarnos a través de ftp:
![[Pasted image 20240422191900.png]]
Nos deja conectarnos, si nos fijamos la ruta del directorio de ese usuario es '/var/www/html', por lo que probablemente podamos acceder a través de la web:
![[Pasted image 20240422192033.png]]
Vamos a traves de ftp a subir un archivo en php y controlar el parámetro para inyectar comandos:
![[Pasted image 20240422192237.png]]
Lo subimos con ftp al servidor:
![[Pasted image 20240422192555.png]]
Nos dice que no podemos puede ser por la extensión vamos a probar a subirlo con otra extensión:
![[Pasted image 20240422192738.png]]

>También podríamos probar a subir un archivo sin extensión y probar a renombrarlo una vez subido.

Una vez que lo hemos subido vamos a acceder a el a través de la web:
![[Pasted image 20240422192944.png]]
Nos ejecuta el php, pero no podemos ver la salida del comando, esto puede deberse a los permisos del archivo que hemos subido con ftp podemos cambiar los permisos:
![[Pasted image 20240422193138.png]]
Los cambiamos y volvemos a ejecutar el comando:
![[Pasted image 20240422193316.png]]
Ahora si ejecutamos el comando si que nos ejecutara el comando:
![[Pasted image 20240422193346.png]]
![[Pasted image 20240422194051.png]]
![[Pasted image 20240422194109.png]]
	
Una vez conectados a la maquina vamos a buscar archivos de configuración, servicios que haya corriendo, verificar la versión del sistema, mirar privilegios asignados al usuario, buscar por privilegios SUID...,etc.

![[Pasted image 20240423005139.png]]
Cuando buscamos por privilegios SUID vemos un script en la ruta /opt/casino-royale/mi6_detect_test:
![[Pasted image 20240423005440.png]]

Vemos que tiene un privilegio SUID vamos a ejecutarlo haber que es lo que hace:
![[Pasted image 20240423005525.png]]
Vemos que hace una llamada a otro script que se llama run.sh, como no existe podemos crear uno que ejecute el comando que queramos como invocar una shell con los privilegios del usuario que lo ejecuta en este caso root:
![[Pasted image 20240423005726.png]]
Hemos creado un archivo llamado run.sh con el siguiente comando 

```bash
	bash -p
```

cuando hemos ejecutado el script  /opt/casino-royale/mi6_detect_test nos a invocado una shell como el usuario root.
![[Pasted image 20240423010006.png]]