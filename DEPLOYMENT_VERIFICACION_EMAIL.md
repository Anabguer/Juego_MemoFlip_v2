# 🚀 GUÍA DE DESPLIEGUE: SISTEMA DE VERIFICACIÓN POR EMAIL

## ✅ **PASO 1: EJECUTAR SQL EN HOSTALIA**

### **Acceder a phpMyAdmin:**
1. Ir a: https://hostalia.com/cpanel
2. Login con credenciales
3. Buscar phpMyAdmin
4. Seleccionar BD: `9606966_sistema_apps_db`

### **Ejecutar script:**
1. Ir a pestaña "SQL"
2. Copiar contenido de: `PARA_HOSTALIA/agregar_verificacion_email.sql`
3. Pegar y ejecutar
4. Verificar mensaje: "4 consultas ejecutadas correctamente"

### **Verificar columnas creadas:**
```sql
SHOW COLUMNS FROM usuarios_aplicaciones;
```
Debe mostrar:
- `email_verificado` (tinyint)
- `codigo_verificacion` (varchar 10)
- `tiempo_verificacion` (timestamp)
- `intentos_verificacion` (int)

---

## 📂 **PASO 2: SUBIR ARCHIVOS PHP**

### **Archivos a subir vía FTP/FileZilla:**

#### **Archivo 1:** `enviar_email.php`
```
Origen:  api/enviar_email.php
Destino: /sistema_apps_api/memoflip/enviar_email.php
```

#### **Archivo 2:** `auth.php` (REEMPLAZAR)
```
Origen:  api/memoflip-auth-verificacion.php
Destino: /sistema_apps_api/memoflip/auth.php
Acción:  REEMPLAZAR el existente (hacer backup primero)
```

### **Verificar permisos:**
```
chmod 644 enviar_email.php
chmod 644 auth.php
```

---

## 🌐 **PASO 3: SUBIR BUILD DE REACT**

### **Carpetas a subir:**
```
Origen:  out/
Destino: /sistema_apps_upload/memoflip/
```

### **Archivos importantes:**
- `index.html` (actualizado)
- `_next/static/` (nuevos chunks)
- Mantener: `cards/`, `sounds/`, `logo.png`

### **Verificar que se subieron:**
- `/sistema_apps_upload/memoflip/index.html`
- `/sistema_apps_upload/memoflip/_next/static/chunks/...`

---

## 📧 **PASO 4: CONFIGURAR EMAIL EN HOSTALIA**

### **Verificar cuenta de email:**
1. Ir a cPanel → Cuentas de Email
2. Verificar que existe: `noreply@colisan.com`
3. Si no existe, crear:
   - Email: `noreply@colisan.com`
   - Password: (cualquiera, no se usará)
   - Cuota: 100 MB

### **Configurar SPF/DKIM (opcional pero recomendado):**
1. Ir a cPanel → Autenticadores de Email
2. Activar DKIM para `colisan.com`
3. Esto evita que los emails vayan a spam

---

## 🧪 **PASO 5: PROBAR EL SISTEMA**

### **Test 1: Registro**
1. Abrir: https://colisan.com/sistema_apps_upload/memoflip/
2. Click en "Entrar"
3. Pestaña "Crear cuenta"
4. Rellenar formulario:
   ```
   Email: test@tumail.com
   Nombre: Usuario Test
   Password: test123
   ```
5. Click "Crear cuenta"
6. Verificar mensaje: "Te hemos enviado un código..."

### **Test 2: Recepción de Email**
1. Revisar email (puede tardar 1-2 minutos)
2. Revisar carpeta SPAM si no aparece
3. Verificar que llega email con código de 6 dígitos

### **Test 3: Verificación**
1. Se abrirá automáticamente modal de verificación
2. Introducir código recibido
3. Click "Verificar código"
4. Verificar mensaje: "¡Cuenta verificada correctamente!"

### **Test 4: Login**
1. Cerrar modal
2. Ir a "Entrar" → Pestaña "Entrar"
3. Introducir email y password
4. Verificar que permite login ✅

### **Test 5: Login sin verificar**
1. Registrar otro usuario
2. NO introducir el código
3. Intentar hacer login
4. Verificar mensaje de error: "Debes verificar tu email antes..."

---

## 🔍 **PASO 6: DEBUGGING**

### **Si el email NO se envía:**

#### **Opción A: Ver logs del servidor**
```bash
# SSH en Hostalia
tail -f /home/colisan/public_html/sistema_apps_api/memoflip/error_log
```

#### **Opción B: Verificar respuesta JSON**
Abrir DevTools (F12) → Network → Buscar `auth.php` → Ver Response:
```json
{
  "success": true,
  "email_sent": false,  // ← Si es false, hay problema
  "verification_code": "123456"  // ← Código temporal
}
```

#### **Opción C: Usar código temporal**
Si `email_sent: false`, el código aparece en la respuesta JSON (solo en desarrollo).

### **Si el código no es válido:**

#### **Verificar en BD:**
```sql
SELECT 
    usuario_aplicacion_key,
    email,
    codigo_verificacion,
    tiempo_verificacion,
    email_verificado
FROM usuarios_aplicaciones
WHERE email = 'test@tumail.com';
```

Verificar:
- `codigo_verificacion` NO es NULL
- `tiempo_verificacion` < 24 horas
- `email_verificado` = 0

### **Si login no funciona después de verificar:**

```sql
-- Verificar estado del usuario
SELECT 
    email,
    activo,
    email_verificado
FROM usuarios_aplicaciones
WHERE email = 'test@tumail.com';
```

Debe ser:
- `activo` = 1
- `email_verificado` = 1

---

## 📋 **CHECKLIST FINAL**

- [ ] ✅ SQL ejecutado en Hostalia
- [ ] ✅ Columnas verificadas en BD
- [ ] ✅ `enviar_email.php` subido
- [ ] ✅ `auth.php` reemplazado (backup hecho)
- [ ] ✅ Build de React subido
- [ ] ✅ Email `noreply@colisan.com` existe
- [ ] ✅ Test: Registro completo
- [ ] ✅ Test: Email recibido
- [ ] ✅ Test: Código válido
- [ ] ✅ Test: Login exitoso
- [ ] ✅ Test: Login sin verificar (error)
- [ ] ✅ Configurar DKIM/SPF (opcional)

---

## 🔄 **ROLLBACK (SI ALGO FALLA)**

### **Volver a versión anterior:**
```bash
# Restaurar auth.php
cd /sistema_apps_api/memoflip/
mv auth.php auth.php.verificacion
mv auth.php.backup auth.php
```

### **Eliminar columnas de BD:**
```sql
ALTER TABLE usuarios_aplicaciones 
DROP COLUMN email_verificado,
DROP COLUMN codigo_verificacion,
DROP COLUMN tiempo_verificacion,
DROP COLUMN intentos_verificacion;
```

---

## 📞 **SOPORTE**

### **Archivos de referencia:**
- `SISTEMA_VERIFICACION_EMAIL.md` - Documentación completa
- `api/memoflip-auth-verificacion.php` - Código PHP
- `src/components/VerificationModal.tsx` - Modal de verificación

### **Logs útiles:**
```bash
# Ver logs de PHP
tail -f /home/colisan/logs/error.log

# Ver logs de email
tail -f /var/log/mail.log
```

---

## ✅ **ÉXITO**

Si todo funciona correctamente, verás:

1. ✅ Usuario se registra
2. ✅ Recibe email con código
3. ✅ Introduce código → Cuenta verificada
4. ✅ Puede hacer login
5. ✅ Sin verificar → NO puede login

**¡Sistema de verificación operativo!** 🎉

