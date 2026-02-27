--- 
title: "Presidential I"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux 

----------------
![[Pasted image 20240604182403.png]]
Como vemos solo hay dos puertos abiertos el 80 y el 2082, por lo que  vamos a ver que versión y servicio corren para estos puertos:
![[Pasted image 20240604182701.png]]
Vemos que esta el puerto ssh abierto en el puerto 2082 y en el puerto 80 parece haber una web por lo que vamos haber que hay en este recurso:

![[Pasted image 20240701113256.png]] 

Vamos a lanzarle un whatweb: 

![[Pasted image 20240701113402.png]]
Podemos ver como existe un dominio el cual podemos añadir al /etc/hosts, para poder acceder al dominio y además poder hacer fuzzing de posibles subdominios.

Lo primero que hacemos es un fuzzing de posibles directorios: 
![[Pasted image 20240701114328.png]]
No encontramos nada nuevo por lo que vamos a añadir el dominio y a buscar posibles subdominios:  
![[Pasted image 20240701115420.png]]
Encontramos este subdominio vamos a añadirle al /etc/hosts y a explorar lo que hay en el: 
![[Pasted image 20240701115535.png]]

Vemos que es un phpmyadmin probamos con las contraseñas y usuarios por default y no nos funcionan por lo que poco podemos hacer de momento.

Vamos hacer un fuzzing de posibles archivos que sean útiles: 
![[Pasted image 20240701120230.png]]
Encontramos que el archivo de backup del config.php si que contiene datos por lo que vamos a revisarlo:
![[Pasted image 20240701120340.png]]No nos interpreta el php pero si que nos lo deja ver en comentarios por lo que hemos conseguido credenciales que pueden ser validas probaremos a conectarnos por ssh y al phpmyadmin encontrado anteriormente: 
![[Pasted image 20240701120534.png]]

Y nos ha dejado conectarnos como hemos podido comprobar por lo que ahora vas a ver la BBDD: 
![[Pasted image 20240701120618.png]]
Tenemos la contraseña del admin hasheada podríamos intentar crakearla:
![[Pasted image 20240708134337.png]]
Como vemos la contraseña es Stella, pero  vamos a intentar vulnerar el LFI y la ejecución remota de comandos.
También vemos la versión del phpmyadmin que corre por detrás, por lo que con searchesploit vamos a buscar si es vulnerable a alguna vulnerabilidad esta versión: 
![[Pasted image 20240701124340.png]]
![[Pasted image 20240701124417.png]]
#LFI
Vemos que tenemos dos vulnhub que pueden ser criticas que podemos explotar en esta versión.
explotamos el primer LFI: 
![[Pasted image 20240701134136.png]]
Sabiendo que existe el LFI podemos intentar buscar rutas como estas: 
/home/admin/.ssh/id_rsa
/var/log/apache2/access.log
/proc/net/tcp --> Los puertos que hay en la maquina abiertos.
/proc/sched_debug --> lista los servicios que estan corriendo en la maquina.
Vemos que es vulnerable, por lo que vamos a intentar explotar el RCE, para ello vemos el poc que nos muestra searchsploit:
![[Pasted image 20240708140119.png]]

Como vemos para ejecutar el payload accede a esta ruta a través del LFI: 
**Tenemos que quitar la s de la ruta sessions ya que si no nos va a dar error**
![[Pasted image 20240708140727.png]]

Ahora a través de este LFI, podemos ejecutar un RCE, ya que en este archivo anterior al que accedemos al ser un recurso php, podemos inyectar en una consulta código php y en este archivo veríamos como se ejecuta: 
![[Pasted image 20240722110852.png]]
Hemos lanzado esta consulta si volvemos a abusar del LFI y vemos el archivo este donde se almacena las acciones y el histórico de cada sesión: 

![[Pasted image 20240722111015.png]]

Pues como vemos en el archivo vemos como se ejecuta el código php y vemos el whoami que hemos "ejecutado" en la consulta.

Por lo que ahora nos podríamos entablar una reverse shell a través de esto: 
![[Pasted image 20240722113421.png]]
Ahora nos ponemos en escucha por el puerto indicado en el one liner de la reverse: 
![[Pasted image 20240722113457.png]]

Recargamos y vemos que se queda pensando si volvemos a donde estábamos en escucha veremos que hemos recibido la conexión: 

![[Pasted image 20240722113602.png]]

Para poder seguir navegando por la base de datos nos vamos a lanzar en segundo plano otra conexión y cuando liberemos esta podremos seguir navegando por la base de datos de phpmyadmin y seguir teniendo una conexión establecida: 
![[Pasted image 20240722113959.png]]

![[Pasted image 20240722114014.png]] Ahora en esta conexión si que hacemos un tratamiento de la tty.

Una vez tenemos una shell bien establecida, vamos a tratar de escalar privilegios, para ello vamos a investigar, vemos que esta el usuario admin, del cual tenemos la contraseña crakeada anteriormente por lo que vamos a conectarnos con este: 
![[Pasted image 20240722132504.png]]
Una vez conectados si podemos acceder y ver la flag de user: 
![[Pasted image 20240722132808.png]]
#EscaldaPrivilegios
Ahora a través de este vamos a intentar escalar nuestros privilegios, vamos a ver permisos SUID, permisos de sudo o capabilities o incluso archivos de configuración.

--Archivos de configuración: 

![[Pasted image 20240722135927.png]]
Los ficheros que podemos ver son los que ya hemos visto antes a traves del LFI por lo que no vamos a ver nada nuevo.

--Permisos SUID: 

![[Pasted image 20240722140158.png]]

Vemos pkexec a través de este podríamos escalar privilegios pero no es la vía intencionada por lo que vamos a buscar las capabilities:

![[Pasted image 20240722163227.png]]

En las capabilities vemos que tenemos permiso de ejecución como root del binario llamado TarS que es una variante de Tar, para la compresión y descompresión del archivo, si además vemos la nota que se encuentra en el directorio home del usuario admin: 

![[Pasted image 20240722163414.png]]

Nos indica que tenemos un nuevo comando con el que comprimir los archivos sensibles, por lo que vamos a tratar de hacer lo siguiente, comprimir en una ruta como tmp en la que si tenemos permiso de escritura el archivo /etc/shadow, ya que con el comando tars si que nos dejara comprimir el /etc/shadow debido a su capabilitie: 
![[Pasted image 20240722163836.png]]

Vemos que nos ha dejado comprimirlo si lo descomprimimos ahora en esta ruta: 

![[Pasted image 20240722164654.png]]

Al descomprimirlo como la acción la hemos llevado a cabo nosotros lo que conseguimos es que tengamos permiso para hacer lo que queramos con ello entre eso podemos dar todos los permisos al comprimido que hemos creado del /etc/shadow, y así como vemos nos deja visualizarlo, y hemos conseguido aprovecharnos de la capabilitie mal configurada.

Ahora sabiendo que podemos hacer esto lo que podemos hacer es hacer lo mismo que hemos hecho con el /etc/shadow, con la id_rsa de ssh del usuario root: 

![[Pasted image 20240722170035.png]]

Como vemos tenemos la clave privada de root por lo que ahora si nos intentamos conectar por el puerto 2082 que es por el que esta montado ssh, con esta clave: 

![[Pasted image 20240722170053.png]]

Ahora siendo root podemos ver la flag final: 

![[Pasted image 20240722170412.png]]