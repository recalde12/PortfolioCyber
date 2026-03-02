--- 
title: "FormulaX" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#linux #hard #xss 

----------------------

Write-up: Chatbot (FormulaX) - HackTheBox
Chatbot es una máquina de dificultad media que requiere una profunda enumeración de aplicaciones web y la capacidad de encadenar vulnerabilidades para lograr el movimiento lateral. La intrusión comienza con un XSS DOM-based para el robo de información, seguido de una explotación de RCE en un subdominio de desarrollo. La escalada de privilegios involucra la manipulación de servicios internos como LibreNMS y la explotación de Apache UNO mediante LibreOffice.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo exhaustivo de puertos para identificar los servicios y versiones activos:

![[Pasted image 20240311125421.png]]
![[Pasted image 20240311125438.png]]

Al explorar el puerto 80, localizamos una aplicación web que simula un servicio de Chatbot basado en IA. Procedemos al registro y a la interceptación de peticiones con Burp Suite para analizar el flujo de datos.

![[Pasted image 20240311125528.png]]
![[Pasted image 20240311125702.png]]

2. Explotación Web: Robo de Histórico vía XSS
Durante la auditoría de la sección "Contact Us", identificamos un vector de XSS (Cross-Site Scripting). Al enviar un payload de prueba, confirmamos la ejecución al recibir una petición en nuestro servidor de escucha:

![[Pasted image 20240311131204.png]]
![[Pasted image 20240311131249.png]]

Explotación de XSS DOM-based
Analizando el código fuente y las conexiones por Sockets, diseñamos un script malicioso. El objetivo es que, cuando el administrador visualice nuestro mensaje, el script abra una conexión al chat en su nombre y nos reenvíe el histórico de sus mensajes (history) codificados en Base64 a nuestro listener.

![[Pasted image 20240311154009.png]]
![[Pasted image 20240311163418.png]]
![[Pasted image 20240311155849.png]]
![[Pasted image 20240311163441.png]]
![[Pasted image 20240311161422.png]]
![[Pasted image 20240311163503.png]]

Tras desplegar el recurso en el puerto 8088 y enviar el payload, recibimos con éxito la exfiltración de datos:

![[Pasted image 20240311164216.png]]
![[Pasted image 20240311164304.png]]
![[Pasted image 20240311164547.png]]

Al decodificar el Base64, obtenemos acceso al histórico del administrador, donde localizamos un subdominio de desarrollo: dev-git-auto-update.chatbot.htb.

![[Pasted image 20240311164014.png]]

3. Intrusión y Acceso Inicial: RCE
Accedemos al nuevo subdominio y observamos una herramienta de actualización automática. En el pie de página identificamos la versión del software, la cual presenta una vulnerabilidad de Ejecución Remota de Comandos (RCE).

![[Pasted image 20240311170305.png]]
![[Pasted image 20240312174252.png]]
![[Pasted image 20240312181514.png]]

Preparamos un script de reverse shell (.sh) y utilizamos el PoC para forzar al servidor a descargar y ejecutar nuestro archivo:

![[Pasted image 20240312181829.png]]
![[Pasted image 20240312181956.png]]
![[Pasted image 20240312182043.png]]
![[Pasted image 20240312182126.png]]

Logramos la primera shell reversa en el sistema:
![[Pasted image 20240312182152.png]]

4. Movimiento Lateral y Escalada de Usuario
Compromiso de MongoDB
Enumeramos el sistema y localizamos archivos de configuración que apuntan a una base de datos MongoDB llamada testing.

![[Pasted image 20240312182435.png]]
![[Pasted image 20240312182527.png]]

Al conectarnos localmente, extraemos los hashes de los usuarios. Tras un proceso de crackeo, obtenemos la contraseña del usuario franky_dorky.

![[Pasted image 20240312182726.png]]
![[Pasted image 20240312183932.png]]

Pivotamos al usuario franky_dorky vía SSH para obtener la flag de usuario:
![[Pasted image 20240312232056.png]]

Explotación de LibreNMS (Local Port Forwarding)
Detectamos el puerto 3000 abierto en local, donde corre el servicio LibreNMS. Realizamos un Port Forwarding para acceder desde nuestro navegador local.

![[Pasted image 20240312234153.png]]
![[Pasted image 20240312234324.png]]

Utilizamos el script interno adduser.php para crear un usuario administrador y logramos el bypass de estatus del servidor configurando librenms.com en nuestro /etc/hosts.

![[Pasted image 20240312234533.png]]
![[Pasted image 20240312234720.png]]
![[Pasted image 20240312234826.png]]
![[Pasted image 20240312235239.png]]
![[Pasted image 20240313000303.png]]

Aprovechamos la funcionalidad de edición de plantillas de alertas para inyectar comandos y obtener una nueva shell reversa como el usuario que corre el servicio web.

![[Pasted image 20240313000726.png]]
![[Pasted image 20240313000802.png]]
![[Pasted image 20240313002235.png]]
![[Pasted image 20240313002309.png]]
![[Pasted image 20240313002332.png]]
![[Pasted image 20240313002357.png]]

5. Escalada de Privilegios: Root (Apache UNO RCE)
Finalmente, utilizamos linpeas y descubrimos que el usuario kay_relay tiene una contraseña reutilizada en las variables de entorno: mychemicalformulaX.

![[Pasted image 20240313003358.png]]
![[Pasted image 20240313002614.png]]
![[Pasted image 20240313003556.png]]
![[Pasted image 20240313003923.png]]

Como kay_relay, verificamos los permisos de sudo y encontramos que podemos ejecutar /usr/bin/office.sh sin contraseña. Este script inicia un servicio de LibreOffice Calc que escucha en el puerto 2002.

![[Pasted image 20240313004019.png]]
![[Pasted image 20240313004312.png]]

Explotación de LibreOffice vía UNO
Utilizamos un exploit basado en Apache UNO RCE para conectar con la instancia de LibreOffice que corre como root. Al ejecutar el comando a través de este servicio privilegiado, obtenemos una shell reversa final con permisos de superusuario.

![[Pasted image 20240313010432.png]]
![[Pasted image 20240313013101.png]]
![[Pasted image 20240313013201.png]]
![[Pasted image 20240313013531.png]]

¡Logramos acceso total como root!
![[Pasted image 20240313012959.png]]

Máquina comprometida. 🚀