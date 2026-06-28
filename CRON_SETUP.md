# Configuración de Google Cloud Scheduler

Para automatizar la recolección de noticias para la sección "Insights" con Inteligencia Artificial dos veces por semana, debes configurar Google Cloud Scheduler para que llame al endpoint que acabamos de crear (`/api/cron/publish-insight`) de tu aplicación.

## Pasos para la configuración

1. **Desplegar la Aplicación**: Asegúrate de que tu aplicación esté desplegada y tengas la URL pública de tu entorno de producción (por ejemplo, en Cloud Run: `https://tu-app-url.run.app`).

2. **Variable de Entorno**: Asegúrate de configurar la variable de entorno `CRON_SECRET` en tu servidor de producción con una contraseña segura.

3. **Crear el Job en Cloud Scheduler**:
   Puedes hacerlo fácilmente desde la interfaz web de Google Cloud o utilizando la línea de comandos `gcloud`.

### Opción A: Usando la Consola de Google Cloud

1. Ve a **Cloud Scheduler** en la consola de Google Cloud.
2. Haz clic en **CREAR TAREA** (Create Job).
3. **Nombre**: `publish-patagonia-insights`
4. **Frecuencia**: `0 0 * * 1,5` 
   *(Esta expresión Cron ejecutará la tarea todos los Lunes y Viernes a las 12:00 AM).*
5. **Zona horaria**: Selecciona tu zona horaria local (ej. `America/Argentina/Buenos_Aires`).
6. **Tipo de destino**: `HTTP`
7. **URL**: `https://tu-app-url.run.app/api/cron/publish-insight`
8. **Método HTTP**: `POST`
9. **Encabezados HTTP**:
   - Nombre: `Authorization`
   - Valor: `Bearer tu-secreto-aqui` *(Asegúrate de que coincida con tu `CRON_SECRET`)*.
10. Haz clic en **CREAR**.

### Opción B: Usando gcloud CLI

Si prefieres la terminal, puedes ejecutar este comando reemplazando los valores correspondientes:

```bash
gcloud scheduler jobs create http publish-patagonia-insights \
  --schedule="0 0 * * 1,5" \
  --time-zone="America/Argentina/Buenos_Aires" \
  --uri="https://tu-app-url.run.app/api/cron/publish-insight" \
  --http-method=POST \
  --headers="Authorization=Bearer tu-secreto-aqui"
```

## ¿Cómo funciona?

Una vez configurado, Cloud Scheduler hará un request `POST` silencioso a tu backend dos veces por semana. El backend:
1. Verificará que la cabecera `Authorization` sea correcta para evitar que visitantes al azar puedan activar la IA.
2. Le pedirá a Gemini que investigue en internet (usando la herramienta Google Search) una noticia relevante y actual sobre el entorno empresarial de la Patagonia.
3. Formateará la noticia como un adelanto llamativo e insertará el artículo directamente en tu base de datos de Firebase.
4. El nuevo contenido aparecerá automáticamente en tu sección "Insights" la próxima vez que un usuario ingrese a la app.
