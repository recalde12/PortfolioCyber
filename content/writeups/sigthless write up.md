--- 
title: "Sightless" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#easy #linux

------------

Lo primero que hacemos como siempre es realizar un escaneo de puertos: 

![[Pasted image 20240930154132.png]]

Metemos el dominio que nos sale del puerto 80 en el /etc/host, y exploramos la web: 

![[Pasted image 20240930172544.png]]

explorándola hemos encontrado otro dominio que hemos añadido al /etc/host: 

![[Pasted image 20240930172651.png]]

Por lo que vamos a buscar mas subdominios y a analizar este que hemos encontrado: 

![[Pasted image 20240930172843.png]]

Encontramos dos users analizando las diferentes acciones que podemos realizar en sqlpad:
![[Pasted image 20240930175554.png]]

Buscando posibles vulnerabilidades encontradas en sqlpad montados, encontramos el siguiente: 
https://github.com/0xRoqeeb/sqlpad-rce-exploit-CVE-2022-0944

Por lo que probamos haber si funciona:

![[Pasted image 20240930175744.png]]
![[Pasted image 20240930175814.png]]Y recibimos la conexión por lo que parece estamos en un contenedor de docker, vemos los hashes de la contraseña de michael: 
![[Pasted image 20240930182142.png]]

Crackeamos el hash de michael: 
![[Pasted image 20240930183004.png]]
y tratamos de conectarnos por ssh: 

![[Pasted image 20240930183111.png]]

Una vez conectados con michael, vemos que tiene varios puertos abiertos de manera local:
![[Pasted image 20241001004928.png]]Como nos podemos conectar por ssh, hacemos port forwarding con este, y probamos uno a uno haber que es lo que hay montado por detras de estos puertos, en el  34839 vemos una secuencia que se repite en el que el admin se conecta, al panel de login que hay por el puerto 8080 montado: 

![[Pasted image 20241001005127.png]]![[Pasted image 20241001005141.png]]
![[Pasted image 20241001005323.png]] 

Para poder escuchar y debbuguear la web de el puerto 34839, a parte de hacer el port forwarding tenemos que añadir en chrome un remote debbuging, en la siguiente ruta de chrome:
![[Pasted image 20241001005446.png]]
Cuando la conexion a funcionado con este puerto se nos ha abierto la ventana de target y cuando le hemos dado a inspect nos lleva a la siguiente ventana: 

![[Pasted image 20241001005535.png]] 
En ese index podremos ver en la parte del payload que manda el admin el usuario y la contraseña en texto claro por lo que ahora podremos conectarnos al panel de login de froxlor:

![[Pasted image 20241001005700.png]]

Ahora para escalar privilegios vemos en php que se pueden generar nuevas versiones de php para poder actualizarlo: 
![[Pasted image 20241001010705.png]]

Intentamos generar una nueva:
![[Pasted image 20241001010737.png]]

Vamos a jugar con ese comando para decirle primero que nos ejecute el siguiente comando: 
cp /root/root.txt, una vez este en la ruta /tmp la flag de root no vamos a tener permisos para leerla por lo que eliminamos la version que hemos creado y creamos otra con el comando chmod 644 /tmp/root.txt:
![[Pasted image 20241001010912.png]]

Para que se ejecuten tenemos que ir al apartado opcacheinfo:
![[Pasted image 20241001010956.png]]
Una vez reiniciemos se ejecutara el comando esto hay que hacerlo para ambas acciones tanto para la copia como para dar los permisos:
![[Pasted image 20241001011103.png]]


![[Pasted image 20241001010554.png]]