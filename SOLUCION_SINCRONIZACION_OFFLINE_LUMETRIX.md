# 🔧 SOLUCIÓN: Sincronización Offline en APK Capacitor

## ❌ **PROBLEMA DETECTADO**

### Síntoma:
Cuando un usuario **juega offline** (sin internet):
1. ✅ El progreso se guarda localmente en `localStorage`
2. ✅ Se marca como pendiente de sincronización
3. ❌ Al reconectar y hacer auto-login, el progreso del **servidor** sobrescribe el **local**
4. ❌ **Se pierde el avance offline**

### Ejemplo:
```
1. Usuario en nivel 10 (servidor)
2. Quita internet
3. Juega offline: nivel 10 → 15
4. Se guarda en localStorage: nivel 15 ✅
5. Conecta internet
6. Auto-login carga nivel 10 del servidor ❌
7. PIERDE niveles 11-15 jugados offline ❌
```

---

## 🎯 **CAUSA DEL PROBLEMA**

En `handleLoginSuccess` (o función similar de login), el código:
1. Recibe datos del servidor (nivel 10)
2. Los aplica directamente al store
3. **NO compara** con el progreso local (nivel 15)
4. **Sobrescribe** el progreso más avanzado

---

## ✅ **SOLUCIÓN: Merge Inteligente**

### Estrategia:
Al hacer login, **comparar** progreso servidor vs local y **usar el más avanzado**.

---

## 📝 **CÓDIGO A MODIFICAR**

### **ANTES** ❌ (Sobrescribe siempre con servidor):

```typescript
const handleLoginSuccess = async (data: SessionUser) => {
  // Obtener datos del servidor
  const serverLevel = data.game_data?.max_level_unlocked || 1;
  const serverCoins = data.game_data?.coins_total || 0;
  
  // ❌ APLICAR DIRECTO (ignora progreso local)
  setCurrentLevel(serverLevel);
  setCoins(serverCoins);
  
  localStorage.setItem('progress', JSON.stringify({
    level: serverLevel,
    coins: serverCoins
  }));
};
```

---

### **DESPUÉS** ✅ (Merge inteligente):

```typescript
const handleLoginSuccess = async (data: SessionUser) => {
  const { setCurrentLevel, setCoins, getProgress } = useGameStore.getState();
  
  // Obtener datos del servidor
  const serverLevel = data.game_data?.max_level_unlocked || 1;
  const serverCoins = data.game_data?.coins_total || 0;
  
  // 🔍 Obtener progreso local (por si jugó offline)
  const localProgress = getProgress();
  
  // 🔀 MERGE INTELIGENTE: Usar el progreso más avanzado
  const finalLevel = Math.max(serverLevel, localProgress.level);
  const finalCoins = Math.max(serverCoins, localProgress.coins);
  
  console.log('📊 Merge progreso:', { 
    servidor: { level: serverLevel, coins: serverCoins },
    local: { level: localProgress.level, coins: localProgress.coins },
    final: { level: finalLevel, coins: finalCoins }
  });
  
  // ✅ Aplicar el progreso más avanzado
  setCurrentLevel(finalLevel);
  setCoins(finalCoins);
  
  // Guardar en localStorage
  localStorage.setItem('progress', JSON.stringify({
    level: finalLevel,
    coins: finalCoins
  }));
  
  // 📤 Si el progreso local es mayor, sincronizar al servidor
  if (finalLevel > serverLevel || finalCoins > serverCoins) {
    console.log('📤 Progreso local más avanzado, sincronizando al servidor...');
    try {
      const { saveProgressToServer } = useGameStore.getState();
      await saveProgressToServer();
      console.log('✅ Progreso offline sincronizado al servidor');
    } catch (error) {
      console.error('❌ Error sincronizando progreso:', error);
    }
  }
};
```

---

## 🔍 **PUNTOS CLAVE**

### 1. **Obtener progreso local**
```typescript
const localProgress = getProgress();
```

### 2. **Comparar y usar el mayor**
```typescript
const finalLevel = Math.max(serverLevel, localProgress.level);
const finalCoins = Math.max(serverCoins, localProgress.coins);
```

### 3. **Sincronizar al servidor si local > servidor**
```typescript
if (finalLevel > serverLevel || finalCoins > serverCoins) {
  await saveProgressToServer();
}
```

---

## 🧪 **CÓMO PROBAR**

### Escenario de prueba:
1. ✅ Login con internet (ej: nivel 5)
2. ❌ Quitar internet (modo avión)
3. 🎮 Jugar 3 niveles (5 → 8)
4. ✅ Conectar internet
5. 🔄 Reabrir la app (o hacer logout/login)

### Resultado esperado:
```
📊 Merge progreso: {
  servidor: { level: 5, coins: 500 },
  local: { level: 8, coins: 800 },
  final: { level: 8, coins: 800 }
}
📤 Progreso local más avanzado, sincronizando al servidor...
✅ Progreso offline sincronizado al servidor
```

**El usuario debería estar en nivel 8, NO en nivel 5** ✅

---

## 📂 **ARCHIVOS A MODIFICAR EN LUMETRIX**

Buscar la función que maneja el login exitoso, probablemente en:
- `src/components/LoginScreen.tsx`
- `src/components/AuthScreen.tsx`
- `src/components/IntroScreen.tsx`

O donde se gestione la autenticación.

---

## ⚠️ **CONSIDERACIONES**

### ¿Qué hacer con las vidas?
```typescript
const finalLives = serverLives; // Siempre del servidor
```
Las vidas NO se mergean, porque:
- Son un recurso que se regenera con tiempo
- El servidor tiene la "verdad" temporal

### ¿Y si hay conflicto?
El merge con `Math.max()` asume que **mayor = mejor**.  
Si tu app tiene lógica diferente (ej: menor es mejor), ajusta la comparación.

---

## 🎯 **BENEFICIOS**

✅ **Sin pérdida de progreso offline**  
✅ **Sincronización automática al reconectar**  
✅ **Experiencia fluida para el usuario**  
✅ **Logs claros para debugging**

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] Modificar función de login para obtener `getProgress()`
- [ ] Implementar merge con `Math.max()`
- [ ] Añadir sincronización condicional al servidor
- [ ] Añadir logs de debugging
- [ ] Probar escenario offline → online
- [ ] Verificar que progreso se mantiene
- [ ] Verificar que se sincroniza al servidor

---

## 🔗 **REFERENCIA**

Implementado en **MemoFlip** en:
- Archivo: `src/components/IntroScreen.tsx`
- Función: `handleLoginSuccess`
- Líneas: 200-277

---

**¡Ahora Lumetrix tendrá el mismo fix!** 🚀

