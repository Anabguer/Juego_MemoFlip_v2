# 🧹 PLAN DE LIMPIEZA PROFUNDA - RAÍZ DEL PROYECTO

## 📊 ESTADO ACTUAL (CAOS)

**Raíz del proyecto:** 60+ archivos .md + 5 .aab (81 MB c/u) + 1 .apk (256 MB) + scripts + capturas mezcladas

---

## ✅ ARCHIVOS QUE DEBEN QUEDAR EN LA RAÍZ

### Configuración esencial:
- package.json
- package-lock.json
- tsconfig.json
- next.config.js
- capacitor.config.ts
- eslint.config.mjs
- postcss.config.mjs
- next-env.d.ts
- .gitignore
- README.md

### Carpetas esenciales:
- src/
- pages/
- public/
- node_modules/
- android/
- .next/ (temporal, debe estar en .gitignore)
- out/ (temporal, debe estar en .gitignore)

---

## 🗑️ ARCHIVOS A MOVER/ORGANIZAR

### 1. Documentación (30+ archivos .md) → `docs/`
- AAB_*.md
- CHECKS_*.md
- GUIA_*.md
- INSTRUCCIONES_*.md
- LISTO_*.md
- VERSION_*.md
- SISTEMA_*.md
- RESUMEN_*.md
- etc.

### 2. Builds antiguos → `builds/` o ELIMINAR
- MemoFlip_v1.0.4_FINAL.aab (81 MB)
- MemoFlip_v1.0.5_*.aab (3 archivos, 81 MB c/u)
- MemoFlip_v1.0.6_*.aab (81 MB)
- MemoFlip-GooglePlay.aab (81 MB) ← Solo este es necesario
- MemoFlip-LATEST.apk (256 MB)

**Total a limpiar: ~650 MB**

### 3. Scripts (.bat, .js) → `scripts/`
- compilar_*.bat
- generar_*.bat
- instalar_*.bat
- deploy_*.bat
- ver_logs.bat
- copiar_apk.bat
- crear_icono_app.js
- hacer_capturas_google_play.js
- redimensionar_capturas.js

### 4. Capturas (DUPLICADAS!) → `docs/capturas/`
- capturas/
- capturas_google_play/
- capturas_google_play_finales/ ← Solo esta es necesaria
- capturas_google_play_redimensionadas/

### 5. Backups → `backups/`
- cards_backup_original/
- memoflip-release.keystore ← CRÍTICO: mover a lugar seguro

### 6. Deploy/API → `deploy/` o ParaBorrar
- PARA_HOSTALIA/ (861 archivos!)
- PARA_HOSTALIA_CORRECTO/
- api/
- config/
- database/
- deploy_to_hostalia.php

### 7. Assets temporales → ParaBorrar o eliminar
- iconoapp.png
- card_001_512x512.png
- assets/ (ya no se usa, niveles están en public/)

---

## 📁 ESTRUCTURA FINAL PROPUESTA

```
MemoFlip/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── capacitor.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── next-env.d.ts
│
├── src/                    ← Código fuente
├── pages/                  ← Páginas Next.js
├── public/                 ← Assets públicos
├── android/                ← Proyecto Android
│
├── docs/                   ← Documentación organizada
│   ├── guias/
│   ├── versiones/
│   ├── capturas/
│   └── manuales/
│
├── scripts/                ← Scripts de build/deploy
│   ├── android/
│   ├── capturas/
│   └── deploy/
│
├── builds/                 ← Builds antiguos (opcional)
│   ├── aab/
│   └── apk/
│
├── backups/                ← Backups importantes
│   ├── cards/
│   └── keystore/
│
├── deploy/                 ← Archivos de deploy
│   ├── hostalia/
│   └── database/
│
└── ParaBorrar/             ← Archivos obsoletos
```

---

## ⚠️ ARCHIVOS CRÍTICOS (NO TOCAR)

- memoflip-release.keystore ← Mover a `backups/keystore/`
- public/levels.json ← Niveles del juego
- src/ ← Todo el código
- android/ ← Proyecto Android

---

## 🎯 BENEFICIOS DE LA LIMPIEZA

1. **Reducir tamaño:** ~650 MB menos de builds antiguos
2. **Organización:** Todo en su lugar
3. **Rapidez:** Git más rápido sin tanto archivo
4. **Claridad:** Fácil encontrar documentación
5. **Seguridad:** Keystore en lugar seguro

---

¿Procedo con la limpieza profunda?

