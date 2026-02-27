--- 
title: "Perfection" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#easy #linux #STTI

------------
![[Pasted image 20240304005141.png]]
Vemos la version del sistema operativo que corre por detras:
![[Pasted image 20240304005253.png]]

Aplicamos un whatweb al puerto 80 de la pagina:

![[Pasted image 20240304012510.png]]

Revisamos la pagina, y parece que tenemos una parte en la que nos hace la media de unos parametros que le metemos:
![[Pasted image 20240304021225.png]]
>He intentado inyectar etiquetas html pero me reporta el mensaje malicious input blocked.

Por lo que vemos es la unica via explotable en la maquina por lo que vamos a probar a fuzzear por los caracteres especiales utilizando burp.
Lo primero que hemos hecho a sido interceptar la petición del sistema y a partir de aquí con el intruder hemos hecho un ataque de tipo snipper en uno de los campos de category y hemos utilizado seclists y un diccionario de caracteres especiales:
![[Pasted image 20240304135845.png]]Vemos que el único que devuelve un código de estado diferente es el % y que una nueva linea nos deja ejecutarla sin que nos de un error:
![[Pasted image 20240304145238.png]]

Sabiendo esto ahora debemos intentar ejecutar un salto de linea para poder inyectar un payload, nos encontramos con una vuln llamada STTI, en la que nos aprovechamos del funcionamiento de la plantilla de la web, consiguiendo saltarnos la blacklist de caracteres especiales a partir de aquí es donde vamos a intentar inyectar el comando para conseguir RCE, para saltarnos la blacklist detrás del nombre de la categoría vamos a inyectar %0A, esto es como si fuera una nueva linea con esto nos estamos saltando el filtro seguido de esto inyectamos el código que nos permite ejecutarnos una reverse shell:
![[Pasted image 20240304161159.png]]
detrás de esto inyectamos el código malicioso que nos ejecutara el comando que le inyectemos:
https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Server%20Side%20Template%20Injection/README.md
![[Pasted image 20240304161318.png]]
Si inyectamos la reverse directamente sin pasarlo a base64 nos dará un error y no nos establecerá la reverse por lo que hay que pasar la reverse a base64 y en la inyección decodearlo otra vez.
Creando la reverse en base64:
![[Pasted image 20240304161740.png]]
Ahora pegamos este comando en base64 en el código que queremos inyectar y urlencodeamos este base64 para que no nos de errores:
![[Pasted image 20240304162242.png]]
Lo dicho le añadimos el base64 -d | bash, para decodearlo de base64 y que se ejecute la reverse, por lo que nos ponemos en escucha y mandamos la petición, nos llegara una shell por el puerto que le hayamos indicado:
![[Pasted image 20240304162213.png]]
Ahora es el momento de escalar privilegios, investigando el sistema hemos encontrado un hash en un archivo llamado pupilpath_credentials.db:
![[Pasted image 20240304163632.png]]

Y podemos crackearlo ya que nos sabemos el patrón gracias a un mail que hemos encontrado en la ruta /var/mail/susan:
![[Pasted image 20240304163430.png]]
Con hashcat crackeamos la contraseña sabiendo el patron:
![[Pasted image 20240304171101.png]]
La mascara que le metemos es por que tenemos que probar 1.000.000.000 de digitos, por lo que le metemos tantas d? como 0 tiene.
La contraseña es: susan_nasus_413759210
Por lo que ahora nos podemos conectar por ssh:
![[Pasted image 20240304171255.png]]
Ahora sabiendo la contraseña podemos ver los permisos con sudo:
![[Pasted image 20240304171336.png]]
Vemos que ahora sabiendo la contraseña podemos ejecutar cualquier comando con privs de admin.
Por lo que vamos a convertirnos en root:
![[Pasted image 20240304171444.png]]
![[Pasted image 20240304171012.png]]