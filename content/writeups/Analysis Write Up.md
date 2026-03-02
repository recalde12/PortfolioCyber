--- 
title: "Analysis"
platform: "Hackthebox" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "Windows" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---

#windows #Hard 

----

Análisis es una máquina de dificultad media que involucra enumeración de servicios web, inyecciones LDAP para extracción de credenciales, explotación de subida de archivos para obtener una shell reversa y, finalmente, una escalada de privilegios mediante DLL Hijacking en el servicio Snort.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo exhaustivo de puertos utilizando nmap para identificar los servicios activos en el objetivo:

![[Pasted image 20240123205330.png]]
![[Pasted image 20240123205350.png]]

Tras identificar los puertos abiertos, procedemos a enumerar el servicio RPC de forma anónima mediante rpcclient. Aunque logramos establecer conexión, la información extraída no revela vectores de ataque inmediatos:

![[Pasted image 20240125141623.png]]

Enumeración Web y Subdominios
Al no encontrar directorios interesantes mediante fuzzing estándar, procedemos a configurar el archivo /etc/hosts para incluir el dominio analysis.htb y realizamos un descubrimiento de subdominios.

![[Pasted image 20240123205222.png]]

Añadimos el subdominio encontrado a nuestro archivo de hosts local:
![[Pasted image 20240123210123.png]]

Al explorar el subdominio, identificamos rutas críticas como /users y /employees. Realizamos un nuevo proceso de fuzzing sobre estas rutas:

![[Pasted image 20240123210806.png]]

En la ruta /employees, localizamos un panel de autenticación: ![[Pasted image 20240123211101.png]]

En la ruta /users, encontramos el archivo list.php: ![[Pasted image 20240123211133.png]]

2. Explotación: Inyección LDAP y Acceso Inicial
Dada la naturaleza del sitio, sospechamos de una vulnerabilidad de Inyección LDAP. Tras validar que el panel de login es robusto, centramos los esfuerzos en list.php. Observamos que el archivo requiere un parámetro específico; si no se envía, el servidor responde con "missing parameter".

![[Pasted image 20240125195129.png]]

Fuzzeando el parámetro correcto, logramos confirmar una inyección LDAP exitosa, lo que nos permite extraer credenciales del sistema.

![[Pasted image 20240127130809.png]]

Logramos obtener las credenciales del usuario technician:
![[Pasted image 20240126171841.png]]

Intrusión mediante Arbitrary File Upload
Con las credenciales obtenidas, accedemos al panel de usuario, donde identificamos una funcionalidad de subida de archivos.

![[Pasted image 20240126171921.png]]

Enumeramos el directorio de destino mediante fuzzing, localizando la carpeta /uploads:
![[Pasted image 20240126172453.png]]

Confirmamos que nuestros archivos se suben correctamente y son accesibles:
![[Pasted image 20240126172601.png]]
![[Pasted image 20240126172710.png]]

Para obtener la intrusión, utilizamos una Reverse Shell en PHP diseñada para entornos Windows. Tras configurar nuestra IP y puerto de escucha en el script, procedemos a la ejecución:

![[Pasted image 20240126174551.png]]
![[Pasted image 20240126180451.png]]

¡Conseguimos acceso inicial al sistema!
![[Pasted image 20240126180533.png]]
![[Pasted image 20240126174631.png]]

3. Post-Explotación y Movimiento Lateral
Iniciamos la enumeración del sistema Windows utilizando winPEAS para identificar vectores de escalada o credenciales adicionales.

![[Pasted image 20240127020948.png]]

Gracias a winPEAS, localizamos credenciales para el servicio webservice. Para mejorar nuestra estabilidad, generamos una nueva shell reversa mediante msfvenom y logramos pivotar al usuario webservice.

Posteriormente, tras una nueva fase de enumeración, logramos comprometer al usuario jdoe. Accedemos mediante evil-winrm y capturamos la flag de usuario:

![[Pasted image 20240127134434.png]]
![[Pasted image 20240127134152.png]]

4. Escalada de Privilegios: DLL Hijacking en Snort
Durante la revisión de aplicaciones instaladas, observamos la presencia de Snort. Al investigar vulnerabilidades conocidas para la versión instalada, identificamos un posible vector de DLL Hijacking.

![[Pasted image 20240127134045.png]]

Verificamos los permisos de las carpetas de librerías (/lib) y confirmamos que tenemos permisos de escritura en el directorio donde el binario busca sus DLLs:

![[Pasted image 20240127134814.png]]

Ejecución del Ataque
Creamos una DLL maliciosa en nuestra máquina atacante configurada para ejecutar una shell reversa.

Transferimos la DLL al directorio con permisos de escritura.

Esperamos a que el administrador o un proceso automático ejecute Snort.

![[Pasted image 20240127175537.png]]
![[Pasted image 20240127175549.png]]

Finalmente, recibimos la conexión como System, logrando el compromiso total de la máquina.