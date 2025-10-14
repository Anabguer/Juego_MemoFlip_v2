# 🔧 SOLUCIÓN: Verificar tu cuenta MemoFlip manualmente

## 📋 EL PROBLEMA

Tu cuenta `agl0305@gmail.com` fue creada **ANTES** de implementar el sistema de verificación de email, por lo que la base de datos no tiene marcada la columna `verified_at` y por eso no te deja entrar.

---

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### **PASO 1: Subir el archivo PHP**

1. Abre tu cliente FTP (FileZilla, WinSCP, o el que uses)
2. Conéctate al servidor `ftp.colisan.com`
3. Ve a la carpeta: `/memoflip/`
4. Sube el archivo: `PARA_HOSTALIA/verificar_usuario_manual.php`

### **PASO 2: Ejecutar el script**

Abre tu navegador y ve a esta URL:

```
https://colisan.com/sistema_apps_upload/memoflip/verificar_usuario_manual.php
```

Verás un mensaje que dice:
- ✅ **¡ÉXITO!** Se verificaron X usuarios correctamente
- Lista de emails verificados (incluyendo el tuyo)

### **PASO 3: Borrar el archivo (seguridad)**

1. Vuelve a tu cliente FTP
2. Ve a `/memoflip/`
3. **Elimina** el archivo `verificar_usuario_manual.php`

### **PASO 4: Probar**

1. Cierra completamente la app MemoFlip
2. Ábrela de nuevo
3. Inicia sesión con `agl0305@gmail.com`
4. ✅ **¡Debería funcionar!**

---

## 🔍 ¿QUÉ HACE EL SCRIPT?

El script busca todos los usuarios de MemoFlip que tienen `verified_at = NULL` y:

1. Marca `verified_at = NOW()` (fecha actual)
2. Activa la cuenta `activo = 1`
3. Limpia `verification_code` y `verification_expiry`

Básicamente **simula que ya verificaste tu email**, que es lo correcto porque tu cuenta es antigua.

---

## ⚠️ ALTERNATIVA: Ejecutar SQL directamente

Si prefieres, puedes ejecutar este SQL directamente en phpMyAdmin:

```sql
UPDATE usuarios_aplicaciones
SET 
    verified_at = NOW(),
    activo = 1,
    verification_code = NULL,
    verification_expiry = NULL
WHERE email = 'agl0305@gmail.com'
AND app_codigo = 'memoflip';
```

---

**¿Cuál método prefieres?** 🚀

