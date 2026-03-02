---
title: "Office" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Hard" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#Hard #windows 

----
Office es una máquina que simula un entorno corporativo complejo. La resolución implica el compromiso inicial de un CMS Joomla mediante la explotación de una vulnerabilidad de divulgación de información, análisis forense de paquetes PCAP para interceptar hashes de Kerberos, y una cadena de escalada de privilegios basada en vulnerabilidades de LibreOffice y abuso de privilegios en el sistema.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar la superficie de ataque:

![[Pasted image 20240218231857.png]]
![[Pasted image 20240218231937.png]]

Configuramos el dominio office.htb en nuestro /etc/hosts. El escaneo web y el fuzzing de directorios con dirsearch nos revelan un panel de administración de Joomla.

![[Pasted image 20240218232128.png]]
![[Pasted image 20240218233102.png]]
![[Pasted image 20240218233224.png]]

Utilizamos joomscan para determinar la versión exacta y detectar vulnerabilidades conocidas.

2. Explotación Web: Joomla y Análisis PCAP
Explotación de CVE-2023-23752
Identificamos que la versión de Joomla es vulnerable a CVE-2023-23752, lo que nos permite extraer información sensible de la API sin autenticación, obteniendo credenciales de un usuario.

![[Pasted image 20240219000953.png]]

Análisis Forense de Red (SMB y Kerberos)
Utilizando las credenciales obtenidas para el usuario dwolfe, logramos listar recursos compartidos vía SMB. Localizamos y descargamos un archivo .pcap en la carpeta SOC Analysis.

![[Pasted image 20240219183611.png]]

Al analizar el tráfico con Wireshark, filtramos por paquetes de Kerberos (Krb5). Localizamos un paquete de pre-autenticación que contiene un hash crackeable.

![[Pasted image 20240223002656.png]]

Utilizamos Hashcat con el modo 19900 para romper el hash, obteniendo la contraseña del usuario tstark: playboy69.

![[Pasted image 20240223094837.png]]

Obtención de Shell Inicial
Con las credenciales de tstark, accedemos al panel de administración de Joomla. Ganamos ejecución remota de comandos (RCE) modificando los templates de PHP para incluir una reverse shell.

![[Pasted image 20240223095225.png]]
![[Pasted image 20240223120806.png]]
![[Pasted image 20240223120902.png]]

3. Post-Explotación y Movimiento Lateral
Abuso de LibreOffice (CVE-2023-2255)
Detectamos que el sistema utiliza una versión vulnerable de LibreOffice. Realizamos un Port Forwarding con Chisel para acceder a una aplicación interna en el puerto 8083.

![[Pasted image 20240224180715.png]]
![[Pasted image 20240224180841.png]]

Utilizamos el exploit para generar un archivo .odt malicioso que aprovecha un fallo en los enlaces de marcos (frames) para ejecutar comandos cuando el archivo es procesado por el sistema.

![[Pasted image 20240224181913.png]]

Subimos el archivo malicioso a la ruta de procesamiento y capturamos una shell reversa con Metasploit, pivotando al usuario ppots.

![[Pasted image 20240224182122.png]]

4. Escalada de Privilegios Final
Una vez como ppots, realizamos una enumeración de credenciales almacenadas en el sistema. Localizamos información sobre el usuario hhogan.

![[Pasted image 20240224185851.png]]

Utilizamos herramientas de enumeración de Windows para extraer el SID (Security Identifier) del usuario y proceder con la fase final de compromiso del dominio.

![[Pasted image 20240224193729.png]]

![[Pasted image 20240224190621.png]]

Máquina Office comprometida. 🚀