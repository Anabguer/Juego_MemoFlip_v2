# 🔍 GUÍA DE VERIFICACIÓN - ARCHIVOS CORRECTOS MEMOFLIP

## ⚠️ IMPORTANTE: Sigue estos pasos EXACTAMENTE en orden

---

## **1️⃣ LIMPIAR Y DESCARGAR TODO DESDE CERO**

**PRIMERO:** Vacía completamente la carpeta del proyecto y descarga todo limpio:

```bash
# Si ya tienes una carpeta, elimínala completamente
# Luego clona el proyecto desde cero:
git clone https://github.com/Anabguer/Juego_MemoFlip_v2.git
cd Juego_MemoFlip_v2
```

**Espera a que termine completamente la descarga.**

---

## **2️⃣ VERIFICAR QUE TIENES LA VERSIÓN CORRECTA**

Ejecuta estos comandos:

```bash
git status
git log --oneline -5
```

**✅ DEBE VER:**
```
commit 6f19426 Add identification comments for APK conversion - mark correct files
commit 2f43a15 Add comprehensive game mechanics and pet system
```

---

## **3️⃣ VERIFICAR ARCHIVOS CORRECTOS**

Ejecuta estos comandos para buscar los comentarios identificativos:

### **Archivo principal (src/app/page.tsx):**
```bash
grep -n "MEMOFLIP NEXTJS - PÁGINA PRINCIPAL CORRECTA" src/app/page.tsx
```

**✅ DEBE MOSTRAR:** `136:      {/* 🎮 MEMOFLIP NEXTJS - PÁGINA PRINCIPAL CORRECTA - VERSIÓN COMPLETA */}`

### **Componente de juego (src/components/GameScreen.tsx):**
```bash
grep -n "MEMOFLIP NEXTJS - COMPONENTE DE JUEGO CORRECTO" src/components/GameScreen.tsx
```

**✅ DEBE MOSTRAR:** `42:  // 🎮 MEMOFLIP NEXTJS - COMPONENTE DE JUEGO CORRECTO - VERSIÓN COMPLETA`

### **Pantalla de inicio (src/components/IntroScreen.tsx):**
```bash
grep -n "MEMOFLIP NEXTJS - PANTALLA DE INICIO CORRECTA" src/components/IntroScreen.tsx
```

**✅ DEBE MOSTRAR:** `17:  // 🎮 MEMOFLIP NEXTJS - PANTALLA DE INICIO CORRECTA - VERSIÓN COMPLETA`

---

## **4️⃣ VERIFICAR ESTRUCTURA DEL PROYECTO**

Ejecuta estos comandos:

```bash
ls -la src/app/
ls -la src/components/
ls -la
```

**✅ DEBE VER:**
- `src/app/page.tsx` ✅
- `src/components/GameScreen.tsx` ✅
- `src/components/IntroScreen.tsx` ✅
- `capacitor.config.ts` ✅
- `ARCHIVOS_CORRECTOS_MEMOFLIP.md` ✅

---

## **5️⃣ INSTALAR DEPENDENCIAS Y PROBAR**

Una vez que tengas los archivos correctos:

```bash
npm install
npm run dev
```

**✅ DEBE FUNCIONAR:** Abre http://localhost:3000 y debería cargar el juego correctamente.

---

## **6️⃣ PARA CONVERTIR A APK (SOLO SI TODO FUNCIONA)**

Si el juego funciona correctamente en el navegador:

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

---

## **7️⃣ SI ALGO NO COINCIDE**

**Envía estos resultados:**
1. El resultado de `git status`
2. El resultado de `git log --oneline -5`
3. El resultado de `ls -la src/app/`
4. El resultado de `ls -la src/components/`
5. El resultado de `npm run dev` (si hay errores)

---

## **🚨 PROBLEMAS COMUNES:**

1. **"No encuentra los comentarios"** → Vuelve al paso 1 (descargar desde cero)
2. **"Archivos no existen"** → Vuelve al paso 1 (descargar desde cero)
3. **"Error en git clone"** → Verifica que tengas acceso a GitHub
4. **"Error en npm install"** → Verifica que tengas Node.js instalado
5. **"Error en npm run dev"** → Verifica que tengas todos los archivos correctos

---

## **📱 ARCHIVOS PRINCIPALES PARA APK:**

- **Página principal:** `src/app/page.tsx`
- **Componente de juego:** `src/components/GameScreen.tsx`
- **Pantalla de inicio:** `src/components/IntroScreen.tsx`
- **Configuración:** `capacitor.config.ts`

---

## **🎯 OBJETIVO FINAL:**

1. **Descargar todo limpio desde GitHub**
2. **Verificar que tiene los 3 comentarios identificativos**
3. **Probar que funciona con `npm run dev`**
4. **Convertir a APK para Hostalia**

**✅ ÉXITO:** Si encuentra los 3 comentarios y el juego funciona en localhost:3000

**❌ FALLO:** Si no encuentra los comentarios, debe volver al paso 1
