--- 
title: "Bizness" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

---------
Bizness es una máquina Linux de dificultad fácil que se centra en la explotación del software de gestión empresarial Apache OFBiz. La intrusión se logra mediante un bypass de autenticación (CVE-2023-51467) que permite la ejecución remota de comandos (RCE). La escalada de privilegios implica el análisis de archivos de configuración para extraer hashes de contraseñas y su posterior descifrado mediante el uso de "salts" específicos del framework.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar los servicios activos:

![[Pasted image 20240112000436.png]]

Identificamos los servicios estándar SSH (22) y HTTP/HTTPS (80/443). El escaneo detallado de versiones revela que el servidor web utiliza un certificado autofirmado para el dominio bizness.htb, el cual procedemos a añadir a nuestro archivo /etc/hosts.

![[Pasted image 20240112000811.png]]
![[Pasted image 20240112001236.png]]
![[Pasted image 20240112002649.png]]

Fuzzing de Directorios con Bypass SSL
Al intentar realizar un fuzzing estándar, el servidor devuelve errores de certificado y redirecciones (302). Optamos por utilizar gobuster con la flag -k para ignorar la validación de SSL y filtramos los códigos de estado irrelevantes.

![[Pasted image 20240112002844.png]]
![[Pasted image 20240112003002.png]]

Localizamos la ruta /control/, que tras un segundo nivel de fuzzing con wfuzz, nos revela el endpoint de login de Apache OFBiz.

![[Pasted image 20240112003640.png]]
![[Pasted image 20240112014751.png]]

2. Explotación: Authentication Bypass (CVE-2023-51467)
Investigamos vulnerabilidades recientes para Apache OFBiz y localizamos el CVE-2023-51467, un fallo crítico que permite omitir la autenticación debido a una vulnerabilidad en el componente checkLogin.

Verificación de Vulnerabilidad
Utilizamos un script de prueba para confirmar si el endpoint responde con un PONG, lo cual indica que la ruta es accesible sin credenciales y, por tanto, vulnerable.

![[Pasted image 20240112023614.png]]
![[Pasted image 20240112024205.png]]
![[Pasted image 20240112025550.png]]

Obtención del Acceso Inicial (RCE)
Ejecutamos el exploit para forzar una reverse shell. Tras establecer un listener en nuestra máquina atacante, logramos la conexión inicial y procedemos al tratamiento de la TTY para obtener una consola interactiva.

![[Pasted image 20240112030741.png]]

3. Post-Explotación y Escalada de Privilegios
Durante la enumeración del sistema de archivos, localizamos archivos de logs y configuraciones de la base de datos de OFBiz. Encontramos un hash SHA-1 que representa la contraseña del administrador.

![[Pasted image 20240112031943.png]]

Descifrado de la Contraseña
A diferencia de los hashes estándar, OFBiz utiliza un formato de almacenamiento que incluye un SALT. Localizamos el salt necesario en los archivos de configuración del framework:

![[Pasted image 20240112040027.png]]

Utilizamos un script especializado en Python para procesar el hash junto con el salt encontrado. El proceso de fuerza bruta/descifrado nos devuelve la contraseña en texto plano: monkeybizness.

![[Pasted image 20240112035936.png]]
![[Pasted image 20240112042839.png]]

Con estas credenciales, logramos pivotar al usuario administrador o escalar privilegios mediante sudo, obteniendo el compromiso total de la máquina.

Máquina Bizness comprometida. 🚀
