--- 
title: "Bizness" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

---------
Lo primero que hago es escanear los puertos que puedan estar abiertos de la maquina:
![[Pasted image 20240112000436.png]]

Sacamos la version y servicio que corren en los puertos que se encuentran abiertos:
![[Pasted image 20240112000811.png]]
Metemos el dominio que vemos al que no nos sabe redirigir en la informacion que nos reporta nmap:
![[Pasted image 20240112001236.png]]
Entramos en la pagina y vemos lo siguiente:
![[Pasted image 20240112002649.png]]
Antes de entrar nos decía que había riesgo ya que no reconoce el certificado, por lo que hemos tenido que aceptar, esto lo que quiere decir es ahora cuando intentemos fuzzear nos va a salir un error, si lo ejecutamos así:
![[Pasted image 20240112002844.png]]
Por lo que vamos a tener que ignorar los certificados utilizando la siguiente flag:
![[Pasted image 20240112003002.png]]
Lo del --wildcard switch -b "302", es por que en las rutas que no encuentra nos devuelve un código de estado 302 para redirigirnos, por lo que lo ignoramos de esta manera.
Vemos que hemos encontrado una ruta que nos devuelve un 200, por lo que vamos a ver que hay:
![[Pasted image 20240112003640.png]]

Como vemos nos devuelve un mensaje de error, así que vamos a fuzzear a partir de esta ruta:
![[Pasted image 20240112004816.png]]
Lo hacemos con wfuzz ya que con gobuster es mas difícil filtrar por palabras y demás.
Nos vamos a la ruta del login:
![[Pasted image 20240112014751.png]]
 Vemos lo siguiente, buscando he encontrado que los sistemas de apacheOFBiz que sean versiones anterios a la 18.01, son vulnerables al siguiente CV:https://www.incibe.es/incibe-cert/alerta-temprana/vulnerabilidades/cve-2023-51467
 He encontrado un repositorio que ofrece dos scripts en python uno te comprueba si la maquina es vulnerable al bypass del login permitiéndonos un RCE,  y otro que lo explota:
 https://github.com/jakabakos/Apache-OFBiz-Authentication-Bypass
Nos hemos descargado estos archivos en nuestra maquina parrot:
![[Pasted image 20240112023614.png]]

Lo primero que vamos a comprobar es si es vulnerable:
![[Pasted image 20240112024205.png]]
Nos indica el script que si es vulnerable, he estado investigando y por lo visto el script busca si existe la ruta http://bizness.htb/webtools/control/chechLogin, si existe y devuelve un mensaje de texto PONG es vulnerable.
He creado un script muy sencillo en python para que se entienda lo que hace el script ProbeRce.py:
![[Pasted image 20240112025550.png]]
Básicamente lo que hace el script es hacer una petición a la 'target_url' y si devuelve un código de estado 200 y como text 'PONG' es que existe la ruta y puede ser explotada por el exploit.py.
Por lo que ahora vamos a proceder a explotar la maquina con el exploit.py:
![[Pasted image 20240112030741.png]]
Como veis hemos ganado acceso a traves de una reverse shell, por lo que nos hemos podido conectar a la maquina, ahora vamos hacer un tratamiento de la tty y procederemos a escalar privilegios.
Buscando en posibles logs del sistema hemos encontrado uno muy interesante:
![[Pasted image 20240112031943.png]]
En el que vemos la contraseña del admin cifrada.
Para descifrarla hemos encontrado el siguiente script en python:
![[Pasted image 20240112035936.png]]
Necesitamos un SALT que lo encontramos en la siguiente ruta:
![[Pasted image 20240112040027.png]]
Con esta SALT podemos proceder a desencriptar la contraseña que es monkeybizness.
![[Pasted image 20240112042839.png]]
