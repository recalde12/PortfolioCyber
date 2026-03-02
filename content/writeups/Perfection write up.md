--- 
title: "Perfection" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Easy" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#easy #linux #STTI

------------
Perfection es una máquina Linux de dificultad fácil que pone a prueba la capacidad de identificar filtros de entrada incompletos. La intrusión se logra mediante una Inyección de Plantillas en el Lado del Servidor (SSTI) en el motor Ruby, evadiendo una lista negra mediante caracteres de nueva línea. La escalada de privilegios implica el análisis de bases de datos locales y un ataque de fuerza bruta basado en reglas específicas.

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar los servicios activos:

![[Pasted image 20240304005141.png]]

Identificamos un servidor web en el puerto 80. Analizamos las tecnologías subyacentes con whatweb:

![[Pasted image 20240304012510.png]]

Exploramos la aplicación web, la cual presenta una funcionalidad para calcular promedios de parámetros ingresados por el usuario. Al intentar inyectar etiquetas HTML básicas, el sistema responde con un mensaje de "malicious input blocked", confirmando la presencia de un filtro de seguridad.

![[Pasted image 20240304021225.png]]

2. Explotación Web: Evasión de Filtro y SSTI
Fuzzing de Caracteres Especiales
Utilizamos el Intruder de Burp Suite con diccionarios de Seclists para identificar qué caracteres logran evadir el filtro. Descubrimos que el carácter de nueva línea (%0A) es aceptado y permite que el sistema procese contenido adicional después del input legítimo.

![[Pasted image 20240304135845.png]]
![[Pasted image 20240304145238.png]]

Inyección de Plantillas (SSTI) a RCE
Al confirmar que la web utiliza Ruby, probamos un payload de SSTI para el motor ERB. Al concatenar %0A seguido de una expresión matemática como <%= 7*7 %>, el servidor devuelve el resultado, confirmando la vulnerabilidad.

Para obtener una Reverse Shell, debemos evadir posibles restricciones de caracteres en el comando. Generamos el payload en Bash, lo codificamos en Base64 y lo inyectamos utilizando la función de decodificación de Ruby para asegurar una ejecución limpia:

![[Pasted image 20240304161159.png]]
![[Pasted image 20240304161740.png]]

Inyectamos el payload final urlencodeado y recibimos la conexión en nuestro listener:
![[Pasted image 20240304162213.png]]

3. Post-Explotación y Análisis de Datos
Tras estabilizar la shell, enumeramos el sistema y localizamos una base de datos SQLite llamada pupilpath_credentials.db. Al consultarla, extraemos el hash de la contraseña de la usuaria Susan.

![[Pasted image 20240304163632.png]]

Análisis de Patrones y Craqueo
Encontramos un correo electrónico en /var/mail/susan que describe el formato de las contraseñas del sistema: una combinación de nombre, nombre invertido y una secuencia numérica de 9 dígitos.

![[Pasted image 20240304163430.png]]

Utilizamos Hashcat con una máscara personalizada (?d?d?d?d?d?d?d?d?d) para realizar un ataque de fuerza bruta sobre el hash, respetando el patrón susan_nasus_XXXXXXXXX:

![[Pasted image 20240304171101.png]]

La contraseña obtenida es: susan_nasus_413759210.

4. Escalada de Privilegios
Con las credenciales de Susan, validamos sus privilegios de sudo. Observamos que tiene permisos para ejecutar cualquier comando como root.

![[Pasted image 20240304171336.png]]

Simplemente ejecutamos sudo su o invocamos una shell privilegiada para obtener el control total del sistema y capturar la flag final.

![[Pasted image 20240304171444.png]]
![[Pasted image 20240304171012.png]]

Máquina Perfection comprometida. 🚀