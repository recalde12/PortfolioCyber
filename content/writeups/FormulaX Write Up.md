--- 
title: "FormulaX" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#linux #hard #xss 

----------------------
Empezamos con el escaneo de puertos y mirando la versión y servicio de estos:
![[Pasted image 20240311125421.png]]
![[Pasted image 20240311125438.png]]Vemos el launchpad y investigamos la web:
![[Pasted image 20240311125528.png]]
![[Pasted image 20240311125702.png]]Esta es la web al parecer es como una especia de chatgpt pero a lo cutrisimo, nos registramos y exploramos la web, hemos interceptado todas las peticiones posibles con burpsuite, en la parte de contact us hemos encontrado un xss:
![[Pasted image 20240311131204.png]]
Si nos ponemos en escucha vemos como nos llega la petición al recurso:
![[Pasted image 20240311131249.png]]
Sabiendo que tenemos un xss, podemos explotarlo creando un recurso que cuando el admin acceda nos envíe el histórico de su chat a través del XSS DOM-based.
Para ello tendremos que sacar información de como se llaman los objetos en el código de la pagina y las conexiones con el socket que hace esta info la vamos a sacar de aquí:
![[Pasted image 20240311154009.png]]
Hasta aquí podemos crear lo siguiente:
![[Pasted image 20240311163418.png]]
Esto nos habre la conexion al chat con el usuario que ejecute el recurso que es el admin ahora tenemos que buscar la manera en la que leer los mensajes, la pagina lo hace de la siguiente manera:
![[Pasted image 20240311155849.png]]
Por lo que vamos a seguir adaptando nuestro script:
![[Pasted image 20240311163441.png]]
Y llamamos a los mensajes que nos interesan que son los del histórico:
![[Pasted image 20240311161422.png]]
Donde value va a ser history para que nos muestre los mensajes del admin que son los del history.
![[Pasted image 20240311163503.png]]Con este script preparado vamos a volver a abusar del xss, ya que cuando el admin acceda a dicho recurso vamos este nos va a volvar por el puerto 80 los mensajes, en base64 para que no nos de problemas.
-Nos ponemos en escucha por el puerto 8088, por donde el admin a través del xss va acceder al recurso malicioso creado y por el puerto 80 que es por donde a través del recurso nos llegaran los mensajes del histórico del admin:
![[Pasted image 20240311164216.png]]

-Enviamos el xss, pero ahora por el 8088:
![[Pasted image 20240311164304.png]]
Y vemos como nos llegan en ambos puertos las solicitudes y además los mensajes en base64:
![[Pasted image 20240311164547.png]]
Si decodeamos los base64 veremos los mensajes y el histórico del admin:
![[Pasted image 20240311164014.png]]
Encontramos unos nuevos subdominios dev-git-auto-update.chatbot.htb.
Añadiendo este dominio al /etc/hosts, vemos la siguiente pagina:
![[Pasted image 20240311170305.png]]
Nos sale la versión del chat en el pie de la pagina vamos a buscar por posibles vulns:
![[Pasted image 20240312174252.png]]
Vemos una posible ejecución de comandos por lo que vamos a probar.
Vemos que podemos enviar una peticion a una url y que es vulnerable al siguiente Poc:
![[Pasted image 20240312181514.png]]Por lo que vamos a crearnos un archivo .sh que nos mande una reverse shell, y nos levantamos un servidor http por el puerto 80 para que el chatbot nos envíe una petición al recurso de la reverse, por el puerto que le hayamos indicado y estando en escucha recibiremos la reverse shell del lado del servidor.
Creamos el archivo de la reverse shell:
![[Pasted image 20240312181829.png]]
Nos ponemos en escucha por el puerto 80, para recibir la petición:
![[Pasted image 20240312181956.png]]
Por el puerto en el que nos mandamos la reverse:
![[Pasted image 20240312182043.png]]
Y mandamos la petición con el payload del Poc:
![[Pasted image 20240312182126.png]]Y recibiremos la shell:
![[Pasted image 20240312182152.png]]
Ahora nos toca investigar haber como escalamos privilegios para conseguir la flag de user, ya que este no tiene privilegio ninguno.

Vemos una conexión a una base de datos por lo que vamos a ver si podemos llegar al archivo:
![[Pasted image 20240312182435.png]]
![[Pasted image 20240312182527.png]]
La base de datos que esta utilizando se llama testing, por lo que vamos a intentar conectarnos a mongo:
![[Pasted image 20240312182726.png]]
Vemos el hash de dos usuarios del admin y de franky_dorky por lo que vamos a intentar crakearlas:
![[Pasted image 20240312183932.png]]
Conseguimos crakear la de franky.
Nos conectamos con este usuario:
![[Pasted image 20240312232056.png]]
Conseguimos user hasta este punto.
Ahora si vemos los puertos abiertos de la maquina veremos que esta el puerto 3000 abierto localmente a través de este puerto corre el servicio librems, por lo que vamos a hacernos un portforwarding, haber si podemos acceder:
![[Pasted image 20240312234153.png]]Con esto lo que vamos hacer es un portforwrding en nuestra maquina local ahora si accedemos al puerto 3000 de nuestro localhost veremos la pagina de librenms:
![[Pasted image 20240312234324.png]]Miramos credenciales por defecto pero no va a servir, por lo que vamos a buscar la manera de añadir un usuario, o ver si tiene alguna vulnerabilidad:
![[Pasted image 20240312234533.png]]
Por lo que dice la comunidad cuando instalas in librenms, nos viene con una funcion llamada adduser.php que nos sirve para añadir un usuario, por lo que vamos a ver si podemos añadir un usuario administrador desde el usuario frank_dorky:
![[Pasted image 20240312234720.png]]
No nos deja listar lo que hay en el directorio pero si que nos deja ejecutar la funcion que efectivamente si que esta en la ruta, por lo que vamos a crear un usuario nuevo:
![[Pasted image 20240312234826.png]]
Ahora intentamos acceder:
![[Pasted image 20240312235239.png]]Nos deja acceder pero nos da un error  en el webserver y es por que tenemos que añadir el siguiente dominio librenms.com al /etc/hosts.
![[Pasted image 20240313000303.png]]
Como vemos ahora si que tenemos el webserver con un status Ok. Por lo que vamos a seguir investigando, vemos que podemos editar una plantilla de alertas de librenms:
![[Pasted image 20240313000726.png]]Nos enviamos un ping haber si tenemos ejecución remota de comandos:
![[Pasted image 20240313000802.png]]Efectivamente tenemos ejecucion remota de comandos, por lo que vamos a intentar mandarnos una reverse:
![[Pasted image 20240313002235.png]]Nos ponemos en escucha por el 80 que recibiremos la peticion al recurso shell1.sh:
![[Pasted image 20240313002309.png]]
Y por el puerto indicado en el archivo shell1.sh:
![[Pasted image 20240313002332.png]]
Recibiremos la shell:
![[Pasted image 20240313002357.png]]Vamos a meternos linpeas para poder ver posibles escaladas ya que seguimos sin poder conectarnos con root:
![[Pasted image 20240313003358.png]]

Con este user si que podemos ver las funciones de librenms:
![[Pasted image 20240313002614.png]]
Lanzamos el linpeas y en las variables de entorno vemos que el usario kay_relay tiene la contraseña de base de datos mychemicalformulaX:
![[Pasted image 20240313003556.png]]
Vamos a probar la contraseña de este haber si nos podemos conectar:
![[Pasted image 20240313003923.png]]
Nos deja conectarnos, por lo que vamos a seguir investigando con este usuario haber si podemos llegar a root:
![[Pasted image 20240313004019.png]]
Vemos que tiene permisos para ejecutar el script office.sh como sudo sin proporcionar contraseña, por lo que vamos a ver que es lo que hace:
![[Pasted image 20240313004312.png]]
Al parecer nos ejecuta un libreoffcie calc en segundo plano a través del puerto 2002, para que remotamente otros ejecuten sus scripts o comandos para hojas de calculo.
Ejecutamos el script '/usr/bin/office.sh' con el usuario kai_relay y con frank_dorky intentamos hacer una conexion al puerto 2002:
![[Pasted image 20240313010432.png]]
Nos devuelve una cadena vamos a buscar haber que es esto en google, nos sale un directorio en github que nos permite ejecutar un RCE, por lo que vamos a intentar ejecutarlo:
https://github.com/sud0woodo/ApacheUNO-RCE
Lo primero que vamos hacer es copiarnos el script en python que nos ofrecen en el repo de github:
![[Pasted image 20240313013101.png]]
Le decimos que ejecute el script que vamos a crear que es una reverse shell al puerto que le indiquemos.
Creamos el shell.sh:
![[Pasted image 20240313013201.png]]

Ahora nos ejecutamos el comando que podemos ejecutar como root que es el script '/usr/bin/office.sh' siendo el usuario kai_relay, despues ejecutamos el rce.py, mientras estamos en escucha en el puerto 9001:
![[Pasted image 20240313013531.png]]

Esto se establece ya que como podemos ejecutar el script office.sh como si fuéramos sudo cuando ejecutamos un comando con este proceso, nos lo ejecuta como si fuera root, por lo que nos manda una bash con privilegio de root.

![[Pasted image 20240313012959.png]]