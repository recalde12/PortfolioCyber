--- 
title: "Crafty" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#windows #easy

--------
Aquí tienes la versión profesional y estructurada de tu write-up para la máquina Crafty. He organizado el contenido siguiendo una metodología de reporte técnico, manteniendo todas tus evidencias visuales y resaltando el uso del exploit Log4Shell.

Write-up: Crafty (HackTheBox)
Crafty es una máquina Windows de dificultad fácil que destaca por la explotación de la vulnerabilidad Log4Shell (CVE-2021-44228) en un servidor de Minecraft. La escalada de privilegios se logra mediante la reutilización de credenciales encontradas en los archivos de configuración de los plugins del servidor.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar los servicios expuestos en el objetivo:

![[Pasted image 20240211151753.png]]

Identificamos dos puertos abiertos: el puerto 80 (HTTP) y el puerto 25565, el cual corresponde por defecto a un servidor de Minecraft. Realizamos un escaneo detallado para determinar versiones y servicios específicos:

![[Pasted image 20240211151958.png]]

Enumeración Web y DNS
Configuramos el archivo /etc/hosts para incluir el dominio crafty.htb y procedemos a inspeccionar el sitio web:

![[Pasted image 20240211152134.png]]

Durante la enumeración, detectamos el subdominio play.crafty.htb. Tras añadirlo al archivo de hosts, observamos que redirige a la página principal, confirmando que el núcleo de la infraestructura se encuentra en el servidor de juegos.

2. Explotación: Log4Shell (CVE-2021-44228)
Al investigar la versión del servidor de Minecraft, confirmamos que es vulnerable a Log4Shell. Para la explotación, preparamos un entorno controlado utilizando el repositorio log4j-shell-poc.

Nota técnica: Es imperativo utilizar una versión específica de Java (JDK 8u20) para que el ataque JNDI sea efectivo, ya que versiones posteriores implementan restricciones de seguridad que bloquean la ejecución de código remoto.

![[Pasted image 20240212012624.png]]

Ejecutamos el script poc.py para levantar el servidor LDAP malicioso y generar el payload:

![[Pasted image 20240212140525.png]]

Obtención del Acceso Inicial
Nos ponemos en escucha por el puerto 9001. Para interactuar con el servidor de Minecraft, utilizamos la herramienta pycraft, que nos permite conectarnos como un cliente y enviar el payload JNDI a través del chat del juego:

![[Pasted image 20240212140621.png]]

Al procesar el mensaje malicioso, el servidor vulnerable ejecuta nuestra instrucción, devolviendo una shell reversa:

![[Pasted image 20240212140938.png]]

3. Post-Explotación y Movimiento Lateral
Con acceso como usuario, procedemos a mejorar nuestra sesión. Para facilitar la enumeración y el movimiento de archivos, desplegamos un agente de Metasploit (Meterpreter) en el sistema:

![[Pasted image 20240212182717.png]]
![[Pasted image 20240212182703.png]]

Análisis de Plugins y Reutilización de Credenciales
Realizamos una inspección profunda de los directorios de la aplicación. En la ruta server/plugins, localizamos archivos de configuración que contienen credenciales en texto plano utilizadas por los servicios del servidor:

![[Pasted image 20240213134610.png]]
![[Pasted image 20240213140138.png]]

4. Escalada de Privilegios
Utilizamos la credencial obtenida para intentar elevar nuestros privilegios. Empleamos la herramienta runascs, un script que permite ejecutar procesos con credenciales diferentes en entornos Windows. Debido a las restricciones de permisos, cargamos el binario en el directorio temporal (C:\Windows\Temp).

![[Pasted image 20240213141558.png]]

Configuramos un listener en el puerto 4444 y ejecutamos runascs con las credenciales de administrador. El exploit se ejecuta con éxito, otorgándonos una consola con privilegios máximos:

![[Pasted image 20240213141637.png]]

Finalmente, accedemos al directorio del administrador para capturar la flag root.txt:

![[Pasted image 20240213141707.png]]

![[Pasted image 20240213141737.png]]

Máquina comprometida. 🚀