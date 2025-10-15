# 📧 ACTIVAR VERIFICACIÓN DE EMAIL - MemoFlip

## 🎯 OBJETIVO
Restaurar el sistema de verificación por email que estaba funcionando antes de la limpieza.

---

## ✅ ARCHIVOS RESTAURADOS (ya listos en local)

### 1. `auth.php` (REEMPLAZADO)
- **Ubicación:** `sistema_apps_upload/memoflip/auth.php`
- **Cambios:** Añadidos endpoints `verify_code` y `resend_code`
- **Estado:** ✅ Listo para subir

### 2. `enviar_email.php` (NUEVO)
- **Ubicación:** `sistema_apps_upload/memoflip/enviar_email.php`
- **Función:** Envía emails con códigos de verificación
- **Estado:** ✅ Listo para subir

### 3. `setup_verificacion.sql` (NUEVO)
- **Ubicación:** `sistema_apps_upload/memoflip/setup_verificacion.sql`
- **Función:** Crea columnas necesarias en la base de datos
- **Estado:** ✅ Listo para ejecutar

---

## 📋 PASOS A SEGUIR EN HOSTALIA

### PASO 1: Subir archivos PHP

```bash
# Subir por FTP/SFTP a Hostalia:
# Ruta: /sistema_apps_upload/memoflip/

1. auth.php (REEMPLAZAR el existente)
2. enviar_email.php (NUEVO archivo - con SMTP configurado)
3. descargar_phpmailer.php (NUEVO archivo - para instalar PHPMailer)
```

### PASO 1.5: Instalar PHPMailer (IMPORTANTE)

**Opción A: Automático (Recomendado)**
1. Sube `descargar_phpmailer.php` a Hostalia
2. Ejecuta en el navegador: `https://colisan.com/sistema_apps_upload/memoflip/descargar_phpmailer.php`
3. Debería crear la carpeta `../includes/PHPMailer/` con los archivos necesarios

**Opción B: Manual**
Si la opción A no funciona, descarga PHPMailer manualmente:
1. Descarga: https://github.com/PHPMailer/PHPMailer/archive/master.zip
2. Extrae y sube la carpeta `src/` como `../includes/PHPMailer/`

### PASO 2: Ejecutar SQL en phpMyAdmin

1. Acceder a phpMyAdmin en Hostalia
2. Seleccionar base de datos: `9606966_sistema_apps_db`
3. Ir a pestaña "SQL"
4. Copiar y ejecutar el contenido de `setup_verificacion.sql`
5. Verificar que muestre: "Setup completado"

### PASO 3: Verificar columnas creadas

Ejecutar esta consulta para confirmar:

```sql
DESCRIBE usuarios_aplicaciones;
```

Debe mostrar las nuevas columnas:
- ✅ `verification_code` VARCHAR(10)
- ✅ `verification_expiry` DATETIME
- ✅ `verified_at` DATETIME

### PASO 4: Probar el sistema

1. Abrir la app MemoFlip
2. Click en "Crear cuenta"
3. Rellenar el formulario
4. **DEBE aparecer el modal de verificación pidiendo el código**
5. Revisar email (o spam)
6. Introducir el código de 6 dígitos
7. Debe hacer auto-login

---

## 📧 CONFIGURACIÓN SMTP ACTIVADA

### **Datos SMTP Configurados:**

```php
Servidor SMTP: smtp.colisan.com
Puerto: 25
Seguridad: none (sin SSL/TLS)
Usuario: info@colisan.com
Contraseña: IgdAmg19521954
Remitente: info@intocables.com
```

### **Cómo Funciona:**

1. **PHPMailer disponible:** Usa SMTP automáticamente
2. **PHPMailer NO disponible:** Usa `mail()` nativo como fallback
3. **Logs detallados:** Revisa `/var/log/mail.log` o error_log de PHP

### **Verificar SMTP:**

Si los emails no llegan, revisa los logs:

```bash
# En Hostalia, buscar en error_log de PHP:
grep "MEMOFLIP EMAIL" /path/to/error_log

# Deberías ver:
[MEMOFLIP EMAIL SMTP] Enviado a: email@ejemplo.com | Código: 123456 | Status: OK
```

---

## 🔍 DIAGNÓSTICO SI NO LLEGA EMAIL

### Opción 1: Revisar logs del servidor

En Hostalia, revisar:
```bash
/var/log/mail.log
```

### Opción 2: Verificar función mail() de PHP

Crear archivo de prueba: `test_email.php`

```php
<?php
$to = "tu_email@ejemplo.com";
$subject = "Test MemoFlip";
$message = "Email de prueba desde MemoFlip";
$headers = "From: noreply@colisan.com\r\n";

if (mail($to, $subject, $message, $headers)) {
    echo "✅ Email enviado correctamente";
} else {
    echo "❌ Error enviando email";
}
?>
```

### Opción 3: Verificar en código de registro

Si el registro devuelve:
```json
{
  "success": true,
  "email_sent": false,
  "verification_code": "123456"
}
```

Significa que:
- ✅ El registro funcionó
- ❌ El envío de email falló
- ℹ️ El código está disponible en la respuesta (solo desarrollo)

---

## 🐛 TROUBLESHOOTING

### Problema: "Código incorrecto"
**Solución:** Verificar que el código en la BD coincide

```sql
SELECT email, verification_code, verification_expiry, verified_at
FROM usuarios_aplicaciones 
WHERE email = 'email_del_usuario@ejemplo.com';
```

### Problema: "El código ha expirado"
**Solución:** Usar botón "Reenviar código" en la app

### Problema: Email nunca llega
**Posibles causas:**
1. 🔴 Hostalia bloquea `mail()` nativa de PHP
2. 🔴 Email va a spam
3. 🔴 Dominio `colisan.com` no tiene SPF/DKIM configurado

**Solución alternativa:** Usar SMTP (PHPMailer)

---

## 📊 FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario rellena formulario de registro                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Backend (auth.php → handle_register)                        │
│    - Valida datos                                               │
│    - Crea usuario en usuarios_aplicaciones (activo=0)          │
│    - Genera código random de 6 dígitos                         │
│    - Guarda código en verification_code                        │
│    - Guarda expiry (NOW + 24h) en verification_expiry         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. enviarEmailVerificacion($email, $nombre, $codigo)           │
│    - Envía email HTML con código                               │
│    - Retorna true/false                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Backend responde al frontend:                               │
│    {                                                            │
│      "success": true,                                           │
│      "requires_verification": true,                            │
│      "email_sent": true                                        │
│    }                                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Frontend (UserModal.tsx)                                    │
│    - Detecta requires_verification=true                        │
│    - Cierra modal de registro                                  │
│    - Abre VerificationModal                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Usuario introduce código en VerificationModal               │
│    - Frontend envía: { action: 'verify_code', email, codigo } │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Backend (auth.php → handle_verify_code)                     │
│    - Verifica código coincide                                  │
│    - Verifica no expirado                                      │
│    - Marca verified_at = NOW()                                 │
│    - Marca activo = 1                                          │
│    - Limpia verification_code y verification_expiry           │
│    - Crea usuario en memoflip_usuarios                        │
│    - Establece sesión automáticamente                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend hace auto-login                                    │
│    - Cierra VerificationModal                                  │
│    - Cierra UserModal                                          │
│    - Recarga página (window.location.reload)                  │
│    - Usuario logeado y verificado ✅                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Archivos subidos a Hostalia
- [ ] SQL ejecutado correctamente
- [ ] Columnas creadas en BD
- [ ] Prueba de registro muestra modal de verificación
- [ ] Email llega correctamente
- [ ] Código se verifica correctamente
- [ ] Auto-login funciona después de verificación
- [ ] Si email no llega, código aparece en logs

---

## 📞 CONTACTO SOPORTE

Si hay problemas con el envío de emails, contactar soporte de Hostalia para:
1. Confirmar que `mail()` de PHP está habilitada
2. Verificar configuración de SMTP
3. Revisar logs de email del servidor

---

## 🚀 ALTERNATIVA: SMTP (si mail() no funciona)

Si la función nativa `mail()` no funciona en Hostalia, podemos implementar PHPMailer con SMTP.

**Ventajas:**
- ✅ Más confiable
- ✅ Mejor deliverability
- ✅ No depende de configuración del servidor

**Desventaja:**
- ❌ Requiere credenciales SMTP (Gmail, SendGrid, etc.)

---

Creado: $(date)
Estado: ✅ Listo para desplegar

