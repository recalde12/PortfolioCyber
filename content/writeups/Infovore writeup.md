--- 
title: "Infovore"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux 

------
Infovore es una máquina de dificultad media que pone a prueba la capacidad de identificar malas configuraciones en servicios web y de realizar movimientos laterales desde entornos de contenedores hacia el sistema host. La explotación incluye el abuso de phpinfo(), un LFI (Local File Inclusion) con Race Condition, y técnicas de Docker Breakout.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar servicios expuestos:

![[Pasted image 20240723141704.png]]
![[Pasted image 20240723141822.png]]

Solo el puerto 80 (HTTP) está abierto, ejecutando un servidor Apache. Al explorar la web, encontramos una página por defecto, por lo que procedemos a realizar fuzzing de directorios:

![[Pasted image 20240723145947.png]]

Identificamos el recurso info.php. El acceso a phpinfo() es crítico, ya que revela la configuración del motor PHP, incluyendo directivas de subida de archivos y funciones deshabilitadas.

2. Explotación Web: LFI a RCE vía phpinfo()
Identificación del Vector
Al analizar info.php, confirmamos que file_uploads está activado. Aunque no hay un formulario de subida visible, podemos forzar una subida temporal mediante una petición POST multipart.

![[Pasted image 20240723153529.png]]

Mediante fuzzing de parámetros en la raíz, localizamos un parámetro vulnerable a LFI:

![[Pasted image 20240723154619.png]]
![[Pasted image 20240723154752.png]]

Race Condition (LFI2RCE)
Dado que PHP elimina los archivos temporales inmediatamente después de procesar la solicitud, debemos explotar una Race Condition. Utilizamos un script especializado (phpinfolfi.py) para inundar el servidor con peticiones que suben un payload y simultáneamente intentan incluirlo antes de su borrado.

Ajustamos el script para que coincida con la estructura de la respuesta del servidor y el parámetro de LFI:
![[Pasted image 20240723163022.png]]
![[Pasted image 20240723163640.png]]

Ejecutamos el exploit y obtenemos una reverse shell:
![[Pasted image 20240723164005.png]]
![[Pasted image 20240723164022.png]]

3. Movimiento Lateral y Escape de Docker
Tras obtener acceso, confirmamos mediante la dirección IP y la estructura de archivos que nos encontramos dentro de un contenedor Docker.

Extracción de Credenciales
Realizamos una enumeración con linpeas y localizamos un archivo comprimido sospechoso: .oldkeys.tgz. Lo extraemos en /tmp y encontramos claves privadas cifradas.

![[Pasted image 20240731210401.png]]

Utilizamos ssh2john y John the Ripper para crackear la frase de paso de la clave privada:
![[Pasted image 20240731223907.png]]
![[Pasted image 20240731223812.png]]

La contraseña obtenida es choclate93. Comprobamos que existe reutilización de credenciales y logramos acceso como root dentro del contenedor:
![[Pasted image 20240802115251.png]]

Salto al Host Real
En el directorio de root del contenedor, encontramos una clave SSH perteneciente al usuario admin. Verificamos que el puerto 22 está abierto en el host real y logramos conectar:
![[Pasted image 20240802120935.png]]
![[Pasted image 20240802121926.png]]

4. Escalada de Privilegios Final: Docker Group Abusing
Una vez en la máquina real como el usuario admin, observamos que este pertenece al grupo docker.

![[Pasted image 20240802122228.png]]

Este privilegio permite una escalada inmediata. Ejecutamos un nuevo contenedor montando el sistema de archivos raíz (/) del host en un volumen interno del contenedor. Esto nos permite manipular archivos del host con permisos de root.

Levantamos el contenedor montando la raíz:
![[Pasted image 20240802123638.png]]

Desde el contenedor, asignamos el permiso SUID al binario de /bin/bash del host:
![[Pasted image 20240802124208.png]]

Volvemos a la shell del host y ejecutamos bash -p:

![[Pasted image 20240802124512.png]]

¡Acceso total como root en la máquina host conseguido!

Máquina Infovore completada. 🚀