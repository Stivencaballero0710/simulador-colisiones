# Comandos Estudio Git/Github y cmd
# Guía de Comandos de Terminal, Git y GitHub

Esta guía contiene los principales comandos utilizados para trabajar con la terminal de VS Code, Git y repositorios de GitHub.

---

# 1. Comandos Básicos de Terminal

Estos comandos permiten navegar entre carpetas y archivos desde PowerShell o la terminal de Visual Studio Code.

## Ver la ubicación actual

```powershell
Get-Location
```

Muestra la ruta en la que estamos actualmente.

Ejemplo:

```text
C:\Users\andre\Proyecto-veterinaria-G1-2026-2
```

---

## Ver archivos y carpetas

```powershell
dir
```

Muestra los archivos y carpetas existentes en la ubicación actual.

---

## Entrar a una carpeta

```powershell
cd nombre-carpeta
```

Ejemplo:

```powershell
cd Proyecto-veterinaria-G1-2026-2
```

---

## Salir de una carpeta

```powershell
cd ..
```

Sube un nivel en la estructura de carpetas.

Ejemplo:

```text
C:\Users\andre\Proyecto-veterinaria-G1-2026-2
```

Ejecutamos:

```powershell
cd ..
```

Y quedamos en:

```text
C:\Users\andre
```

---

## Subir dos niveles

```powershell
cd ../..
```

---

## Ir directamente a una ruta

```powershell
cd C:\Users\andre\Documents
```

---

## Crear una carpeta

```powershell
mkdir nombre-carpeta
```

Ejemplo:

```powershell
mkdir imagenes
```

---

## Crear un archivo vacío

```powershell
New-Item archivo.txt -ItemType File
```

Ejemplo:

```powershell
New-Item README.md -ItemType File
```

---

## Eliminar un archivo

```powershell
Remove-Item archivo.txt
```

---

## Eliminar una carpeta

```powershell
Remove-Item nombre-carpeta -Recurse
```

> **Precaución:** este comando elimina la carpeta y su contenido.

---

## Limpiar la terminal

```powershell
cls
```

---

## Abrir la carpeta actual en Visual Studio Code

```powershell
code .
```

---

## Cerrar la terminal

```powershell
exit
```

---

# 2. Comprobar la Instalación de Git

## Ver la versión instalada

```bash
git --version
```

Ejemplo de resultado:

```text
git version 2.50.0.windows.1
```

---

# 3. Configuración Inicial de Git

Estos comandos normalmente se configuran una sola vez en el computador.

## Configurar nombre

```bash
git config --global user.name "Tu Nombre"
```

Ejemplo:

```bash
git config --global user.name "Stiven Caballero"
```

---

## Configurar correo

```bash
git config --global user.email "correo@ejemplo.com"
```

---

## Ver configuración

```bash
git config --list
```

---

# 4. Crear un Repositorio Git

## Crear una carpeta para el proyecto

```powershell
mkdir Proyecto-nuevo
```

Entrar a ella:

```powershell
cd Proyecto-nuevo
```

---

## Inicializar Git

```bash
git init
```

Convierte la carpeta actual en un repositorio Git.

---

## Cambiar la rama principal a `main`

```bash
git branch -M main
```

---

# 5. Clonar un Repositorio de GitHub

Cuando el proyecto ya existe en GitHub se utiliza:

```bash
git clone URL
```

Ejemplo:

```bash
git clone https://github.com/usuario/proyecto.git
```

Después entramos al proyecto:

```powershell
cd proyecto
```

Y podemos abrirlo en VS Code:

```powershell
code .
```

> Si utilizamos `git clone`, no necesitamos ejecutar `git init`.

---

# 6. Ver el Estado del Repositorio

```bash
git status
```

Este es uno de los comandos más importantes.

Permite saber:

- En qué rama estamos.
- Qué archivos fueron modificados.
- Qué archivos son nuevos.
- Qué archivos están preparados para un commit.
- Si existen conflictos.
- Si estamos en medio de un `merge`.

---

# 7. Preparar Cambios

Antes de crear un commit debemos agregar los archivos al área de preparación.

## Agregar todos los archivos modificados

```bash
git add .
```

---

## Agregar solamente un archivo

```bash
git add nombre-archivo
```

Ejemplo:

```bash
git add README.md
```

Otro ejemplo:

```bash
git add Actividad_de_exploracion.md
```

---

# 8. Crear un Commit

```bash
git commit -m "Descripción del cambio"
```

Ejemplo:

```bash
git commit -m "Actualizar actividad de exploración"
```

El flujo básico es:

```text
Modificar archivos
      ↓
git add .
      ↓
git commit
      ↓
Cambios guardados en el historial
```

---

# 9. Subir Cambios a GitHub

```bash
git push
```

Envía los commits de nuestro computador al repositorio remoto de GitHub.

```text
Computador
    ↓
 git push
    ↓
  GitHub
```

---

# 10. Subir una Rama por Primera Vez

Si Git muestra:

```text
The current branch has no upstream branch
```

debemos ejecutar:

```bash
git push -u origin nombre-rama
```

Ejemplo:

```bash
git push -u origin caballero
```

Esto conecta:

```text
caballero local
       ↕
origin/caballero
```

Después podemos utilizar simplemente:

```bash
git push
```

---

# 11. Ver las Ramas

## Ver ramas locales

```bash
git branch
```

Ejemplo:

```text
* caballero
  main
```

El símbolo `*` indica la rama actual.

---

## Ver ramas locales y remotas

```bash
git branch -a
```

---

## Ver información detallada de las ramas

```bash
git branch -vv
```

Permite ver con qué rama remota está conectada cada rama local.

---

# 12. Crear una Rama

```bash
git switch -c nombre-rama
```

Ejemplo:

```bash
git switch -c caballero
```

Este comando:

1. Crea la rama.
2. Nos cambia automáticamente a ella.

---

# 13. Cambiar de Rama

```bash
git switch nombre-rama
```

Ejemplo:

```bash
git switch main
```

Para regresar:

```bash
git switch caballero
```

---

# 14. Eliminar una Rama Local

```bash
git branch -d nombre-rama
```

Ejemplo:

```bash
git branch -d caballero
```

Se recomienda eliminar una rama únicamente cuando sus cambios ya se hayan integrado correctamente.

---

# 15. Ver el Repositorio Remoto

```bash
git remote -v
```

Ejemplo:

```text
origin  https://github.com/usuario/proyecto.git (fetch)
origin  https://github.com/usuario/proyecto.git (push)
```

`origin` es normalmente el nombre utilizado para representar el repositorio de GitHub.

---

# 16. Conectar un Proyecto Local con GitHub

Después de crear un repositorio vacío en GitHub:

```bash
git remote add origin URL
```

Ejemplo:

```bash
git remote add origin https://github.com/usuario/proyecto.git
```

Comprobamos la conexión:

```bash
git remote -v
```

---

# 17. Primera Subida de `main` a GitHub

```bash
git push -u origin main
```

Después podemos utilizar:

```bash
git push
```

---

# 18. Descargar Información de GitHub sin Mezclar Cambios

```bash
git fetch
```

Descarga la información más reciente del repositorio remoto, pero no modifica automáticamente nuestros archivos.

Es útil para revisar qué ha cambiado antes de integrar cambios.

---

# 19. Traer Cambios desde GitHub

```bash
git pull
```

Descarga e integra los cambios de la rama remota asociada.

Para traer específicamente `main`:

```bash
git pull origin main
```

Podemos recordar:

```text
PULL = GitHub → Computador
PUSH = Computador → GitHub
```

---

# 20. Combinar Ramas

```bash
git merge nombre-rama
```

El comando incorpora la rama indicada dentro de la rama en la que estamos actualmente.

Ejemplo:

```bash
git switch main
git merge caballero
```

Significa:

```text
caballero
     ↓
    main
```

Los cambios de `caballero` se incorporan a `main`.

---

# 21. Actualizar Nuestra Rama con `main`

Si estamos trabajando en `caballero` y otros integrantes actualizaron `main`:

Primero actualizamos `main`:

```bash
git switch main
```

```bash
git pull origin main
```

Regresamos a nuestra rama:

```bash
git switch caballero
```

Y traemos los cambios de `main`:

```bash
git merge main
```

Resultado:

```text
main actualizado
      ↓
git merge main
      ↓
caballero actualizado
```

---

# 22. Cancelar un Merge

Si estamos realizando un `merge` y queremos cancelarlo:

```bash
git merge --abort
```

Git intentará regresar al estado anterior al inicio del `merge`.

---

# 23. Ver el Historial de Commits

## Historial completo

```bash
git log
```

---

## Historial resumido

```bash
git log --oneline
```

Ejemplo:

```text
2c25b8c Actualizar README
9a3703b Agregar imagen
9467392 Inicializar proyecto
```

---

## Ver los últimos tres commits

```bash
git log -3 --oneline
```

---

## Ver los últimos cinco commits

```bash
git log -5 --oneline
```

---

# 24. Ver la Información de un Commit

```bash
git show ID
```

Ejemplo:

```bash
git show 2c25b8c
```

Permite ver qué archivos y líneas fueron modificados por ese commit.

---

# 25. Ver Cambios Realizados

```bash
git diff
```

Muestra los cambios realizados que todavía no han sido preparados con `git add`.

---

## Ver cambios de un archivo específico

```bash
git diff -- nombre-archivo
```

Ejemplo:

```bash
git diff -- README.md
```

---

# 26. Ver los Cambios Preparados para Commit

Después de ejecutar:

```bash
git add .
```

podemos revisar qué será incluido en el commit:

```bash
git diff --staged
```

---

# 27. Deshacer un `git add`

Si agregamos un archivo por error:

```bash
git restore --staged nombre-archivo
```

Ejemplo:

```bash
git restore --staged vet1.png
```

Para quitar todos los archivos del área de preparación:

```bash
git restore --staged .
```

Esto no elimina los archivos ni sus modificaciones.

---

# 28. Descartar Cambios Locales

```bash
git restore nombre-archivo
```

Ejemplo:

```bash
git restore README.md
```

> **Precaución:** elimina las modificaciones locales del archivo que todavía no hayan sido guardadas en un commit.

---

# 29. Eliminar un Archivo con Git

```bash
git rm nombre-archivo
```

Ejemplo:

```bash
git rm README.md
```

Después:

```bash
git commit -m "Eliminar README"
```

Y:

```bash
git push
```

---

# 30. Dejar de Rastrear un Archivo sin Eliminarlo

```bash
git rm --cached nombre-archivo
```

Ejemplo:

```bash
git rm --cached configuracion.txt
```

El archivo continúa en nuestro computador, pero Git deja de rastrearlo.

---

# 31. Mover o Renombrar un Archivo

```bash
git mv archivo-viejo archivo-nuevo
```

Ejemplo:

```bash
git mv actividad.md Actividad_de_exploracion.md
```

Después realizamos el commit:

```bash
git commit -m "Renombrar archivo de actividad"
```

---

# 32. Carpetas Vacías en Git

Git no almacena carpetas vacías.

Para conservar una carpeta vacía podemos crear dentro un archivo `.gitkeep`.

Ejemplo:

```powershell
New-Item imagenes\.gitkeep -ItemType File
```

Después:

```bash
git add .
```

```bash
git commit -m "Crear estructura de carpetas"
```

---

# 33. Flujo Básico de Trabajo

Después de modificar archivos:

```bash
git status
```

```bash
git add .
```

```bash
git diff --staged
```

```bash
git commit -m "Descripción del cambio"
```

```bash
git push
```

Flujo:

```text
Modificar
   ↓
git status
   ↓
git add .
   ↓
git commit
   ↓
git push
   ↓
GitHub
```

---

# 34. Flujo de Trabajo con Ramas

Primero actualizamos `main`:

```bash
git switch main
```

```bash
git pull origin main
```

Creamos nuestra rama:

```bash
git switch -c nombre-rama
```

Trabajamos y guardamos nuestros cambios:

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "Descripción del cambio"
```

Primera subida de la rama:

```bash
git push -u origin nombre-rama
```

Después podemos utilizar:

```bash
git push
```

---

# 35. Pull Request en GitHub

Un **Pull Request** no es lo mismo que `git pull`.

`git pull`:

```text
GitHub → Computador
```

Un Pull Request:

```text
rama-personal
      ↓
Pull Request
      ↓
    main
```

Primero debemos subir nuestra rama:

```bash
git add .
```

```bash
git commit -m "Finalizar actividad"
```

```bash
git push
```

Después, desde GitHub seleccionamos:

```text
Compare & pull request
```

Comprobamos:

```text
base: main
compare: nuestra-rama
```

Luego seleccionamos:

```text
Create pull request
```

Cuando sea aprobado:

```text
Merge pull request
```

---

# 36. Después de Aceptar un Pull Request

Actualizamos nuestro `main` local:

```bash
git switch main
```

```bash
git pull origin main
```

Después podemos actualizar nuestra rama:

```bash
git switch caballero
```

```bash
git merge main
```

---

# 37. Crear un Proyecto Nuevo y Subirlo a GitHub

## Crear carpeta

```powershell
mkdir Proyecto-nuevo
```

## Entrar

```powershell
cd Proyecto-nuevo
```

## Abrir en VS Code

```powershell
code .
```

## Inicializar Git

```bash
git init
```

## Crear archivos y preparar cambios

```bash
git add .
```

## Crear primer commit

```bash
git commit -m "Inicializar proyecto"
```

## Establecer `main`

```bash
git branch -M main
```

## Conectar con GitHub

```bash
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
```

## Subir por primera vez

```bash
git push -u origin main
```

---

# 38. Cambiar de un Repositorio a Otro

Supongamos que tenemos:

```text
C:\Users\andre
├── Proyecto-veterinaria
└── Proyecto-programacion
```

Estamos en:

```text
C:\Users\andre\Proyecto-veterinaria
```

Salimos:

```powershell
cd ..
```

Entramos al otro:

```powershell
cd Proyecto-programacion
```

Comprobamos:

```bash
git status
```

---

# 39. Comandos de Terminal que Debemos Memorizar

```powershell
Get-Location
```

Ver dónde estamos.

```powershell
dir
```

Ver archivos y carpetas.

```powershell
cd carpeta
```

Entrar a una carpeta.

```powershell
cd ..
```

Salir de una carpeta.

```powershell
mkdir carpeta
```

Crear una carpeta.

```powershell
code .
```

Abrir el proyecto en VS Code.

```powershell
cls
```

Limpiar terminal.

```powershell
exit
```

Cerrar terminal.

---

# 40. Comandos de Git que Debemos Memorizar

```bash
git status
```

Ver el estado del repositorio.

```bash
git branch
```

Ver las ramas.

```bash
git switch rama
```

Cambiar de rama.

```bash
git switch -c rama
```

Crear una rama y entrar en ella.

```bash
git add .
```

Preparar todos los cambios.

```bash
git commit -m "mensaje"
```

Crear un commit.

```bash
git push
```

Subir cambios a GitHub.

```bash
git push -u origin rama
```

Subir una rama por primera vez.

```bash
git pull
```

Traer cambios desde GitHub.

```bash
git pull origin main
```

Actualizar `main`.

```bash
git fetch
```

Consultar cambios remotos sin integrarlos.

```bash
git merge rama
```

Combinar ramas.

```bash
git merge --abort
```

Cancelar un merge.

```bash
git log --oneline
```

Ver historial de commits.

```bash
git diff
```

Ver modificaciones.

```bash
git remote -v
```

Ver el repositorio remoto.

```bash
git clone URL
```

Clonar un proyecto existente.

```bash
git init
```

Crear un repositorio Git.

---

# 41. Rutina Recomendada para Trabajar en Equipo

Al comenzar a trabajar:

```bash
git status
```

```bash
git switch main
```

```bash
git pull origin main
```

Cambiar a nuestra rama:

```bash
git switch caballero
```

Actualizarla con `main`:

```bash
git merge main
```

Trabajamos en nuestros archivos.

Después:

```bash
git status
```

```bash
git add .
```

```bash
git diff --staged
```

```bash
git commit -m "Descripción del cambio"
```

```bash
git push
```

Finalmente hacemos un Pull Request:

```text
caballero
    ↓
Pull Request
    ↓
main
```

---

# 42. Regla Importante

Antes de ejecutar operaciones como:

```bash
git commit
git pull
git merge
git switch
git push
```

es recomendable ejecutar primero:

```bash
git status
```

Esto permite conocer el estado actual del repositorio y evita muchos errores.
