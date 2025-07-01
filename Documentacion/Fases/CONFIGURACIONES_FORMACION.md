# Configuraciones de Formación - Space Horde Survivor

## 🔧 Configuraciones Disponibles para Pruebas

### **Configuración Actual (Sincronizada con Comandante)**
```javascript
FORMATION_RADIUS: 80,
FORMATION_FOLLOW_STRENGTH: 8,
FORMATION_MAX_CORRECTION_FORCE: 800,
FORMATION_CORRECTION_THRESHOLD: 120,
FORMATION_SMOOTHING_FACTOR: 0.15,
FORMATION_ROTATION_SYNC: true,        // ← SINCRONIZADA
FORMATION_DAMPING: 0.92
```

**Comportamiento:**
- ✅ La nave aliada **SIEMPRE** apunta en la misma dirección que el Comandante
- ✅ Rotación instantánea cuando rotes con A/D
- ✅ Movimiento muy suave y estable
- ✅ Formación rota con el Comandante

---

### **Configuración Alternativa (Rotación por Movimiento)**
```javascript
FORMATION_RADIUS: 80,
FORMATION_FOLLOW_STRENGTH: 8,
FORMATION_MAX_CORRECTION_FORCE: 800,
FORMATION_CORRECTION_THRESHOLD: 120,
FORMATION_SMOOTHING_FACTOR: 0.15,
FORMATION_ROTATION_SYNC: false,       // ← BASADA EN MOVIMIENTO
FORMATION_DAMPING: 0.92
```

**Comportamiento:**
- ✅ La nave aliada apunta hacia donde se está moviendo
- ✅ Rotación más orgánica y natural
- ✅ Movimiento fluido sin oscilaciones
- ⚠️ No rota cuando el Comandante rota sin moverse

---

### **Configuración Ultra-Suave (Para Movimiento Muy Fluido)**
```javascript
FORMATION_RADIUS: 80,
FORMATION_FOLLOW_STRENGTH: 5,         // ← MÁS SUAVE
FORMATION_MAX_CORRECTION_FORCE: 500,  // ← MÁS SUAVE
FORMATION_CORRECTION_THRESHOLD: 100,
FORMATION_SMOOTHING_FACTOR: 0.08,     // ← MÁS SUAVE
FORMATION_ROTATION_SYNC: true,
FORMATION_DAMPING: 0.95                // ← MÁS AMORTIGUACIÓN
```

**Comportamiento:**
- ✅ Movimiento extremadamente suave
- ⚠️ Puede ser demasiado lento para seguir movimientos rápidos
- ✅ Ideal para movimiento pausado y estratégico

---

### **Configuración Responsiva (Para Combate Dinámico)**
```javascript
FORMATION_RADIUS: 80,
FORMATION_FOLLOW_STRENGTH: 12,        // ← MÁS RESPONSIVO
FORMATION_MAX_CORRECTION_FORCE: 1200, // ← MÁS RESPONSIVO
FORMATION_CORRECTION_THRESHOLD: 140,
FORMATION_SMOOTHING_FACTOR: 0.25,     // ← MÁS RESPONSIVO
FORMATION_ROTATION_SYNC: true,
FORMATION_DAMPING: 0.88                // ← MENOS AMORTIGUACIÓN
```

**Comportamiento:**
- ✅ Sigue rápidamente al Comandante
- ✅ Ideal para combate dinámico
- ⚠️ Puede tener ligeras oscilaciones si es muy agresivo

---

## 🎮 Cómo Cambiar la Configuración

### **Opción 1: Cambiar en `js/config.js`**
1. Abre `js/config.js`
2. Busca la sección `// === CONFIGURACIÓN DE FORMACIÓN DE FLOTA ===`
3. Reemplaza los valores con una de las configuraciones de arriba
4. Guarda el archivo
5. Recarga el navegador (F5)

### **Opción 2: Cambiar `FORMATION_ROTATION_SYNC` Rápidamente**
Para probar la diferencia entre rotación sincronizada vs basada en movimiento:

**Sincronizada con Comandante:**
```javascript
FORMATION_ROTATION_SYNC: true,
```

**Basada en Movimiento:**
```javascript
FORMATION_ROTATION_SYNC: false,
```

---

## 🔍 Qué Observar en las Pruebas

### **Movimiento Fluido ✅**
- La nave aliada NO debe oscilar o "vibrar"
- Debe seguir al Comandante sin movimientos bruscos
- La distancia al objetivo debe mantenerse baja (< 15 píxeles)

### **Rotación Sincronizada ✅**
- Con `FORMATION_ROTATION_SYNC: true`: La nave rota instantáneamente con el Comandante
- Con `FORMATION_ROTATION_SYNC: false`: La nave rota según su dirección de movimiento

### **Logs de Debug 📊**
Observa en la consola (F12):
```
🛸 testFormationAlly Debug: {
  distanceToTarget: "8.2",        // ← Debe ser < 15 para estabilidad
  angle: "45.3°",                 // ← Ángulo de la nave aliada
  commanderAngle: "45.3°",        // ← Ángulo del Comandante
  rotationSync: "ON",             // ← Estado de sincronización
  target: "(1040.0, 280.0)"      // ← Posición objetivo calculada
}
```

### **Comportamientos Esperados:**

**✅ CORRECTO:**
- `distanceToTarget` entre 2-15 píxeles
- Movimiento suave sin saltos
- Rotación coherente con la configuración

**❌ PROBLEMÁTICO:**
- `distanceToTarget` > 30 píxeles constantemente
- Cambios bruscos de ángulo (180° → 0°)
- Mensajes de corrección de emergencia frecuentes

---

## 💡 Recomendaciones

### **Para Desarrollo/Testing:**
Usar **Configuración Actual** con `FORMATION_ROTATION_SYNC: true`

### **Para Gameplay Final:**
Probar ambas configuraciones y elegir la que se sienta más natural:
- **Sincronizada**: Más predecible, mejor para formaciones militares
- **Por Movimiento**: Más orgánica, mejor para sensación de "vida propia"

### **Ajuste Fino:**
Si necesitas ajustar:
1. **Muy lento**: Aumenta `FORMATION_SMOOTHING_FACTOR`
2. **Muy oscilante**: Disminuye `FORMATION_SMOOTHING_FACTOR` y aumenta `FORMATION_DAMPING`
3. **No sigue bien**: Aumenta `FORMATION_FOLLOW_STRENGTH`

---

*Archivo de configuraciones para Space Horde Survivor - Fase 5.2* 