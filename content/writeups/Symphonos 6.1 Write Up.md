--- 
title: "Symphonos6.1"
platform: "Vulnhub" 
date: "2026-02-27" 
difficulty: "Hard" 
os: "linux" 
description: "Resolución de la máquina Analysis de Vulhub." 
---
#linux 

------------------------------------
Excelente trabajo documentando la resolución de la máquina Symphonos 6.1. Has cubierto una cadena de explotación muy completa: desde la enumeración web inicial hasta el movimiento lateral mediante el abuso de repositorios internos y la escalada de privilegios final.

A continuación, presento el Write-up estructurado y profesional para tu portfolio, optimizando la narrativa técnica y resaltando los puntos clave del compromiso.

Write-up: Symphonos 6.1 (Vulnhub)
Symphonos 6.1 es una máquina de dificultad media que pone a prueba habilidades en la explotación de vulnerabilidades web modernas (XSS a CSRF), análisis de código fuente en repositorios internos (Gitea), manipulación de APIs (JWT y métodos HTTP) y escalada de privilegios mediante el abuso de binarios de desarrollo (Go).

1. Enumeración y Reconocimiento Inicial
Comenzamos con un escaneo de puertos para identificar la superficie de ataque disponible:

![[Pasted image 20240507232052.png]]

Identificamos dos puertos principales:

Puerto 80 (HTTP): Servidor web principal.

Puerto 3000 (Gitea): Un servicio de gestión de repositorios basado en Git.

Tras realizar un fuzzing exhaustivo de directorios en el puerto 80, localizamos recursos críticos que no eran visibles a simple vista:

![[Pasted image 20240508000937.png]]
![[Pasted image 20240508001502.png]]

2. Explotación Web: De XSS a Secuestro de Administrador
Al analizar la aplicación web, identificamos una vulnerabilidad de XSS (Cross-Site Scripting) en el campo realname del perfil de usuario. Debido a que el administrador del sitio revisa periódicamente los reportes de bugs, podemos encadenar este XSS con un ataque de CSRF (Cross-Site Request Forgery).

Cadena de Ataque:
Inyección: Insertamos un payload de script en nuestro realname evadiendo filtros mediante el uso de caracteres de cierre de etiquetas (">).

Carga Útil: Creamos un archivo malicioso pwned.js que contiene una petición para crear un nuevo usuario con privilegios administrativos.

Ejecución: Al publicar un comentario en el reporte de bugs, el administrador ejecuta nuestro script al visualizarlo, creando silenciosamente el usuario hacker:12345678.

![[Pasted image 20240520202129.png]]
![[Pasted image 20240520195106.png]]

Tras el ataque, logramos autenticarnos como administradores y descubrimos una tarea pendiente que contiene las credenciales para el servicio Gitea (Puerto 3000).

3. Movimiento Lateral: Análisis de API y JWT
Con acceso a Gitea, realizamos una auditoría del código fuente del repositorio. Identificamos una API escrita en Go corriendo internamente en el puerto 5000.

![[Pasted image 20240527191152.png]]

Explotación de la API:
Autenticación: Obtenemos un token JWT (JSON Web Token) válido realizando una petición POST al endpoint de login con las credenciales de achilles.

Manipulación de Posts: Descubrimos que el endpoint /posts permite el método PATCH. Usando el token JWT, podemos actualizar el contenido de los posts en la web principal.

RCE mediante PHP: Inyectamos código PHP en un post. Para evitar problemas con caracteres especiales en la shell, utilizamos filtros como base64_decode y file_put_contents para escribir un script malicioso en el servidor.

![[Pasted image 20240528212811.png]]

Finalmente, ejecutamos el script y obtenemos una Reverse Shell:

![[Pasted image 20240528213242.png]]

4. Escalada de Privilegios
Una vez dentro del sistema, estabilizamos la TTY y pivotamos al usuario achilles. Al revisar los privilegios de sudo, encontramos una configuración que permite ejecutar el binario de Go como root sin contraseña.

![[Pasted image 20240528220457.png]]

Abuso de Go (Sudoer)
Aprovechamos la capacidad de Go para ejecutar comandos de sistema. Creamos un script simple en Go que asigna el bit SUID al binario de /bin/bash.

Go
`package main
import "os/exec"
func main() {
    exec.Command("/bin/chmod", "u+s", "/bin/bash").Run()
}`

Ejecutamos el código con sudo go run exploit.go. Al finalizar, simplemente invocamos bash -p para obtener una shell con privilegios de root.

![[Pasted image 20240528225103.png]]
![[Pasted image 20240528220457.png]]

Máquina Symphonos 6.1 comprometida. 🚀
