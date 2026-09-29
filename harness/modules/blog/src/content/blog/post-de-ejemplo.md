---
title: "[CLIENTE] título del post de ejemplo"
slug: "post-de-ejemplo"
description: "[CLIENTE] descripción breve del post de ejemplo"
publishDate: 2026-09-28
modifiedDate: 2026-09-28
tags: []
image: "images/post-de-ejemplo.webp"
---

Este es un artículo de ejemplo que se instala junto con el módulo de blog. Su única función es demostrar que la colección de contenido, el listado de artículos y la página individual de cada post funcionan de extremo a extremo antes de que exista contenido real del negocio.

Cada artículo del blog es un archivo Markdown dentro de `src/content/blog/`. El encabezado del archivo define el título, la descripción, las fechas de publicación y de última modificación, las etiquetas y la imagen de portada. El campo `slug` determina la dirección pública del artículo, de modo que el nombre del archivo puede cambiar sin romper los enlaces ya publicados.

## Qué reemplazar antes de publicar

Antes de poner el sitio en línea, este archivo debe sustituirse por artículos escritos a partir del material aprobado por el cliente. Los textos marcados con `[CLIENTE]` indican información pendiente y el control de personalización del proyecto los señala hasta que se reemplacen. La imagen de portada que acompaña a este artículo también es genérica y debe cambiarse por una imagen propia del negocio.

Un buen artículo responde una pregunta concreta que los clientes del negocio suelen hacer, con un título claro, una descripción breve que resuma la respuesta y un desarrollo ordenado en secciones con subtítulos. Cuando el contenido real esté listo, basta con eliminar este archivo y su imagen, y añadir los nuevos artículos en la misma carpeta.
