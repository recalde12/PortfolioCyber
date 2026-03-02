--- 
title: "Casino Royale I"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulnhub." 
---
#linux 

----------
Casino Royale es una máquina que requiere una enumeración web minuciosa y el encadenamiento de múltiples vulnerabilidades web (Insecure Cookie Handling, CSRF y XXE) para lograr el acceso inicial, culminando en una escalada de privilegios mediante el abuso de binarios SUID y secuestro de ejecución de scripts.

1. Fase de Reconocimiento y Enumeración
Comenzamos con un escaneo de red para identificar los servicios activos en el objetivo:

![[Pasted image 20240327171447.png]]
![[Pasted image 20240327171654.png]]

Identificamos dos servidores web en los puertos 80 y 8081. Procedemos a inspeccionar las tecnologías mediante whatweb:

![[Pasted image 20240327172037.png]]

Realizamos una inspección visual de ambas interfaces:
![[Pasted image 20240327172151.png]]
![[Pasted image 20240327172202.png]]
![[Pasted image 20240327172213.png]]

Fuzzing de Directorios
Ejecutamos un descubrimiento de rutas, encontrando resultados interesantes únicamente en el puerto 80:

![[Pasted image 20240327173527.png]]

Al explorar /index.php/login, identificamos un panel de gestión que hace referencia a un dominio específico. Procedemos a mapearlo en nuestro archivo /etc/hosts:

![[Pasted image 20240327173852.png]]
![[Pasted image 20240327173953.png]]
![[Pasted image 20240327175205.png]]

2. Explotación Web: De Cookie Hijacking a CSRF
En la ruta /install detectamos una versión del CMS vulnerable a Insecure Cookie Handling (Exploit-DB 6766). Localizamos el panel de administración en /pokeradmin.

![[Pasted image 20240327175457.png]]

Bypass de Autenticación
Siguiendo las instrucciones del exploit, inyectamos una cookie de sesión válida desde la consola del navegador para suplantar al administrador:

JavaScript
javascript:document.cookie = "ValidUserAdmin=admin";
(Nota: Este acceso también podría haberse logrado mediante una Inyección SQL en el formulario de login).
![[Pasted image 20240422170933.png]]

Tras recargar, obtenemos acceso al panel de configuración, donde descubrimos una nueva ruta interna:
![[Pasted image 20240327180508.png]]
![[Pasted image 20240327182339.png]]

Ataque CSRF vía SMTP
Al investigar el nuevo CMS, encontramos una vulnerabilidad de CSRF (Exploit-DB 35301). Observamos que una usuaria llamada "Valenka" revisa correos para validar nuevos clientes. Aprovechando que el puerto 25 (SMTP) está abierto y permite el envío de correos sin autenticación, planeamos un ataque de suplantación.

![[Pasted image 20240422173258.png]]
![[Pasted image 20240422173732.png]]

Enviamos un correo malicioso que contiene un payload HTML diseñado para forzar a Valenka a crear un nuevo usuario administrativo cuando abra el mensaje:

![[Pasted image 20240422174536.png]]
![[Pasted image 20240422184115.png]]
![[Pasted image 20240422182152.png]]

Tras recibir la confirmación de la petición en nuestro listener, logramos autenticarnos con la cuenta creada mediante el CSRF.

3. Intrusión: XXE y File Upload
Dentro del panel, revisamos la descripción del usuario "le", la cual apunta a una funcionalidad de procesamiento XML.

![[Pasted image 20240422184606.png]]
![[Pasted image 20240422184643.png]]

Explotación de XXE (XML External Entity)
El código fuente sugiere que el sistema procesa datos XML. Interceptamos la petición con Burp Suite y confirmamos una vulnerabilidad XXE al lograr que el servidor nos devuelva valores inyectados.

![[Pasted image 20240422190258.png]]
![[Pasted image 20240422190705.png]]

Utilizamos este vector para leer archivos sensibles del sistema, extrayendo el /etc/passwd:
![[Pasted image 20240422191054.png]]

Identificamos al usuario ftpUserULTRA. Realizamos un ataque de fuerza bruta con hydra y un diccionario personalizado, obteniendo la contraseña: bankbank.

![[Pasted image 20240422191642.png]]

Obtención de Shell vía FTP
Accedemos por FTP y descubrimos que tenemos permisos de escritura en el directorio raíz del servidor web (/var/www/html).

![[Pasted image 20240422191900.png]]
![[Pasted image 20240422192033.png]]

Subimos un archivo PHP malicioso para ejecutar comandos de sistema. Tras ajustar los permisos del archivo mediante comandos FTP (chmod), logramos ejecución remota de comandos (RCE) y establecemos una reverse shell.

![[Pasted image 20240422192237.png]]
![[Pasted image 20240422193138.png]]
![[Pasted image 20240422193316.png]]
![[Pasted image 20240422193346.png]]

4. Escalada de Privilegios
Ya en el sistema, realizamos una enumeración de binarios con el bit SUID activo:

![[Pasted image 20240423005139.png]]
![[Pasted image 20240423005440.png]]

Localizamos un script inusual en /opt/casino-royale/mi6_detect_test. Al ejecutarlo y analizar su comportamiento, observamos que intenta llamar a un segundo script denominado run.sh, el cual no existe en el sistema.

![[Pasted image 20240423005525.png]]

Secuestro de Ejecución (Abuso de PATH/Missing Script)
Aprovechando que el binario SUID busca ejecutar run.sh, creamos dicho archivo en un directorio donde tengamos control y le asignamos permisos de ejecución. El contenido del script simplemente invoca una bash con privilegios preservados:

Bash
#!/bin/bash
bash -p
![[Pasted image 20240423005726.png]]

Al ejecutar nuevamente el binario /opt/casino-royale/mi6_detect_test, este llama a nuestro run.sh con privilegios de root, otorgándonos acceso total al sistema.

![[Pasted image 20240423010006.png]]

Máquina comprometida. 🚀