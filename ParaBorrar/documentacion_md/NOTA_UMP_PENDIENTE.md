# ⚠️ UMP (User Messaging Platform) - PENDIENTE PARA v1.0.7

## 📋 Resumen

En la versión 1.0.6, se **intentó** implementar el sistema de consentimiento UMP para cumplir con las regulaciones de la UE (GDPR), pero se descubrió que:

1. **El plugin `@capacitor-community/admob` NO tiene soporte nativo para UMP**
2. Los tipos `ConsentStatus`, `ConsentDebugGeography`, etc. no existen en el plugin actual
3. Para implementar UMP correctamente, se necesitaría:
   - Un plugin adicional específico para UMP
   - O actualizar a una versión más reciente del plugin AdMob
   - O usar un bridge nativo personalizado

## ✅ Decisión Tomada

**Versión 1.0.6**: Lanzar con **anuncios de prueba de Google** (test ads) **SIN UMP**.

### ¿Por qué es seguro?

1. ✅ **Los test ads de Google NO requieren consentimiento** porque no son anuncios reales
2. ✅ La app ya tiene el `App ID` configurado en `AndroidManifest.xml`
3. ✅ El banner y rewarded ads están implementados y funcionan
4. ✅ Permite lanzar la app y obtener usuarios iniciales
5. ✅ Google Play NO rechazará la app por falta de UMP si solo usa test ads

## 🎯 Plan para v1.0.7 (Cuando tengamos IDs reales de AdMob)

### Cuando Google apruebe la cuenta de AdMob y tengamos IDs reales:

1. **Crear cuenta de Ad Unit IDs reales** en Google AdMob
2. **Investigar soluciones UMP**:
   - Opción A: Plugin `@capacitor-community/consent` (si existe)
   - Opción B: Implementar UMP con código nativo (Java/Kotlin para Android)
   - Opción C: Actualizar `@capacitor-community/admob` si hay nueva versión con UMP

3. **Implementar el flujo completo**:
   ```typescript
   // Pseudo-código del flujo UMP (para v1.0.7)
   1. Al iniciar app → requestConsentInfo()
   2. Si está en la UE y no hay consentimiento → mostrar formulario UMP
   3. Usuario acepta → anuncios personalizados
   4. Usuario rechaza → anuncios no personalizados (npa=1)
   5. Inicializar AdMob con el flag correspondiente
   6. Mostrar banner/rewarded ads
   ```

4. **Cambiar a IDs reales**:
   ```typescript
   // src/lib/adService.ts
   const isTesting = false; // ← CAMBIAR A false
   const REAL_BANNER = 'ca-app-pub-XXXXXXXX/XXXXXXXX'; // ← IDs reales
   const REAL_REWARDED = 'ca-app-pub-XXXXXXXX/XXXXXXXX'; // ← IDs reales
   ```

5. **Actualizar `AndroidManifest.xml`** con el App ID real

6. **Publicar v1.0.7 en Google Play**

## 📚 Referencias Útiles

- [Google UMP SDK Documentation](https://developers.google.com/admob/ump/android/quick-start)
- [Capacitor AdMob Plugin](https://github.com/capacitor-community/admob)
- [GDPR Compliance for Apps](https://support.google.com/googleplay/android-developer/answer/9859454)

## 🔄 Estado Actual (v1.0.6)

### ✅ Implementado
- ✅ AdMob inicialización básica
- ✅ Banner inferior (test ad)
- ✅ Rewarded ads para vidas extra (test ad)
- ✅ App ID en `AndroidManifest.xml`
- ✅ `padding-bottom: 60px` en body para espacio del banner
- ✅ Login/Logout funcionando
- ✅ Guardado de progreso al servidor
- ✅ `versionCode 7`, `versionName 1.0.6`

### ❌ Pendiente (para v1.0.7)
- ❌ UMP (User Messaging Platform)
- ❌ IDs reales de AdMob
- ❌ Anuncios personalizados vs no personalizados (NPA)
- ❌ Formulario de consentimiento GDPR

## 💡 Notas para el Usuario

**Por ahora**, al abrir la app desde Google Play:
1. Se mostrarán banners de prueba de Google (rectángulo gris con "Test Ad")
2. Los rewarded ads también serán de prueba
3. **Esto es completamente normal y esperado** para una app en desarrollo
4. Los usuarios pueden probar la app sin problemas
5. Cuando tengamos los IDs reales, los anuncios serán reales

**Para cambiar a producción** (cuando sea el momento):
1. Obtener IDs reales de Google AdMob
2. Implementar UMP
3. Cambiar `isTesting = false` en `src/lib/adService.ts`
4. Reemplazar IDs de prueba por IDs reales
5. Compilar v1.0.7
6. Subir a Google Play

---

**Fecha**: 14 de octubre de 2025  
**Versión actual**: 1.0.6 (versionCode 7)  
**Próxima versión**: 1.0.7 (UMP + IDs reales de AdMob)

