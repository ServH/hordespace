/**
 * Space Horde Survivor - Punto de Entrada Principal
 * Inicializa el juego y maneja eventos globales
 */

let gameInstance = null;
let canvas = null;
let ctx = null;

/**
 * Inicializa el juego cuando el DOM esté listo
 */
function initGame() {
    console.log("🌟 Inicializando Space Horde Survivor...");
    
    // Obtener referencias al canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("❌ Error: No se pudo encontrar el canvas con ID 'gameCanvas'");
        return;
    }
    
    // Obtener contexto 2D
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("❌ Error: No se pudo obtener el contexto 2D del canvas");
        return;
    }
    
    // Verificar que CONFIG esté disponible
    if (typeof CONFIG === 'undefined') {
        console.error("❌ Error: CONFIG no está definido. Asegúrate de que config.js se carga primero");
        return;
    }
    
    // Configurar canvas inicial
    setupCanvas();
    
    // Crear instancia del juego
    try {
        gameInstance = new Game(canvas, ctx, CONFIG);
        gameInstance.init();
        console.log("✅ Juego inicializado exitosamente");
    } catch (error) {
        console.error("❌ Error al inicializar el juego:", error);
        return;
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log("🎮 ¡Space Horde Survivor listo para jugar!");
}

/**
 * Configura el canvas con las dimensiones correctas
 */
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Configuraciones adicionales del contexto
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    console.log(`📐 Canvas configurado: ${canvas.width}x${canvas.height}`);
}

/**
 * Configura todos los event listeners del juego
 */
function setupEventListeners() {
    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', handleWindowResize);
    
    // Manejar controles de teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Prevenir menú contextual en el canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Manejar pérdida/ganancia de foco
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    console.log("🎛️ Event listeners configurados");
}

/**
 * Maneja el redimensionamiento de la ventana
 */
function handleWindowResize() {
    if (!gameInstance || !canvas) return;
    
    // Actualizar dimensiones del canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Actualizar configuración
            CONFIG.CANVAS.WIDTH = canvas.width;
        CONFIG.CANVAS.HEIGHT = canvas.height;
    
    // Notificar al juego del cambio
    if (gameInstance.resizeCanvas) {
        gameInstance.resizeCanvas();
    }
    
    console.log(`📐 Ventana redimensionada: ${canvas.width}x${canvas.height}`);
}

/**
 * Maneja las pulsaciones de teclado globales
 */
function handleKeyDown(event) {
    if (!gameInstance) return;
    
    // Primero verificar si es entrada para power-ups
    if (gameInstance.handlePowerUpKeyInput && gameInstance.handlePowerUpKeyInput(event.code, true)) {
        event.preventDefault();
        return;
    }
    
    switch (event.code) {
        case 'Escape':
            // Alternar pausa con ESC
            gameInstance.togglePause();
            event.preventDefault();
            break;
            
        case 'F11':
            // Permitir pantalla completa
            break;
            
        default:
            // Pasar teclas de movimiento al juego
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                gameInstance.handleKeyInput(event.code, true);
                event.preventDefault();
            }
            
            // Prevenir otros comportamientos por defecto
            if (['Space', 'Enter'].includes(event.code)) {
                event.preventDefault();
            }
            break;
    }
}

/**
 * Maneja la liberación de teclas
 */
function handleKeyUp(event) {
    if (!gameInstance) return;
    
    // Pasar teclas de movimiento al juego
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        gameInstance.handleKeyInput(event.code, false);
        event.preventDefault();
    }
}

/**
 * Pausa el juego cuando la ventana pierde el foco
 */
function handleWindowBlur() {
    if (gameInstance && gameInstance.gameRunning) {
        gameInstance.setGameRunning(false);
        console.log("🔇 Juego pausado por pérdida de foco");
    }
}

/**
 * Reanuda el juego cuando la ventana recupera el foco
 */
function handleWindowFocus() {
    // No reanudar automáticamente - dejar que el jugador decida con ESC
    console.log("🔊 Ventana recuperó el foco - presiona ESC para reanudar");
}

/**
 * Maneja errores globales de JavaScript
 */
window.addEventListener('error', (event) => {
    console.error("❌ Error global capturado:", event.error);
    
    // Si el juego está corriendo, pausarlo por seguridad
    if (gameInstance && gameInstance.gameRunning) {
        gameInstance.setGameRunning(false);
        console.log("⏸️ Juego pausado debido a error");
    }
});

/**
 * Inicializar cuando el DOM esté listo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM ya está listo
    initGame();
}

console.log("✅ main.js cargado correctamente"); 