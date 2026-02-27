--- 
title: "Infovore"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux 

------
Lo primero que hacemos como siempre es hacer un escaneo de los puertos que tenga abiertos la maquina:
![[Pasted image 20240723141704.png]]

Vemos que solo tiene el puerto 80 abierto por lo que vamos a ver la versión y servicio que corren por este puerto: 
![[Pasted image 20240723141822.png]]

Vemos que lo que corre por detrás es un apache por lo que vamos a explorar el recurso: 

![[Pasted image 20240723141948.png]]

Esto es lo único que vemos cuando accedemos al recurso por lo que vamos a hacer un fuzzing en busca de nuevos recursos: 

![[Pasted image 20240723145947.png]]

Por aquí vemos el php info, esto puede ser critico ya que podemos ver lo que tienen configurado por detrás, como por ejemplo si podemos ejecuta funciones o si podemos subir archivos o no: 

![[Pasted image 20240723150246.png]]


#LFI #fileupload #phpinfoAbusing
Por lo que buscando por lo siguiente phpinfo abusing file upload: 
https://book.hacktricks.xyz/pentesting-web/file-inclusion/lfi2rce-via-phpinfo

Lo primero que tenemos que hacer es averiguar la forma que tenemos para poder subir un archivo, por lo que vamos a pillar la carga del phpinfo con burpsuite: 

![[Pasted image 20240723153529.png]]

> Hemos pillado la petición y hemos cambiado el método con el que enviamos la petición a POST, y buscando en esta pagina de stackoverflow: https://stackoverflow.com/questions/8659808/how-does-http-file-upload-work hemos conseguido formar una petición con la misma estructura que se necesita para subir un archivo. Como vemos nos ha dejado y de alguna forma en la respuesta de la pagina se ve inyectado como vemos el archivo que hemos subido.

Por lo que ahora tenemos que encontrar la forma de que a través de un LFI carguemos este archivo ya que podríamos obtener una ejecución remota de comando si podemos subir un archivo php y cargarle.

Por lo que de primeras vamos a hacer fuzzing por algún parámetro en la web haber si encontramos alguno con el que poder acceder a los archivos internos de la maquina entre ellos el que subamos: 

![[Pasted image 20240723154619.png]]

Hemos encontrado que este parámetro devuelve un numero de líneas distinto por lo que vamos a ver si encontraríamos un LFI: 

![[Pasted image 20240723154752.png]]  

Como vemos tenemos un LFI, lo que pasa que a la hora de acceder al archivo anteriormente creado no nos deja ni nos lo encuentra: 
![[Pasted image 20240723155146.png]] Eso pasa por que es un archivo temporal por lo que tiene pinta que nos lo inyecta y lo borra automáticamente, aquí podemos probar haber si encontramos una Race Condition que justo nos lo indica el recurso de hacktricks: 
https://www.insomniasec.com/downloads/publications/phpinfolfi.py
Ese script que se encuentra en el recurso de hacktricks compartido se encarga justo de esto de enviar peticiones subiendo archivos y accediendo a este hasta que nos da la conexión, pero tenemos que hacer unos cambios en el script para ajustarlo a la explotación que queremos, veamos que tenemos que cambiar: 

![[Pasted image 20240723163022.png]]

Aquí vemos como cambiamos el payload en php que se va a ejecutar en nuestro caso queremos una reverse shell, la url donde accedemos al recurso del phpinfo, también cambiamos la url del LFI ya que en nuestro caso esta en la ruta indicada en la captura.

Y por ultimo en nuestro phpinfo vemos esto cuando añadimos un fichero: 
![[Pasted image 20240723163702.png]]

Por lo que en el script a la hora de buscar esa linea para encontrar la ruta al fichero tmp debe de buscar el siguiente patrón:

![[Pasted image 20240723163640.png]]
> Lo cambiamos en todas las lineas que sean necesario, y que busque otro patrón distinto.

![[Pasted image 20240723163910.png]]

Como vemos en el payload en php le estamos metiendo una reverse shell, por lo que vamos a ejecutar el script mientras estamos en escucha por el puerto indicado: 

![[Pasted image 20240723164005.png]]

![[Pasted image 20240723164022.png]]

Como vemos hemos conseguido explotar este fallo que tiene php a través de su phpinfo si no esta bien configurado y si tenemos un LFI.

Por lo que ahora es momento de escalar privilegios, por lo que vemos no estamos conectados a la maquina directamente, parece que estamos en un contenedor de docker, ya que si nos fijamos no nos encontramos en la misma ip que la maquina:

![[Pasted image 20240723165337.png]]

#linux #escaladaprivilegios
lanzamos el siguiente script que podemos utilizar en el OSCP, ya que solo escanea y no explota nada: https://github.com/peass-ng/PEASS-ng

Y nos encuentra un archivo oculto llamado .oldkeys.tgz en la raíz: 
![[Pasted image 20240731210401.png]]
> No nos deja descomprimirlo hay por lo que nos lo llevamos a una ruta en la cual si que tengamos permisos como es la carpeta tmp, y lo descomprimimos ahí.

Una vez descomprimido vemos que nos devuelve claves pero van a estar cifradas por lo que tendremos que descomprimirlas:
![[Pasted image 20240731210957.png]]

Nos las pasamos a nuestro local, y con el uso de una herramienta que viene con jhon podemos pasar la clave privada al hash necesario para intentar crakearlo con jhon: 
![[Pasted image 20240731223907.png]]

Ahora con jonh lo crakeamos:

![[Pasted image 20240731223812.png]]

Como vemos nos ha encontrado la contraseña 'choclate93'.
Esta contraseña es la del cifrado de la clave privada.

Por lo que vamos a intentar conectarnos por ssh como root con esta contraseña, haber si nos deja:
exit

![[Pasted image 20240802115251.png]]

Como vemos nos deja conectarnos como root por lo que hay reutilización de contraseñas.
Vemos la primera flag de root pero la del contenedor todavía no hemos escalado privilegios:

![[Pasted image 20240802115441.png]]
En el directorio de root en la carpeta oculta de ssh vemos que hay otra clave del usuario admin: 
![[Pasted image 20240802115645.png]]
Por lo que tenemos otro usuario valido, y este si que parece que pertenece a la maquina real y no al contenedor.

Por lo que vemos parece que es un usuario conocido en la maquina real por lo que vamos a ver si la maquina real a la que nos tenemos que conectar tiene el puerto 22 abierto: 
![[Pasted image 20240802120935.png]]
El código de estado es 0 por lo que parece que si que esta abierto ya que si no nos hubiera devuelto con estado 1 por el error.
![[Pasted image 20240802121926.png]]
Como vemos vuelve a haber una reutilización de la contraseña y nos deja conectarnos a la maquina con el usuario admin.
![[Pasted image 20240802122032.png]]
Ahora una vez conectados a la maquina real y no en el docker tenemos que escalar privilegios de nuevo a root, vemos que el usuario admin esta en el grupo docker:
![[Pasted image 20240802122228.png]]

Estando en este grupo podemos levantar un contenedor y montarnos la carpeta de root en una carpeta del contenedor y así modificar los permisos del binario de bash por ejemplo:

![[Pasted image 20240802123638.png]]Ahora nos conectamos al contenedor y nos dirigimos a esta ruta: 
![[Pasted image 20240802124208.png]]
> Le hemos dado privilegios SUID a la bash pero a la de la maquina real ya que es la que esta montada en este directorio.

![[Pasted image 20240802124340.png]]

Como vemos ahora tiene permisos SUID por lo que si ejecutamos un bash -p nos otorgara una bash como root:
![[Pasted image 20240802124512.png]]