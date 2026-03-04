# Carpeta public – archivos estáticos

Todo lo que pongas aquí se sirve en la **raíz** del sitio al hacer build.

- **`public/cards/`** – Imágenes de tarjetas (las que subas aquí se ven en **/cards/nombre.jpg**).
  - Ejemplo: `public/cards/mi-tarjeta.jpg` → en la app usa la URL **/cards/mi-tarjeta.jpg** (o `https://www.tarjetas.shop/cards/mi-tarjeta.jpg` en producción).

Las imágenes que se suben al crear una tarjeta desde la app van al servidor (**/api/images/**) y no a esta carpeta. Esta carpeta es para imágenes estáticas que quieras tener en el propio front (por ejemplo fotos de cards ya hechas que quieras servir desde el mismo dominio).
