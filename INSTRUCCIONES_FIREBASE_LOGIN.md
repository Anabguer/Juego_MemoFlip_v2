# Alta rápida – Login con Google (Firebase)

**Package (applicationId):** `com.intocables.memoflip`

## Huellas detectadas
- **SHA-1 debug:** `E1:5A:A4:8C:0F:93:56:42:18:6E:A0:67:BF:17:45:48:4D:7B:1F:AD` (TEMPORALES)
- **SHA-256 debug:** `1D:A4:C8:90:B2:47:E9:E1:91:3A:93:B3:60:23:EC:49:59:0C:19:FC:71:76:B6:BD:BF:3F:D3:2C:4B:75:C7:7E` (TEMPORALES)

## Paso 1 – Firebase
1) Firebase Console → Configuración del proyecto → Tus apps → Android → registrar `com.intocables.memoflip`.
2) Añadir la huella disponible:
   - Usar **SHA-1 debug** (temporal): `E1:5A:A4:8C:0F:93:56:42:18:6E:A0:67:BF:17:45:48:4D:7B:1F:AD`
3) Descargar `google-services.json` y colocarlo en `android/app/google-services.json`.

## Paso 2 – Google Cloud
- La credencial OAuth Android aparece en el proyecto vinculado a Firebase.
- Verificar en Cloud → APIs & Services → Credentials.

## Paso 3 – Play App Signing (cuando subas el primer AAB)
- Copiar el **SHA-1 de App signing key** desde Play Console → Integridad de la app.
- Añadirlo también en Firebase (Huellas SHA) y **descargar de nuevo** `google-services.json`.

## Notas
- Si hoy usamos DEBUG, crear luego el keystore de release y reemplazar la huella en Firebase.
- Errores típicos: json equivocado, applicationId distinto, falta plugin google-services.