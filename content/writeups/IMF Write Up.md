--- 
title: "IMF"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#linux

-------------------
IMF es una máquina de dificultad media que simula un entorno de inteligencia. La resolución requiere un dominio sólido de diversas disciplinas: análisis de código fuente, manipulación de tipos en PHP, explotación manual de SQLi, evasión de restricciones de subida de archivos (WAF) y, finalmente, explotación de un binario mediante técnicas de corrupción de memoria.

1. Reconocimiento y Enumeración
Iniciamos con un escaneo de puertos para identificar servicios activos:

![[Pasted image 20240326101738.png]]

Solo el puerto 80 (HTTP) está abierto. Realizamos una inspección con whatweb para identificar tecnologías:

![[Pasted image 20240326101939.png]]

Análisis del Código Fuente (Flag 1 y 2)
Al no encontrar rutas mediante fuerza bruta (dirsearch), inspeccionamos el código fuente de la página principal. Localizamos tres archivos JavaScript con nombres sospechosos en Base64. Al concatenarlos y decodificarlos, obtenemos la Flag 2 y una nueva ruta:

![[Pasted image 20240326102706.png]]
![[Pasted image 20240326102825.png]]

2. Explotación Web: Type Juggling y SQLi
Accedemos a la nueva ruta y encontramos un panel de login.

Bypass de Login (PHP Type Juggling) - Flag 3
Identificamos usuarios válidos en la sección de contactos. Al interceptar la petición de login, explotamos una vulnerabilidad de Type Juggling en PHP cambiando el parámetro password a un array []. Esto causa que una comparación débil devuelva true, otorgándonos la Flag 3 y acceso al panel.

![[Pasted image 20240326103446.png]]
![[Pasted image 20240326103802.png]]

SQL Injection Booleana
Dentro del panel, el parámetro display es vulnerable a SQLi. Confirmamos que es de tipo booleana (la respuesta cambia según si la consulta es verdadera o falsa).

![[Pasted image 20240326105611.png]]

Desarrollamos un script en Python para automatizar la extracción de datos carácter por carácter:

![[Pasted image 20240326112215.png]]

Extrayendo datos de la tabla pages, localizamos una entrada oculta llamada tutorials-incomplete que contiene un Código QR. Al decodificarlo, obtenemos la Flag 4 y una nueva ruta de subida de archivos.

3. Intrusión: Evasión de WAF y Reverse Shell
En el panel de subida, intentamos subir una shell en PHP, pero un WAF bloquea extensiones y funciones peligrosas como system().

Evasión del WAF
Logramos el bypass realizando las siguientes acciones:

Cambiamos la extensión a .gif.

Añadimos el "Magic Number" de GIF: GIF8;.

Ofuscamos la función system utilizando su representación hexadecimal.

![[Pasted image 20240326203338.png]]

Ejecutamos el archivo desde /uploads/ y establecemos una reverse shell.

4. Escalada de Privilegios: Explotación de Binario (BoF)
En el sistema, encontramos un binario llamado agent que corre como root en el puerto local 7788.

Análisis con Ghidra
Tras transferir el binario a nuestra máquina local, utilizamos Ghidra para realizar ingeniería inversa. Identificamos:

Un código de acceso estático (comparación de local28).

Una vulnerabilidad de Buffer Overflow en la opción 3 (Reporte) debido al uso de la función insegura gets().

![[Pasted image 20240327130105.png]]
![[Pasted image 20240327131118.png]]

Explotación: Técnica ret2reg (EAX)
Confirmamos el control del registro EIP con un patrón de 200 bytes (Offset: 168). Debido a que el ASLR está activo, no podemos usar direcciones fijas de la pila. Sin embargo, observamos que el registro EAX apunta directamente al inicio de nuestro buffer.

Buscamos una instrucción call eax (u jmp eax) en una dirección estática del binario mediante objdump.

Creamos un exploit que:

Inyecta un shellcode de msfvenom al principio del buffer.

Rellena hasta el offset 168.

Sobrescribe EIP con la dirección de call eax.

![[Pasted image 20240327150740.png]]

Ejecución del Exploit Final
Desplegamos el exploit en Python para automatizar la conexión al puerto 7788, el envío de la clave y la inyección del payload:

![[Pasted image 20240327152936.png]]

Al ejecutarlo, recibimos una shell con privilegios de root.

![[Pasted image 20240327154322.png]]

Máquina IMF completada. 🚀