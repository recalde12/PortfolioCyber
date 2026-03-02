--- 
title: "Skyfall" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Insane" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#linux #insane

--------
Skyfall es una máquina de dificultad difícil que requiere un dominio profundo de infraestructuras en la nube y herramientas de gestión de secretos. La intrusión comienza con un bypass de restricciones mediante caracteres de nueva línea, seguido de la explotación de una vulnerabilidad de divulgación de información en MinIO. La post-explotación y escalada implican el uso de HashiCorp Vault para generar credenciales SSH temporales y el análisis de procesos con privilegios de root para el secuestro de tokens maestros.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar los servicios activos y sus versiones:

![[Pasted image 20240204174208.png]]
![[Pasted image 20240204174239.png]]

Identificamos servicios estándar de SSH y HTTP. Analizando el banner de SSH en Launchpad, confirmamos la distribución del sistema operativo y posibles vulnerabilidades de kernel para fases posteriores.

![[Pasted image 20240204174303.png]]

Enumeración Web y Acceso a la Demo
Configuramos el dominio skyfall.htb en nuestro /etc/hosts. Mediante whatweb, identificamos correos electrónicos expuestos y un subdominio para una instancia de demostración: demo.skyfall.htb.

![[Pasted image 20240204174641.png]]
![[Pasted image 20240204174930.png]]

Accedemos al panel de la demo utilizando las credenciales por defecto guest:guest.

2. Explotación: Vulnerabilidad en MinIO
Bypass de Restricciones (403 Forbidden)
Durante la navegación, localizamos un endpoint protegido que devuelve un error 403. Logramos bypassear esta restricción inyectando un carácter de nueva línea (%0A) en la URL, lo que nos permite visualizar la configuración interna y descubrir un endpoint de la API de MinIO.

![[Pasted image 20240205020823.png]]
![[Pasted image 20240205022738.png]]

Explotación de CVE-2023-28432
Identificamos que la versión de MinIO instalada es vulnerable a la divulgación de variables de entorno (). Al explotar esta vulnerabilidad, obtenemos las claves de acceso (MINIO_ROOT_USER y MINIO_ROOT_PASSWORD).

![[Pasted image 20240205161229.png]]

Utilizamos la herramienta de línea de comandos de MinIO (mc) para configurar un alias y conectarnos al servidor de la víctima.

![[Pasted image 20240205224442.png]]
![[Pasted image 20240205224557.png]]

3. Movimiento Lateral: Abuso de HashiCorp Vault
Enumeramos los buckets disponibles y localizamos un respaldo del directorio home del usuario Askyy (home_backup.tar.gz).

![[Pasted image 20240205224858.png]]
![[Pasted image 20240205225015.png]]

Extracción de Tokens de Vault
Al analizar el archivo .bashrc del respaldo, encontramos la configuración de HashiCorp Vault, incluyendo un token de autenticación y la dirección de la API.

![[Pasted image 20240206030756.png]]

Instalamos el cliente de Vault y configuramos las variables de entorno para interactuar con el servidor.

![[Pasted image 20240206134411.png]]
![[Pasted image 20240206040416.png]]

Generación de Credenciales SSH Temporales
Verificamos nuestros privilegios en Vault y confirmamos que tenemos permisos para utilizar el motor de secretos SSH. Generamos una clave temporal de un solo uso (OTP) para el usuario Askyy y logramos autenticarnos vía SSH para capturar la flag user.txt.

![[Pasted image 20240206041209.png]]
![[Pasted image 20240206041340.png]]
![[Pasted image 20240206134539.png]]

4. Escalada de Privilegios: Secuestro de Master Token
Enumeramos los privilegios de sudo y descubrimos que podemos ejecutar el comando vault-unseal sobre un archivo YAML como root. Este script automatiza el proceso de "des-sellado" del Vault.

![[Pasted image 20240206150332.png]]

Ataque de Race Condition en Logs
El script escribe información sensible en un archivo llamado debug.log con permisos de root, lo que impide nuestra lectura. Sin embargo, podemos pre-crear el archivo con permisos de lectura para nuestro usuario antes de que el script lo genere.

Borramos el log existente (si lo hay) y creamos uno nuevo con permisos totales.

Ejecutamos el script de vault-unseal.

Leemos el archivo debug.log para extraer el Master Token generado durante el proceso.

![[Pasted image 20240206150508.png]]

Con el Master Token en nuestro poder, nos autenticamos en Vault con privilegios de administrador global, generamos una credencial SSH para el usuario root y obtenemos el compromiso total de la máquina.

![[Pasted image 20240206142417.png]]
![[Pasted image 20240206142211.png]]

Máquina Skyfall comprometida. 🚀

