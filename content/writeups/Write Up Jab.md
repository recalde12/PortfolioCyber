--- 
title: "Jab" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#windows #Medium 

----------
Lo primero que hacemos es hacer un escaneo de la maquina y sus puertos:
![[Pasted image 20240226112955.png]]
![[Pasted image 20240226113131.png]]
Vemos un servidor xmpp, de openfire, este es un protocolo de mensajeria instantánea
![[Pasted image 20240226113421.png]]Vemos que tenemos esto montado por detrás, he probado a hacer fuzz de directorios, en la pagina que nos muestran en el puerto 7070 que nos redirige a una pagina oficial de xmpp para ver como funciona y demás, vemos que nos podemos conectar y hacer uso del server con una aplicación que se llama pidgin https://pidgin.im/help/protocols/xmpp/, una vez instaldado podemos crearnos una cuenta, y conectarla al servidor xmpp de jab.htb:
![[Pasted image 20240226125937.png]]
Una vez conectado al server podemos ver los usuarios que hay registrados en el dominio jab.htb:
![[Pasted image 20240226130049.png]]
Además una vez conectados, podemos ver dos buddies a los que se nos debe de añadir automáticamente:
![[Pasted image 20240226130739.png]]
Vemos un mensaje que parece ser una imagen, no creo que nos valga de mucho.
Pero como tenemos una lista de usuarios validos vamos a tirar del siguiente exploit en python para ver si podemos sacar algún hash de algún usuario:
https://github.com/fortra/impacket/blob/master/examples/GetNPUsers.py
Lo primero que hacemos es crear un diccionario con todos los usuarios validos:
![[Pasted image 20240226140229.png]]
Una vez hecho esto nos clonamos el script anterior, y lo ejecutamos con este diccionario de usuarios validos:
![[Pasted image 20240226140312.png]]
Nos saca un hash del usuario jmontgomery, vamos a intentar crackearlo con john:
![[Pasted image 20240226144119.png]]
Hemos sacado la contraseña del usuario jmontgomery, por lo que vamos a intentar logguearnos, en el pidgin de momento, y nos deja dentro de este usuario vemos que hay una sala de chat que se llama pentest2023:
![[Pasted image 20240226161336.png]]
En esta podemos ver la contraseña de otro usuario:
![[Pasted image 20240226161419.png]]
Con este usuario y esta contraseña vemos que podemos, hacer muchas mas cosas:
![[Pasted image 20240226164208.png]]
Por lo que vamos a tratar de ganar una shell del algún modo con este usuario.
Para ganar una shell teniendo la contraseña de este usuario podemos utilizar el siguiente comando de la suite de impacket:
![[Pasted image 20240226203206.png]]Con este comando podemos con un usuario y credenciales validas ejecutar un comando en la maquina, por lo que nos vamos a enviar una reverse shell utilizando la del siguiente recurso de github:
https://github.com/samratashok/nishang/tree/master/Shells
Nos ponemos en escucha por el puerto 9001, compartiendo el script que nos va a invocar la reverse shell por el puerto que le indiquemos:
![[Pasted image 20240226203406.png]]
Añadimos al final del reverse.ps1 la linea donde invocamos la shell en el puerto en el que vamos a estar en escucha:
![[Pasted image 20240226203526.png]]
Y cuando ejecutemos el comando de impacket nos llegara la shell:
![[Pasted image 20240226203605.png]]
Ahora lo que vamos a estar haciendo para escalar privilegios es con chisel compartirnos el puerto 9090 haciendo un portforwarding, con esto lo que vamos a conseguir es tener acceso a la consola de administracion de Openfire:
![[Pasted image 20240227171847.png]]
![[Pasted image 20240227171902.png]]
Ahora cuando accedemos al puerto 9090 de nuestra maquina en realidad es el puerto de la maquina victima:
![[Pasted image 20240227171938.png]]
Tenemos un usuario valido para este panel que es el usuario svc_openfire con su contraseña.
Y una vez conectados podemos explotar la segunda parte de esta vuln que es la subida de un plugin malicioso [https://vulncheck.com/blog/openfire-cve-2023-32315](https://vulncheck.com/blog/openfire-cve-2023-32315 "https://vulncheck.com/blog/openfire-cve-2023-32315
(https://vulncheck.com/blog/openfire-cve-2023-32315)").
Por lo que subimos el plugin:
![[Pasted image 20240227222313.png]]
Una vez subido el plugin, lo que vamos hacer es utilizarlo para ganar una shell:

![[Pasted image 20240227224627.png]]
![[Pasted image 20240227224646.png]]
La contraseña para esta consola es 123, lo hemos sacado de un archivo .jar que hay en la maquina.
Nos conectamos a la shell, y nos intentaremos mandar una reverse shell.
Pegamos la reverse en el comando a ejecutar:
![[Pasted image 20240228161655.png]]

![[Pasted image 20240228161707.png]]
Nos ponemos en escucha por el puerto indicado:
![[Pasted image 20240228161752.png]]
https://www.hackthebox.com/achievement/machine/802953/589
![[Pasted image 20240228161848.png]]