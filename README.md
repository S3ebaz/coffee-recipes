# Coffee Recipes AI

Single Page Application para analizar empaques de café y recetas con Visión IA (GPT-4o), generar recetas optimizadas organolépticamente y publicarlas automáticamente en este repositorio.

## Características

- Subida drag-and-drop de fotos (empaque y método actual)
- Análisis con OpenAI GPT-4o Vision
- Ficha técnica y receta optimizada
- Publicación directa a GitHub vía Contents API (commits automáticos de `.md`)
- Despliegue automático a GitHub Pages vía GitHub Actions

## Configuración

1. Obtén un **GitHub Personal Access Token** con scope `repo`.
2. Obtén una **OpenAI API Key** con acceso a `gpt-4o`.
3. Abre la app y pega las claves en el panel de configuración (se guardan en `localStorage`).

## Publicar

Después de analizar, usa el botón **Publicar Receta en GitHub**. Cada receta se guarda en `recetas/receta-YYYY-MM-DDTHH-MM-SS.md`.

## Despliegue

El workflow `.github/workflows/deploy.yml` publica automáticamente en GitHub Pages al hacer push a `main`.

Sitio: https://s3ebaz.github.io/coffee-recipes/

## Setup inicial

Ejecuta el script `setup_and_push.sh` (Linux/Mac) o `setup_and_push.ps1` (Windows) para crear todos los archivos y hacer el push inicial.

---

*Desarrollado como Barista Master + Senior DevOps*
