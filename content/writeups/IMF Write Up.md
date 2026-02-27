--- 
title: "IMF"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#linux

-------------------
Lo primero que hacemos es un escaneo de la maquina y sus puertos:
![[Pasted image 20240326101738.png]]
Ahora vemos información del puerto 80 que es el unico que esta abierto en este caso:

![[Pasted image 20240326101843.png]]
Hacemos un whatweb para ver la versión y el lenguaje que se esta utilizando por detrás:
![[Pasted image 20240326101939.png]]
Vamos a explorar la web ya que por lo que parece va a ser la única vía de entrada.
![[Pasted image 20240326102231.png]]
Esto es lo que vemos en la web, hemos hecho un dirsearch y no nos da ninguna ruta valida, por lo que vamos a explorar el codigo fuente:
![[Pasted image 20240326102407.png]]
>Vemos 3 archivos en javascript que parecen tener un nombre en base64 por lo que vamos a ir desencodeando estos nombres.

![[Pasted image 20240326102706.png]]
 Hemos juntado el nombre de los archivos y desencodeandolo de base64 el resultado es un flag2{} y algo dentro que parece estar en base64 también:
 ![[Pasted image 20240326102825.png]]
Parece ser otra ruta que no nos puede encontrar un diccionario, no ha tenido mucho sentido esto, ya que no es muy real:
![[Pasted image 20240326102909.png]]
Encontramos un login.
Vemos tres contactos que pueden ser validos en este login:
![[Pasted image 20240326103311.png]] Por lo que vamos a probar a interceptar la petición y hacer pruebas:
![[Pasted image 20240326103446.png]]
![[Pasted image 20240326103516.png]]Como vemos si detecta que el usuario es valido solo nos marca que tenemos mal la contraseña.
#typejuggling
Metiendo al campo password dos llaves '[]' como si se tratara de un array, nos saltamos la validación y nos devuelve una flag3{}, si la desencodeamos:
![[Pasted image 20240326103802.png]]
Vamos a probar esta ruta, pero no nos lleva a nada interesante.
Por lo que vamos a ver que pasa si nos loggueamos saltándonos la comprobación de la pass:
![[Pasted image 20240326104204.png]]
Esto es lo que vemos por lo que vamos a interceptar esta búsqueda a los recursos:
![[Pasted image 20240326104312.png]]Vamos a hacer pruebas para ver si hay una posible inyección sql o no:
#sqlinjection
![[Pasted image 20240326105611.png]]Vemos que nos salta un error sql con " home' or 1=1' ", por lo que vamos a seguir probando:
![[Pasted image 20240326105747.png]]
Si le metemos dobles comillas parece que si que nos devuelve lo que nos interesa, por lo que parece que nos encontramos ante una sql inyection boleeana, ya que dependiendo si devuelve true o false, nos devuelve una respuesta u otra vamos a meterle un 2 para que no sea true esa quuery:
![[Pasted image 20240326105918.png]]Al meterle el numero 2 vemos que la respuesta cambia por lo que vamos a montarnos un script para que vaya probando caracteres validos de las posibles bases de datos por ejemplo:
![[Pasted image 20240326110128.png]]

Empezando con el script:
![[Pasted image 20240326112215.png]]
> Hasta aqui se nos ejecuta perfecto, tenemos que saber cuantos caracteres tiene la base de datos actualmente en uso para sacar el nombre de esta para ello podemos hacer lo siguiente:

![[Pasted image 20240326112506.png]]
![[Pasted image 20240326112521.png]]

con 5 nos devuelve el resultado que buscamos por lo que vamos a meterle si es menor a 4 haber si falla:
![[Pasted image 20240326112642.png]]
Así hemos confirmado que la base de datos actualmente en uso tiene 5 caracteres:
![[Pasted image 20240326113857.png]]
>Tenemos que subir al range hasta 6 para que pruebe el carácter 5 también.

![[Pasted image 20240326142340.png]]
Así se quedaría esta manera de resolver la inyección, pero hemos encontrado otra manera mas sencilla por lo que vamos a dejar de lado el script y vamos a ver la inyección con el uso del null byte:
![[Pasted image 20240326142536.png]]
Como vemos nos devuelve la base de datos actualmente en uso como nos devuelve el script.
Por lo que vamos a seguir sacando info, lo suyo es sacarlo con el script pero da error la maquina y no devuelve texto por lo que no podemos hacer las comprobaciones correspondientes.
El scriipt al completo quedaria asi:
![[Pasted image 20240326180158.png]]
Con este script sacamos de la base de datos admin de la tabla pages el campo pagename, que es de donde coge los datos de home y el resto de paginas que vemos en la web, encontramos un campo que no podemos ver que se llama 'tutorials-incomplete':
![[Pasted image 20240326181303.png]]
Vamos a decodificar el qr, ya que es lo mas extraño que vemos aquí, con el siguiente comando ejecutamos flameshot:
```bash
	sleep 2; flameshot gui
```

Y la captura del qr se la pasamos a la siguiente herramienta online:
![[Pasted image 20240326181528.png]]

Nos decodea el qr:
![[Pasted image 20240326181543.png]]
Y vemos la flag4{}, por lo que vamos a decodearla y ver que pista nos da:
![[Pasted image 20240326181643.png]]
Parece ser un recurso nuevo que antes no veíamos, vamos a ver lo que es: #fileupload
![[Pasted image 20240326181839.png]]
Intercepto la petición para hacer pruebas de con el tipo de archivo que tenemos:
![[Pasted image 20240326202753.png]]
>Hemos probado a subir un .php y nos dice que la extensión no es valida.

Por lo que vamos a probar a subir un jpg:
![[Pasted image 20240326203200.png]]
>Ahora nos detecta la función system y nos la pilla como maliciosa.

Por lo que vamos a probar a ofuscarlo un poco:
![[Pasted image 20240326203338.png]]
>Lo hemos subido como gif y le hemos añadido la etiqueta 'GIF8;', además hemos puesto la función system en hexadecimal para que el WAF no lo detecte.

Ahora nos deja subirlo en el codigo fuente vemos que nos devuelve un codigo:
![[Pasted image 20240326203638.png]]
Vamos a buscar una ruta tipo 'uploads' en la que haya un archivo con ese nombre y con extension.gif:
![[Pasted image 20240326203725.png]]
>Como vemos podemos ejecutar comandos por lo que vamos a establecer una reverse shell.

![[Pasted image 20240326205024.png]]
![[Pasted image 20240326205037.png]]
Al conectarnos a la maquina en el directorio en el que nos coloca vemso el siguiente archivo:
![[Pasted image 20240327112935.png]]Descodificamos el base64:
![[Pasted image 20240327113000.png]]
Entiendo que la pista que nos da tiene algo que ver con algún servicio en el que este ejecutando un binario en el que sea vulnerable a un bufferoverflow:
![[Pasted image 20240327114428.png]]
Vamos a buscar en estas rutas los permisos que tenemos que tipo de archivos son, si esta el servicio activo y corriendo y demás:
![[Pasted image 20240327114606.png]]
No tenemos permisos de escritura, parece ser un archivo binario de 32 bits por lo que vamos a ver en que sistema operativo nos encontramos:
![[Pasted image 20240327114719.png]]
Como vemos es un xenial tiene pinta que de 32 bits.
Si miramos el otro archivo que habiamos encontrado buscando en todo el sistema por agent:
![[Pasted image 20240327115100.png]]
Vemos que este archivo parece ser el de configuracion del servicio y nos indica que corre por el puerto 7788.
Vemos si hay algún puerto abierto corriendo dicho servicio:
![[Pasted image 20240327114902.png]]
Vemos que esta este puerto abierto por lo que vamos a ver si el servicio esta corriendo:
![[Pasted image 20240327115204.png]]
No hay ningún servicio por lo que vamos a conectarnos a dicho puerto haber si se lanza el servicio:
![[Pasted image 20240327115344.png]]
Como vemos una vez conectado en segundo plano al servico empieza correr y el usuario que lo lanza es root.

El binario no tiene ningun permiso como hemos visto con el comando: 
```bash 
	getcap /usr/bin/local/agent 
```

No tiene ninguna capability activa por lo que vamos a seguir investigando ya que sabemos que va a ser un bufferoverflow.
#bufferoverflow
Por lo que nos vamos a traer le binario para analizarlo con esta herramienta:
https://ghidra-sre.org/, lo que hace es crear un archivo original legible a partir del compilado.
Nos pasamos el binario a la maquina con netcat:
![[Pasted image 20240327123614.png]]

![[Pasted image 20240327123549.png]]

Ahora nos descargamos el ghidra y nos abrimos este binario compilado con esta herramienta, para instalar el ghidra lo único que tenemos que hacer es descargarnos el fichero del repo descomprimirlo y ejecutar el fichero ghidrarun:
![[Pasted image 20240327124503.png]]
![[Pasted image 20240327124549.png]]Lo primero que tenemos que hacer es crear un proyecto antes de abrir el binario agent que nos hemos pasado y después importar el agent:
![[Pasted image 20240327125305.png]]
Una vez importado lo arrastramos al dragón que nos sale arriba:

![[Pasted image 20240327130105.png]]
>Ahora analizando el codigo que corre por detras de agent, lo que esta haciendo para validar este primer codigo:

![[Pasted image 20240327130150.png]]
>Es compararlo con la variable local28 que es un codigo pasado a hexadecimal si lo pasamos a decimal nos va a dar un codigo valido para accerder a las funciones del servicio.
![[Pasted image 20240327131008.png]]
Como vemos una vez validados podemos elegir entre 3 opciones, si revisamos cada una de estas opciones vemos que en la opcion 3 en la de introducir un reporte vemos que  se controla el buffer:
![[Pasted image 20240327131118.png]]

Vemos que el contenido del reporte que introduce el usuario lo recoge la función gets(), esta no controla el buffer ni lo que pasa una vez se a superado este por lo que si ahora probamos a meter mas de 164 bytes si es vulnerable a BOF nos devolverá un error de segmentación:
![[Pasted image 20240327131912.png]]Vemos que nos salta un error de segmentación por lo que vemos que es vulnerable a un BOF.

Si con gdb nos abrimos agent y cuando lleguemos a la parte del reporte le introducimos nuestras 200 'A', vemos como salta el error y como en EIP aparecen estas 'A':
![[Pasted image 20240327132751.png]]
Ahora sabiendo que podemos controlar EIP, nos creamos desde gdb un patron:
```bash
	create pattern 200 
```

Volvemos a arrancar el programa y en el report le metemos el pattern que hemos creado:
![[Pasted image 20240327135145.png]]
Vemos con 'pattern offset $eip', el offset que es el espacio que hay de bytes hasta llegar al EIP.
Por lo que vamos a ver si es correcto inyectandole 4 'B' justo en el EIP:
![[Pasted image 20240327135318.png]]
![[Pasted image 20240327135404.png]]
Como vemos en el campo EIP aparecen las B por lo que tenemos el control ya de este.
Vamos a mirar ahora si esta el ASLR(direcciones aleatorias) activo en la maquina victima:
![[Pasted image 20240327141614.png]]
Vemos que esta activo lo podemos comprobar haciendo lo siguiente:
![[Pasted image 20240327143029.png]]
El comando anterior nos filtra solo por esto:
![[Pasted image 20240327143110.png]]
Si ejecutamos lo siguiente:
```bash
	for i in $(seq 1 1000); do ldd /usr/local/bin/agent | grep libc |      awk 'NF{print $NF}' | tr -d "()"; done
```

Si grepeamos por la dirección que nos devuelve el comando 'ldd' de libc, vemos que de mil consultas solo se repite la dirección unas decenas de veces, por lo que la dirección es aleatoria cada vez solo que tienen que repetirse por la poca cantidad de combinaciones, pero no nos vamos a centrar en eso si no que vamos a explotar este BOF de otra manera.
Para ello vamos a estar revisando los demás campos que tenemos aparte del EIP o el ESP .
Para ello vamos a utilizar el siguiente comando en gdb:
![[Pasted image 20240327143645.png]]
Listamos la info del campo esp:
![[Pasted image 20240327143808.png]]
Con esto lo que estamos listando son 200 direcciones del campo ESP que se han almacenado por aquí no vemos las 'A' inyectadas por lo que aqui no esta lo que estamos buscando.
Podemos probar otras cosa:
![[Pasted image 20240327144029.png]]
Por aqui si que vemos nuestras 'A', pero claro no podemos inyectar nada aqui ya que las direcciones son aleatorias por lo que no podemos coger alguna de estas.
Vamos a listar otro campo como por ejemple 'EAX':
![[Pasted image 20240327144236.png]]
En este campo si que estamos viendo todas las A que hemos inyectado desde donde empiezan hasta donde acaban con las 4 'B' inyectadas en el EIP.
Anteriormente habíamos visto un ret2libc, ahora vamos a estar practicando un ret2reg, es decir vamos a volver a llamar al registro EAX pero en vez de inyectar 168 A vamos a inyectar un shellcode y lo que nos quede hasta llegar al EIP lo rellenamos con las A. Una vez llegado al EIP vamos a indicarle que nos apunte de nuevo al campo EAX, lo primero que se va a encontrar es el shellcode, y esta vez si que se va a ejecutar, ya que esta entiendo que es la siguiente linea de código que le toca.
Lo primero que vamos hacer es crearnos un shellcode con msfvenom:
![[Pasted image 20240327145259.png]]
> Le hemos quitado los badchars típicos que suele haber.

Ahora nos vamos a crear un mini exploit que nos ejecute el bufferoverflow:
![[Pasted image 20240327145620.png]]
Vemos que el shellcode el payload pesa 95 bytes tenemos que rellenar de 'A' hasta llegar al EIP que esta en 168:
![[Pasted image 20240327150130.png]]
Ahora tenemos que buscar una dirección de eax que tenga como propiedad un call eax:
![[Pasted image 20240327150314.png]]
> Con esto vemos en hexadecimal como se representa call eax, para ahora filtrar por ello y encontrar una dirección que tenga dicha propiedad.

Con la herramienta objectdump, podemos ver las direcciones estáticas que tiene un programa definidas:
![[Pasted image 20240327150713.png]]
Filtramos solo por la que nos interesa:
![[Pasted image 20240327150740.png]]
>hacemos el grep con el -i por si acaso para que lo ejecute con "case in sensitive".

Vemos una dirección estática con propiedades call eax, por lo que esta es la que vamos a utilizar en nuestro exploit.
![[Pasted image 20240327152549.png]]
Ahora tenemos que hacer la conexión al servicio y ir introduciendo los valores que necesitamos hasta llegar al report en donde vamos a inyectar el payload:
![[Pasted image 20240327152936.png]]
>En el script al recv nos falta indicarle la conexión que inicializamos en s.

Lo ejecutamos y vamos debugueando los datos que tenemos que ir introduciendo para que fluya bien el programa:
![[Pasted image 20240327153224.png]]
>Vemos que nos conecta bien al servicio lo siguiente que le tenemos que pasar el es id valido que hemos sacado del análisis del binario agent con ghidra.

![[Pasted image 20240327153713.png]]

Ahora lo siguiente que tenemos que inyectar es el numero 3 que es la selección del report:
![[Pasted image 20240327154108.png]]
Así es como quedaría el script al completo si lo ejecutamos y nos ponemos en escucha por el puerto indicado en el payload recibiremos una consola del user root que es el que ejecuta este servicio:
![[Pasted image 20240327154300.png]]
![[Pasted image 20240327154322.png]]Por aquí hemos recibido la conexión y somos root en la maquina IMF.
![[Pasted image 20240327154539.png]]