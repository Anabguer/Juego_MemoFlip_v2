# ESTADO ACTUAL MEMOFLIP - 9 OCTUBRE 2025

## 🎯 SITUACIÓN ACTUAL
- ✅ **Juego funcionando**: https://colisan.com/sistema_apps_upload/memoflip/
- ✅ **Sin errores 404**: Todos los archivos cargando correctamente
- ❌ **Problema**: No guarda progreso (usuario en nivel 4, pero BD dice nivel 1)

## 📁 ESTRUCTURA SERVIDOR
```
/sistema_apps_upload/memoflip/
├── index.html ✅
├── logo.png ✅
├── _next/
│   └── static/
│       ├── css/bd13f7f12af3ad40.css ✅
│       ├── OxIh9MhK3PBeTwch7vcyI/
│       │   ├── _buildManifest.js ✅
│       │   └── _ssgManifest.js ✅
│       ├── chunks/ (9 archivos JS) ✅
│       └── chunks/pages/ (8 archivos JS) ✅
├── cards/ ✅
├── sounds/ ✅
├── auth.php ✅
├── game.php ✅
├── ranking.php ✅
└── _common.php ✅
```

## 🔧 RUTAS CONFIGURADAS
- **Frontend**: `/sistema_apps_upload/memoflip/`
- **API**: `/sistema_apps_upload/memoflip/auth.php`, `game.php`, `ranking.php`
- **Assets**: `/sistema_apps_upload/memoflip/cards/`, `/sistema_apps_upload/memoflip/sounds/`

## 🗄️ BASE DE DATOS
- **Tabla principal**: `memoflip_usuarios`
- **Usuario actual**: Nivel 1 en BD, pero jugando nivel 4
- **Problema**: Sistema híbrido offline/online no sincronizando

## 📝 ARCHIVOS CLAVE PARA ANÁLISIS
1. `src/store/gameStore.ts` - Lógica de guardado
2. `src/components/GameScreen.tsx` - Llamadas a saveProgressToServer
3. `src/components/IntroScreen.tsx` - Llamadas a loadProgressFromServer
4. `PARA_HOSTALIA/sistema_apps_upload/memoflip/game.php` - API de guardado

## ⚠️ REGLA IMPORTANTE
**NO CAMBIAR RUTAS NI ARCHIVOS DE SITIO SIN AVISAR ANTES**

---
*Creado: 9 Octubre 2025*
*Estado: Funcionando pero sin guardar progreso*

