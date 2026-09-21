# Configuracion de correo para recuperar contrasena

El endpoint `POST /api/auth/forgot-password` envia un correo HTML real mediante SMTP.

1. Copia las variables de `backend/.env.example` a `backend/.env`.
2. Usa una cuenta del proveedor SMTP que elijas.
3. En Gmail, activa la verificacion en dos pasos y crea una contrasena de aplicacion. Usa esa contrasena en `SMTP_PASSWORD`, no la contrasena normal.
4. Reinicia Uvicorn despues de modificar `.env`.

Ejemplo Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_SSL=false
SMTP_USER=tu-cuenta@gmail.com
SMTP_PASSWORD=contrasena-de-aplicacion
FRONTEND_URL=http://localhost:5173
```

El correo incluye un boton para cambiar la contrasena, un enlace valido por 30 minutos y un token de un solo uso. Si SMTP no esta configurado, la API devuelve `503` y no crea un token inutilizable.
