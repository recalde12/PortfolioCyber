--- 
title: "CozyHosting" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

--------
CozyHosting es una máquina Linux de dificultad fácil que se centra en la explotación de una exposición de información en un endpoint de Spring Boot Actuator, el secuestro de una sesión de administrador y un ataque de inyección de comandos para obtener una shell inicial. La escalada de privilegios aprovecha permisos mal configurados en el archivo sudoers sobre el binario SSH.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos estándar para identificar los servicios disponibles:

![[Pasted image 20240113201549.png]]

Posteriormente, realizamos un escaneo detallado para determinar versiones y servicios específicos:

![[Pasted image 20240113201730.png]]

Análisis del Banner SSH
Utilizando herramientas de búsqueda de banners (como Launchpad), analizamos la cadena devuelta por el servicio SSH. Esto nos confirma que nos enfrentamos a una distribución Ubuntu específica, la cual podría contener vulnerabilidades conocidas en sus paquetes instalados.

![[Pasted image 20240113202014.png]]

2. Explotación Web: Secuestro de Sesión y RCE
Realizamos un proceso de fuzzing de directorios sobre el servidor web. Tras no obtener resultados concluyentes con gobuster, cambiamos a otro fuzzer que nos permite localizar endpoints críticos de Spring Boot Actuator.

![[Pasted image 20240113202956.png]]
![[Pasted image 20240113204719.png]]

Identificamos la ruta /actuator/sessions, la cual expone sesiones activas de usuarios en el sistema. Localizamos al usuario kanderson junto con un token de sesión válido.

![[Pasted image 20240113204758.png]]

Interceptamos una petición de login con Burp Suite para verificar la estructura de las cookies y procedemos a suplantar la identidad de kanderson reemplazando nuestra cookie de sesión por la obtenida del endpoint.

![[Pasted image 20240113205048.png]]
![[Pasted image 20240113205606.png]]

Inyección de Comandos (RCE)
Una vez dentro del panel de administración, encontramos una funcionalidad que permite añadir un hostname y un usuario para conexiones SSH. Al interceptar esta petición, observamos que los parámetros se pasan directamente a un comando del sistema.

![[Pasted image 20240113210625.png]]
![[Pasted image 20240113002301.png]]

Detectamos que el sistema bloquea los espacios en el input. Sin embargo, dado que el backend utiliza bash, podemos evadir esta restricción utilizando la variable interna ${IFS} o técnicas de codificación. Confirmamos la ejecución de comandos enviando un payload que genera espacios mediante un echo hacia base64.

![[Pasted image 20240114005725.png]]
![[Pasted image 20240114005900.png]]
![[Pasted image 20240114010443.png]]

Finalmente, preparamos un one-liner de reverse shell, lo codificamos en Base64 para evitar problemas de sintaxis y lo inyectamos en el payload:

![[Pasted image 20240114010731.png]]
![[Pasted image 20240114012230.png]]
![[Pasted image 20240114012325.png]]

Establecemos el listener y recibimos la conexión:
![[Pasted image 20240114012700.png]]
![[Pasted image 20240114012721.png]]

3. Movimiento Lateral: Análisis de Base de Datos
Tras estabilizar la TTY, enumeramos el sistema y localizamos el directorio /app, que contiene los archivos de la aplicación Java. Transferimos los archivos a nuestra máquina local para realizar ingeniería inversa con jd-gui.

![[Pasted image 20240114013749.png]]
![[Pasted image 20240114020154.png]]

Al analizar el código descompilado, localizamos las credenciales de una base de datos PostgreSQL.

![[Pasted image 20240114045437.png]]

Accedemos a la base de datos y consultamos la tabla de usuarios, donde encontramos los hashes de kanderson y del admin.

![[Pasted image 20240114050555.png]]
![[Pasted image 20240114051243.png]]

Utilizamos John the Ripper para crackear el hash del administrador, obteniendo la contraseña: manchesterunited.

![[Pasted image 20240114052111.png]]
![[Pasted image 20240114052054.png]]

Validamos que el usuario josh existe en el sistema y procedemos a autenticarnos vía SSH:
![[Pasted image 20240114052213.png]]

4. Escalada de Privilegios
Una vez logueados como josh, ejecutamos sudo -l para verificar los privilegios asignados. Observamos que el usuario puede ejecutar el binario /usr/bin/ssh como root sin proporcionar contraseña.

![[Pasted image 20240114053434.png]]

Consultamos GTFOBins para encontrar una técnica de escape. Al utilizar el parámetro -o ProxyCommand, podemos forzar a SSH a ejecutar un comando (en este caso, /bin/sh) antes de establecer la conexión, heredando los privilegios de sudo.

![[Pasted image 20240114053917.png]]
![[Pasted image 20240114053940.png]]

¡Logramos acceso total como root!

![[Pasted image 20240114054242.png]]

Máquina comprometida. 🚀