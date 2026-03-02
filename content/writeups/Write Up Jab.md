--- 
title: "Jab" 
platform: "Hackthebox"
date: "2026-02-27" 
difficulty: "Medium" 
os: "linux" 
description: "Resolución de la máquina Analysis de HackTheBox." 
---
#windows #Medium 

----------
Jab es una máquina que pone a prueba la capacidad de enumerar protocolos menos comunes como XMPP. La intrusión se logra mediante un ataque de AS-REP Roasting, seguido de movimiento lateral a través de la inspección de chats internos. La escalada final se realiza mediante el abuso de una consola de administración mal configurada y la subida de un plugin malicioso (RCE).

1. Fase de Reconocimiento y Enumeración
Iniciamos con un escaneo exhaustivo de puertos para identificar los servicios activos:

![[Pasted image 20240226112955.png]]
![[Pasted image 20240226113131.png]]

Identificamos un servidor XMPP (Openfire). Este protocolo se utiliza para mensajería instantánea. Para interactuar con el servidor, configuramos un cliente como Pidgin, lo que nos permite conectarnos al dominio jab.htb y registrar una cuenta de usuario básica.

![[Pasted image 20240226113421.png]]
![[Pasted image 20240226125937.png]]

Una vez conectados, logramos listar todos los usuarios registrados en el servidor, lo cual nos proporciona una lista de objetivos potenciales para ataques de Directorio Activo.

![[Pasted image 20240226130049.png]]

2. Explotación: AS-REP Roasting y Movimiento Lateral
Con la lista de usuarios obtenida, procedemos a realizar un ataque de AS-REP Roasting utilizando la herramienta GetNPUsers.py de la suite Impacket. Este ataque busca usuarios que no requieren pre-autenticación Kerberos para obtener sus hashes de contraseña.

![[Pasted image 20240226140229.png]]
![[Pasted image 20240226140312.png]]

Logramos obtener el hash del usuario jmontgomery y lo crackeamos exitosamente con John the Ripper.

![[Pasted image 20240226144119.png]]

Acceso a Salas de Chat
Al loguearnos en Pidgin con las nuevas credenciales, accedemos a la sala de chat pentest2023, donde encontramos credenciales de texto plano para el usuario de servicio svc_openfire.

![[Pasted image 20240226161336.png]]
![[Pasted image 20240226161419.png]]

3. Intrusión: Shell mediante Impacket
Utilizamos las credenciales de svc_openfire para ejecutar comandos en el sistema mediante psexec.py o wmiexec.py. Para obtener una shell interactiva más estable, cargamos un script de PowerShell (Nishang) configurando un servidor HTTP local y ejecutando una reverse shell hacia nuestra máquina atacante.

![[Pasted image 20240226203206.png]]
![[Pasted image 20240226203406.png]]
![[Pasted image 20240226203605.png]]

4. Escalada de Privilegios: Openfire Admin Console (RCE)
Con acceso al sistema, realizamos un Local Port Forwarding utilizando Chisel para traer el puerto interno 9090 (Consola de Administración de Openfire) a nuestra máquina local.

![[Pasted image 20240227171847.png]]
![[Pasted image 20240227171938.png]]

Explotación de Plugins (CVE-2023-32315)
Accedemos al panel con las credenciales de svc_openfire. Explotamos la capacidad de subir plugins personalizados para cargar un archivo .jar malicioso que nos permite la ejecución de comandos con privilegios de sistema.

![[Pasted image 20240227222313.png]]

Finalmente, ejecutamos un comando de reverse shell a través del plugin instalado y obtenemos acceso total como Administrator.

![[Pasted image 20240227224627.png]]
![[Pasted image 20240228161752.png]]

![[Pasted image 20240228161848.png]]

Máquina Jab comprometida. 🚀