# 🚀 Banco de Pruebas de Flota - Space Horde Survivor

## 📋 Descripción

El **Banco de Pruebas de Flota** es una herramienta profesional para optimizar el comportamiento de la flota aliada en tiempo real. Permite ajustar parámetros de movimiento, formación y IA sin afectar el juego principal.

## 🎯 Cómo Usar

### 1. Abrir el Banco de Pruebas
- Abre `pruebas.html` en tu navegador
- Se cargará un escenario limpio con solo el Comandante y 2 naves aliadas

### 2. Controles Básicos
- **WASD**: Mover el Comandante
- **Panel derecho**: Ajustar parámetros en tiempo real
- **Consola (F12)**: Ver valores exportados

### 3. Parámetros Ajustables

#### 🎛️ Comportamiento de la Flota

| Parámetro | Rango | Descripción |
|-----------|-------|-------------|
| **Fuerza de Seguimiento** | 100-5000 | Qué tan agresivamente las naves intentan mantener la formación |
| **Fuerza Máxima** | 5000-50000 | Límite superior de la fuerza de corrección |
| **Amortiguación** | 0.80-0.99 | Reduce oscilaciones y "temblores" |
| **Suavizado** | 0-2 | Suaviza los movimientos de las naves |
| **Distancia de Formación** | 50-200 | Distancia entre naves en la formación |
| **Velocidad Máxima** | 100-500 | Velocidad máxima de las naves aliadas |

### 4. Flujo de Trabajo de Optimización

1. **Observar el Comportamiento Actual**
   - Mueve el Comandante con WASD
   - Observa cómo reacciona la flota
   - Identifica problemas (naves muy lentas, oscilaciones, etc.)

2. **Ajustar Parámetros**
   - Si las naves se quedan atrás → **Aumentar Fuerza de Seguimiento**
   - Si las naves oscilan → **Aumentar Amortiguación**
   - Si los movimientos son bruscos → **Ajustar Suavizado**
   - Si la formación está muy apretada → **Aumentar Distancia de Formación**

3. **Probar y Refinar**
   - Haz movimientos variados (círculos, zigzags, paradas bruscas)
   - Ajusta los valores hasta encontrar la "sensación" perfecta

4. **Exportar Valores Optimizados**
   - Haz clic en **"📋 Exportar Valores"**
   - Copia el JSON de la consola
   - Pégalo en `js/config.js` en la sección `CONFIG.FORMATION`

### 5. Utilidades Adicionales

- **🔄 Restablecer**: Vuelve a los valores predeterminados
- **🚀 Añadir Nave**: Crea naves adicionales para probar con flotas más grandes

## 🎮 Ejemplos de Configuración

### Configuración "Enjambre Agresivo"
```javascript
{
    "FOLLOW_STRENGTH": 3000,
    "MAX_CORRECTION_FORCE": 25000,
    "DAMPING": 0.82,
    "SMOOTHING_FACTOR": 0.3,
    "FORMATION_DISTANCE": 60,
    "MAX_SPEED": 400
}
```

### Configuración "Formación Precisa"
```javascript
{
    "FOLLOW_STRENGTH": 1500,
    "MAX_CORRECTION_FORCE": 20000,
    "DAMPING": 0.90,
    "SMOOTHING_FACTOR": 0.8,
    "FORMATION_DISTANCE": 100,
    "MAX_SPEED": 250
}
```

### Configuración "Movimiento Fluido"
```javascript
{
    "FOLLOW_STRENGTH": 2000,
    "MAX_CORRECTION_FORCE": 30000,
    "DAMPING": 0.85,
    "SMOOTHING_FACTOR": 1.2,
    "FORMATION_DISTANCE": 80,
    "MAX_SPEED": 350
}
```

## 🔧 Troubleshooting

### Problema: Las naves no aparecen
- Verifica que el jugador (Comandante) se haya creado correctamente
- Revisa la consola para errores

### Problema: Las naves no siguen al Comandante
- Verifica que tengan el componente `FormationFollowerComponent`
- Asegúrate de que el `FleetSystem` esté activo

### Problema: Movimientos muy bruscos
- Reduce la **Fuerza de Seguimiento**
- Aumenta el **Suavizado**
- Aumenta la **Amortiguación**

## 📊 Métricas de Rendimiento

El banco de pruebas está optimizado para mantener **60 FPS** estables. Si notas caídas de rendimiento:

- Reduce el número de naves en la flota
- Simplifica los efectos visuales
- Verifica que no haya enemigos activos

## 🎯 Próximas Mejoras

- [ ] Visualización de vectores de fuerza
- [ ] Gráficos de rendimiento en tiempo real
- [ ] Guardado automático de configuraciones
- [ ] Comparación A/B de configuraciones
- [ ] Simulación de combate con enemigos

---

**¡Disfruta optimizando tu flota, Almirante! 🚀** 