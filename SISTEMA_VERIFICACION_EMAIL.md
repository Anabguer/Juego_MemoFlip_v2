# 📧 SISTEMA DE VERIFICACIÓN POR EMAIL - MEMOFLIP

## 📋 **DESCRIPCIÓN**

Sistema completo de verificación de cuentas por email con código de 6 dígitos que expira en 24 horas.

---

## 🗄️ **1. CAMBIOS EN LA BASE DE DATOS**

### **Archivo:** `PARA_HOSTALIA/agregar_verificacion_email.sql`

```sql
-- Agregar columnas a usuarios_aplicaciones
ALTER TABLE usuarios_aplicaciones 
ADD COLUMN email_verificado TINYINT(1) DEFAULT 0,
ADD COLUMN codigo_verificacion VARCHAR(10) DEFAULT NULL,
ADD COLUMN tiempo_verificacion TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN intentos_verificacion INT DEFAULT 0;
```

### **Ejecutar en Hostalia:**
1. Subir el archivo SQL a phpMyAdmin
2. Ejecutar el script
3. Verificar que las columnas se crearon correctamente

---

## 📧 **2. SISTEMA DE ENVÍO DE EMAILS**

### **Archivo:** `PARA_HOSTALIA/sistema_apps_api/memoflip/enviar_email.php`

**Funciones principales:**

#### `enviarEmailVerificacion($email, $nombre, $codigo)`
- Envía email HTML con el código de verificación
- Template bonito con gradientes y estilo MemoFlip
- Retorna `true` si el email se envió correctamente

#### `generarCodigoVerificacion()`
- Genera código aleatorio de 6 dígitos
- Formato: `123456`

#### `codigoEsValido($tiempo_verificacion, $horas_validez = 24)`
- Verifica si un código ha expirado
- Por defecto: 24 horas de validez

---

## 🔐 **3. API DE AUTENTICACIÓN ACTUALIZADA**

### **Archivo:** `api/memoflip-auth-verificacion.php`

### **Endpoints nuevos:**

#### `POST auth.php?action=register`
**Request:**
```json
{
  "action": "register",
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Pérez",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registro exitoso. Revisa tu email para el código de verificación.",
  "email_sent": true,
  "requires_verification": true,
  "user_key": "usuario@ejemplo.com_memoflip"
}
```

---

#### `POST auth.php?action=verify_code`
**Request:**
```json
{
  "action": "verify_code",
  "email": "usuario@ejemplo.com",
  "codigo": "123456"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "¡Cuenta verificada correctamente!",
  "verified": true,
  "user_key": "usuario@ejemplo.com_memoflip"
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "Código incorrecto"
}
```

---

#### `POST auth.php?action=resend_code`
**Request:**
```json
{
  "action": "resend_code",
  "email": "usuario@ejemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código reenviado a tu email",
  "email_sent": true
}
```

---

#### `POST auth.php?action=login`
**MODIFICADO:** Ahora verifica que el email esté verificado antes de permitir login.

**Response (no verificado):**
```json
{
  "success": false,
  "error": "Debes verificar tu email antes de iniciar sesión"
}
```

---

## 🎨 **4. COMPONENTES REACT**

### **Archivo:** `src/components/VerificationModal.tsx`

**Modal de verificación** con:
- Input de 6 dígitos numéricos
- Botón "Verificar código"
- Botón "Reenviar código"
- Contador de expiración (24h)
- Mensajes de error/éxito

**Props:**
```typescript
interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
}
```

---

### **Archivo:** `src/components/UserModal.tsx` (MODIFICADO)

**Cambios:**
- Detecta cuando el registro requiere verificación
- Muestra el `VerificationModal` automáticamente
- Maneja el flujo: Registro → Verificación → Login

---

## 🔄 **5. FLUJO COMPLETO**

### **Registro:**
```
1. Usuario llena formulario de registro
   ↓
2. Sistema genera código de 6 dígitos
   ↓
3. Se guarda en BD (usuario_aplicaciones)
   ↓
4. Se envía email con el código
   ↓
5. Usuario introduce el código en la app
   ↓
6. Sistema valida:
   - Código correcto ✅
   - No expirado (< 24h) ✅
   ↓
7. Cuenta activada → Puede hacer login
```

### **Login:**
```
1. Usuario introduce email + password
   ↓
2. Sistema verifica:
   - Credenciales correctas ✅
   - Email verificado ✅
   ↓
3. Si email NO verificado → Error
4. Si todo OK → Login exitoso
```

---

## 📊 **6. ESTADOS DE USUARIO**

| Estado | `activo` | `email_verificado` | ¿Puede login? |
|--------|----------|-------------------|---------------|
| **Recién registrado** | 0 | 0 | ❌ No |
| **Email verificado** | 1 | 1 | ✅ Sí |
| **Usuario antiguo** | 1 | 1 | ✅ Sí |

---

## 🧪 **7. TESTING**

### **Prueba en desarrollo:**

1. **Registro:**
   ```
   Email: test@ejemplo.com
   Nombre: Usuario Test
   Password: test123
   ```

2. **Verificar respuesta del servidor:**
   - Si `email_sent: false`, el código aparecerá en la respuesta
   - Si `email_sent: true`, revisar email (o spam)

3. **Introducir código:**
   - Código: `123456` (6 dígitos)
   - Verificar que cuenta se activa

4. **Intentar login:**
   - Antes de verificar → Error
   - Después de verificar → OK ✅

---

## 🚀 **8. DESPLIEGUE**

### **Pasos para activar en producción:**

1. **Ejecutar SQL en Hostalia:**
   ```bash
   # Subir agregar_verificacion_email.sql a phpMyAdmin
   # Ejecutar el script
   ```

2. **Subir archivos PHP:**
   ```
   PARA_HOSTALIA/sistema_apps_api/memoflip/
   ├── enviar_email.php (NUEVO)
   └── auth.php (reemplazar con auth-verificacion.php)
   ```

3. **Compilar y subir React:**
   ```bash
   npm run build
   # Subir carpeta out/ a Hostalia
   ```

4. **Verificar configuración de email:**
   - Servidor SMTP configurado en Hostalia
   - Email `noreply@colisan.com` debe existir
   - Verificar que emails NO vayan a spam

---

## ⚙️ **9. CONFIGURACIÓN AVANZADA**

### **Cambiar tiempo de expiración:**
```php
// En enviar_email.php, línea ~67
function codigoEsValido($tiempo_verificacion, $horas_validez = 24) {
    // Cambiar 24 por el número de horas deseado
}
```

### **Cambiar longitud del código:**
```php
// En enviar_email.php, línea ~58
function generarCodigoVerificacion() {
    return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    // Para 4 dígitos: rand(1000, 9999) y str_pad(..., 4, ...)
}
```

### **Personalizar email:**
Editar `enviar_email.php` línea 13-65 (HTML del email)

---

## 📧 **10. PLANTILLA DE EMAIL**

El email enviado incluye:
- ✅ Header con gradiente MemoFlip
- ✅ Código destacado en grande
- ✅ Instrucciones claras
- ✅ Advertencia de expiración
- ✅ Diseño responsive
- ✅ Mensaje de "no responder"

---

## 🔍 **11. TROUBLESHOOTING**

### **Email no se envía:**
- Verificar configuración SMTP en Hostalia
- Revisar logs: `error_log` en `enviar_email.php`
- Comprobar que el servidor permite `mail()`

### **Código no válido:**
- Verificar que no hayan pasado 24 horas
- Comprobar que el código es exactamente 6 dígitos
- Revisar campo `codigo_verificacion` en BD

### **Usuario no puede hacer login:**
- Verificar campo `email_verificado = 1`
- Verificar campo `activo = 1`
- Comprobar que la contraseña sea correcta

---

## 📝 **12. NOTAS IMPORTANTES**

⚠️ **Usuarios existentes:**
Los usuarios que ya estaban registrados se marcan automáticamente como `email_verificado = 1` al ejecutar el script SQL.

⚠️ **Seguridad:**
- Los códigos se guardan en texto plano (no es crítico, solo son válidos 24h)
- Se registran los intentos fallidos en `intentos_verificacion`
- Posible mejora: limitar intentos (ej: 5 intentos máximo)

⚠️ **Modo desarrollo:**
Si el email falla al enviarse, el código se devuelve en la respuesta JSON (solo para testing).

---

## ✅ **13. CHECKLIST DE IMPLEMENTACIÓN**

- [ ] Ejecutar SQL en Hostalia
- [ ] Subir `enviar_email.php`
- [ ] Reemplazar `auth.php` con versión nueva
- [ ] Añadir `VerificationModal.tsx`
- [ ] Modificar `UserModal.tsx`
- [ ] Compilar React
- [ ] Subir a Hostalia
- [ ] Probar registro completo
- [ ] Verificar envío de email
- [ ] Probar código correcto
- [ ] Probar código incorrecto
- [ ] Probar código expirado
- [ ] Probar reenvío de código
- [ ] Verificar que login requiere verificación

---

**¡Sistema de verificación listo!** 🎉

