--- 
title: "Sightless" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#easy #linux

------------

Sigless es una máquina de dificultad media que requiere una enumeración precisa de servicios web y subdominios. La explotación inicial se basa en una vulnerabilidad de RCE en SQLPad, seguida de un análisis de tráfico local mediante Remote Debugging para capturar credenciales de administrador. La escalada de privilegios final se realiza abusando de las funciones de actualización de PHP en el panel Froxlor.

1. Fase de Reconocimiento y Enumeración
Iniciamos con el escaneo de puertos para identificar los servicios activos:

![[Pasted image 20240930154132.png]]

Identificamos un servidor web en el puerto 80. Tras añadir el dominio principal al archivo /etc/hosts, exploramos la web y descubrimos un nuevo dominio relacionado con la infraestructura:

![[Pasted image 20240930172544.png]]
![[Pasted image 20240930172651.png]]

Enumeración de Subdominios y SQLPad
Realizamos un fuzzing de subdominios y localizamos una instancia de SQLPad, una herramienta de visualización y edición de SQL. Al analizar las acciones disponibles, identificamos usuarios válidos en el sistema.

![[Pasted image 20240930172843.png]]
![[Pasted image 20240930175554.png]]

2. Explotación: RCE en SQLPad (CVE-2022-0944)
Investigamos vulnerabilidades conocidas para SQLPad y localizamos un exploit de Ejecución Remota de Comandos (RCE). Esta vulnerabilidad permite inyectar comandos a través de las plantillas de conexión de bases de datos.

![[Pasted image 20240930175744.png]]
![[Pasted image 20240930175814.png]]

Al ejecutar el exploit, obtenemos una reverse shell inicial. Tras enumerar el entorno, confirmamos que nos encontramos dentro de un contenedor Docker. Localizamos y extraemos el hash de la contraseña del usuario michael.

Movimiento Lateral a SSH
Utilizamos John the Ripper para crackear el hash obtenido y logramos la contraseña de michael, lo que nos permite autenticarnos vía SSH en el sistema host:

![[Pasted image 20240930182142.png]]
![[Pasted image 20240930183004.png]]
![[Pasted image 20240930183111.png]]

3. Post-Explotación: Remote Debugging y Captura de Credenciales
Una vez en el host, identificamos varios servicios corriendo en puertos locales (localhost). Realizamos un SSH Port Forwarding para inspeccionarlos desde nuestro navegador. Detectamos un proceso automatizado en el puerto 34839 donde el administrador interactúa con un panel de Froxlor en el puerto 8080.

![[Pasted image 20241001004928.png]]
![[Pasted image 20241001005127.png]]
![[Pasted image 20241001005141.png]]

Uso de Chrome Remote Debugging
Para interceptar esta interacción, utilizamos la función de Remote Debugging de Chrome. Al conectar con el puerto redireccionado, podemos inspeccionar la sesión del administrador en tiempo real. En la pestaña de red, capturamos el payload de login que contiene el usuario y la contraseña en texto claro.

![[Pasted image 20241001005446.png]]
![[Pasted image 20241001005535.png]]
![[Pasted image 20241001005700.png]]

4. Escalada de Privilegios: Abuso de Froxlor y PHP Opcache
Con las credenciales de administrador, accedemos al panel de Froxlor. Identificamos una funcionalidad que permite generar y actualizar versiones de PHP mediante comandos personalizados.

![[Pasted image 20241001010705.png]]

Secuestro de comandos de actualización
Explotamos esta función inyectando comandos maliciosos en la cadena de ejecución. Realizamos el ataque en dos pasos:

Inyectamos un comando para copiar la flag de root a la carpeta /tmp: cp /root/root.txt /tmp/root.txt.

Inyectamos un segundo comando para cambiar los permisos y hacerla legible: chmod 644 /tmp/root.txt.

![[Pasted image 20241001010737.png]]
![[Pasted image 20240930183004.png]]

Para forzar la ejecución de estos comandos, accedemos al apartado de opcacheinfo, lo que reinicia el servicio y procesa nuestra configuración maliciosa.

![[Pasted image 20241001010956.png]]
![[Pasted image 20241001011103.png]]

Finalmente, accedemos a la ruta /tmp para leer la flag de root directamente.

![[Pasted image 20241001010554.png]]

Máquina Sigless comprometida. 🚀