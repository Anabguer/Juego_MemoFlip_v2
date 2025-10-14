# 📦 ParaBorrar - Archivos Movidos

**Fecha:** 14 de octubre de 2025

Esta carpeta contiene archivos duplicados o no utilizados que fueron removidos del proyecto principal.

---

## 📁 CONTENIDO

### 1. `app_original/` - Versión anterior completa
- **Motivo:** Código duplicado de `src/MemoFlipApp.tsx`
- **Estado:** Ya no se usa
- **Archivo importante:** `globals.css` fue copiado a `src/styles/globals.css`

### 2. `levelGenerator.ts` - Generador dinámico de niveles
- **Motivo:** El proyecto usa niveles estáticos (`public/levels.json`)
- **Estado:** No se usa
- **Nota:** Si en el futuro quieres generar niveles dinámicamente, este archivo tiene el código

### 3. `globalCardSystem.ts` - Sistema de cartas global
- **Motivo:** Se usa `simpleCardSystem.ts` en su lugar
- **Estado:** No se usa

### 4. `themeSystem.ts` - Sistema de temas
- **Motivo:** No se usa actualmente
- **Estado:** No se usa

### 5. `levels_backup.json` - Backup de niveles
- **Motivo:** Backup antiguo
- **Estado:** El activo está en `public/levels.json`

### 6. `levels.json` - Niveles de assets/
- **Motivo:** Duplicado
- **Estado:** El activo está en `public/levels.json`

---

## ⚠️ IMPORTANTE

**NO BORRES ESTA CARPETA POR AHORA**

Si algo falla después de la limpieza, puedes recuperar archivos de aquí.

**Borrar después de:**
- [ ] Verificar que todo funciona correctamente
- [ ] Hacer commit y push de los cambios
- [ ] Probar en producción
- [ ] Esperar al menos 1 semana sin problemas

---

## 🔄 CÓMO RECUPERAR UN ARCHIVO

Si necesitas recuperar algo:

```bash
# Desde la raíz del proyecto
copy ParaBorrar\ARCHIVO_A_RECUPERAR src\ruta\destino\
```

Por ejemplo:
```bash
copy ParaBorrar\levelGenerator.ts src\lib\
```

---

## 📝 ARCHIVO PRINCIPAL DE LIMPIEZA

Ver: `LIMPIEZA_CODIGO_RESUMEN.md` en la raíz del proyecto para detalles completos.

