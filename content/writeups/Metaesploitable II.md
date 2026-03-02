--- 
title: "Metaesploitable II"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux

-------------
# Escaneo activo

Metasploitable 2 es una máquina intencionadamente vulnerable diseñada para la práctica de auditorías de seguridad. En este informe se detallan cuatro vectores distintos de compromiso, demostrando cómo configuraciones por defecto y falta de saneamiento de entradas pueden llevar al compromiso total del sistema.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo exhaustivo utilizando nmap para identificar la amplia superficie de ataque de la máquina:

![[Pasted image 20240403173837.png]]

Identificamos numerosos servicios críticos expuestos. Una revisión rápida del servicio FTP (puerto 21) revela que permite el acceso mediante el usuario anonymous.

![[Pasted image 20240403174251.png]]
![[Pasted image 20240403174729.png]]

Tras no encontrar información sensible en el FTP, procedemos a realizar un fuzzing de directorios en el servidor web del puerto 80 utilizando dirsearch:

![[Pasted image 20240403175014.png]]
![[Pasted image 20240403174939.png]]

2. Vector 1: Ejecución Remota de Comandos (RCE) en DVWA
Accedemos a la aplicación DVWA (Damn Vulnerable Web App) utilizando las credenciales por defecto admin:password.

![[Pasted image 20240403183026.png]]

Dentro de la sección "Command Execution", observamos que la aplicación concatena la entrada del usuario directamente en un comando del sistema. Explotamos esto utilizando operadores de concatenación (;) para inyectar una reverse shell.

![[Pasted image 20240416115100.png]]
![[Pasted image 20240416120523.png]]

Al recibir la conexión en nuestro listener, obtenemos acceso al sistema y procedemos al tratamiento de la TTY para obtener una shell interactiva bash.

![[Pasted image 20240416120612.png]]

3. Vector 2: Inyección SQL (SQLi)
En la sección de "SQL Injection", validamos que el campo de búsqueda es vulnerable al inyectar caracteres especiales como la comilla simple (').

![[Pasted image 20240416122139.png]]

Utilizamos una sentencia UNION SELECT para exfiltrar información de la base de datos, logrando listar los nombres de usuario y los hashes de las contraseñas de la tabla users.

![[Pasted image 20240416122736.png]]

4. Vector 3: Abuso de Apache Tomcat (War File Deployment)
Identificamos un servicio Apache Tomcat en ejecución. Probamos las credenciales por defecto (tomcat:tomcat) y logramos acceder al panel de administración "Manager App".

![[Pasted image 20240416123759.png]]
![[Pasted image 20240416123729.png]]

Aprovechamos la funcionalidad de despliegue de aplicaciones para subir un archivo malicioso con extensión .war generado con msfvenom.

![[Pasted image 20240416125235.png]]
![[Pasted image 20240416160749.png]]

Una vez desplegado y ejecutado el recurso desde el navegador, recibimos una conexión reversa que nos otorga acceso al servidor.

![[Pasted image 20240416160824.png]]

5. Vector 4: Explotación de WebDAV
Finalmente, analizamos el directorio /dav del puerto 80. Al ser un servicio WebDAV, utilizamos la herramienta davtest para verificar los permisos de escritura y ejecución.

![[Pasted image 20240418180548.png]]
![[Pasted image 20240418180743.png]]

Confirmamos que es posible subir archivos y ejecutarlos. Subimos un pequeño script en PHP que utiliza la función system() para procesar comandos a través de un parámetro web.

![[Pasted image 20240418181317.png]]
![[Pasted image 20240418181402.png]]

Tras validar el RCE a través del parámetro indicado, inyectamos un payload de reverse shell para consolidar el acceso.

![[Pasted image 20240418181523.png]]
![[Pasted image 20240418182138.png]]
![[Pasted image 20240418181859.png]]
![[Pasted image 20240418182117.png]]

Máquina Metasploitable 2 comprometida. 🚀