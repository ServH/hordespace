// Archivo: js/pruebas_main.js
// Banco de Pruebas para optimización del comportamiento de la flota

import Game from '../js/Game.js';

let gameInstance = null;
let gui = null;

// 1. Inicializar el juego en modo banco de pruebas
function initTestbed() {
    console.log("🚀 INICIANDO BANCO DE PRUEBAS DE FLOTA 🚀");
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas para pantalla completa
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Crear instancia del juego
    gameInstance = new Game(canvas, ctx, CONFIG);
    gameInstance.init();
    
    // 2. Crear escenario de prueba específico
    createTestScenario();
    
    // 3. Configurar panel de control
    setupGUI();
    
    // 4. Configurar event listeners
    setupEventListeners();
    
    // 5. Iniciar bucle de juego
    gameInstance.start();
    
    console.log("✅ Banco de pruebas iniciado correctamente");
}

// Función para crear el escenario de prueba
function createTestScenario() {
    console.log("🎯 Creando escenario de prueba...");
    
    // Crear jugador (Comandante) en el centro
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Crear jugador directamente usando el método del juego
    gameInstance.createPlayerEntity();
    
    // Crear naves aliadas para la flota
    setTimeout(() => {
        gameInstance.eventBus.publish('debug:add_ship', { 
            shipType: 'scout',
            x: centerX - 100,
            y: centerY - 50
        });
        
        gameInstance.eventBus.publish('debug:add_ship', { 
            shipType: 'gunship',
            x: centerX + 100,
            y: centerY - 50
        });
        
        console.log("✅ Naves aliadas creadas");
    }, 100);
    
    // Desactivar spawn de enemigos
    if (gameInstance.gameDirector) {
        gameInstance.gameDirector.enabled = false;
        console.log("✔️ GameDirector desactivado. No aparecerán enemigos.");
    }
}

// Función para configurar el panel de control interactivo
function setupGUI() {
    console.log("🎛️ Configurando panel de control...");
    
    gui = new dat.GUI();
    
    // Crear objeto de configuración para la flota
    const fleetConfig = {
        FOLLOW_STRENGTH: CONFIG.FORMATION.FOLLOW_STRENGTH,
        MAX_CORRECTION_FORCE: CONFIG.FORMATION.MAX_CORRECTION_FORCE,
        DAMPING: CONFIG.FORMATION.DAMPING,
        SMOOTHING_FACTOR: CONFIG.FORMATION.SMOOTHING_FACTOR,
        FORMATION_DISTANCE: CONFIG.FORMATION.FORMATION_DISTANCE || 80,
        MAX_SPEED: CONFIG.FORMATION.MAX_SPEED || 300
    };
    
    // Carpeta para comportamiento de la flota
    const fleetFolder = gui.addFolder('Comportamiento de la Flota');
    
    // Sliders para ajustar parámetros en tiempo real
    const followStrengthController = fleetFolder.add(fleetConfig, 'FOLLOW_STRENGTH', 100, 5000, 50)
        .name('Fuerza de Seguimiento')
        .onChange((value) => {
            CONFIG.FORMATION.FOLLOW_STRENGTH = value;
            console.log(`🔄 Fuerza de seguimiento: ${value}`);
        });
    
    const maxForceController = fleetFolder.add(fleetConfig, 'MAX_CORRECTION_FORCE', 5000, 50000, 500)
        .name('Fuerza Máxima')
        .onChange((value) => {
            CONFIG.FORMATION.MAX_CORRECTION_FORCE = value;
            console.log(`🔄 Fuerza máxima: ${value}`);
        });
    
    const dampingController = fleetFolder.add(fleetConfig, 'DAMPING', 0.80, 0.99, 0.01)
        .name('Amortiguación')
        .onChange((value) => {
            CONFIG.FORMATION.DAMPING = value;
            console.log(`🔄 Amortiguación: ${value}`);
        });
    
    const smoothingController = fleetFolder.add(fleetConfig, 'SMOOTHING_FACTOR', 0, 2, 0.05)
        .name('Suavizado')
        .onChange((value) => {
            CONFIG.FORMATION.SMOOTHING_FACTOR = value;
            console.log(`🔄 Suavizado: ${value}`);
        });
    
    const distanceController = fleetFolder.add(fleetConfig, 'FORMATION_DISTANCE', 50, 200, 5)
        .name('Distancia de Formación')
        .onChange((value) => {
            CONFIG.FORMATION.FORMATION_DISTANCE = value;
            console.log(`🔄 Distancia de formación: ${value}`);
        });
    
    const speedController = fleetFolder.add(fleetConfig, 'MAX_SPEED', 100, 500, 10)
        .name('Velocidad Máxima')
        .onChange((value) => {
            CONFIG.FORMATION.MAX_SPEED = value;
            console.log(`🔄 Velocidad máxima: ${value}`);
        });
    
    fleetFolder.open(); // Dejar la carpeta abierta por defecto
    
    // Controles de utilidad
    const utilityFolder = gui.addFolder('Utilidades');
    
    // Botón para exportar valores optimizados
    const exportControls = {
        exportValues: () => {
            const valuesToExport = {
                FOLLOW_STRENGTH: CONFIG.FORMATION.FOLLOW_STRENGTH,
                MAX_CORRECTION_FORCE: CONFIG.FORMATION.MAX_CORRECTION_FORCE,
                DAMPING: CONFIG.FORMATION.DAMPING,
                SMOOTHING_FACTOR: CONFIG.FORMATION.SMOOTHING_FACTOR,
                FORMATION_DISTANCE: CONFIG.FORMATION.FORMATION_DISTANCE,
                MAX_SPEED: CONFIG.FORMATION.MAX_SPEED
            };
            
            console.log("📋 VALORES OPTIMIZADOS (copia y pega en config.js):");
            console.log("CONFIG.FORMATION = {");
            Object.entries(valuesToExport).forEach(([key, value]) => {
                console.log(`    ${key}: ${value},`);
            });
            console.log("};");
            
            // También mostrar como JSON para facilitar la copia
            console.log("📋 JSON para copia rápida:");
            console.log(JSON.stringify(valuesToExport, null, 4));
        },
        
        resetToDefaults: () => {
            CONFIG.FORMATION.FOLLOW_STRENGTH = 1000;
            CONFIG.FORMATION.MAX_CORRECTION_FORCE = 15000;
            CONFIG.FORMATION.DAMPING = 0.85;
            CONFIG.FORMATION.SMOOTHING_FACTOR = 0.5;
            CONFIG.FORMATION.FORMATION_DISTANCE = 80;
            CONFIG.FORMATION.MAX_SPEED = 300;
            
            // Actualizar sliders
            followStrengthController.setValue(1000);
            maxForceController.setValue(15000);
            dampingController.setValue(0.85);
            smoothingController.setValue(0.5);
            distanceController.setValue(80);
            speedController.setValue(300);
            
            console.log("🔄 Valores restablecidos a predeterminados");
        },
        
        addMoreShips: () => {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            gameInstance.eventBus.publish('debug:add_ship', { 
                shipType: 'scout',
                x: centerX + Math.random() * 200 - 100,
                y: centerY + Math.random() * 200 - 100
            });
            
            console.log("🚀 Nave adicional creada");
        }
    };
    
    utilityFolder.add(exportControls, 'exportValues').name('📋 Exportar Valores');
    utilityFolder.add(exportControls, 'resetToDefaults').name('🔄 Restablecer');
    utilityFolder.add(exportControls, 'addMoreShips').name('🚀 Añadir Nave');
    
    utilityFolder.open();
    
    console.log("✅ Panel de control configurado");
}

// === COPIA DE EVENT LISTENERS DESDE main.js ===
function setupEventListeners() {
    // Manejar redimensionamiento de ventana
    window.addEventListener('resize', handleWindowResize);
    // Manejar controles de teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    // Mouse
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    console.log('🎛️ Event listeners configurados (testbed)');
}

function handleWindowResize() {
    if (!gameInstance || !gameInstance.canvas) return;
    gameInstance.canvas.width = window.innerWidth;
    gameInstance.canvas.height = window.innerHeight;
    if (gameInstance.resizeCanvas) {
        gameInstance.resizeCanvas();
    }
    console.log(`📐 Ventana redimensionada: ${window.innerWidth}x${window.innerHeight}`);
}

function handleKeyDown(event) {
    if (!gameInstance) return;
    if (gameInstance.handlePowerUpKeyInput && gameInstance.handlePowerUpKeyInput(event.code, true)) {
        event.preventDefault();
        return;
    }
    // --- INICIO DE LA CORRECCIÓN ---
    const trackedKeys = [
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'ArrowUp', 'ArrowDown',
        CONFIG.PLAYER.ABILITIES.DASH.KEY,
        CONFIG.PLAYER.ABILITIES.BRAKE.KEY
    ];
    if (trackedKeys.includes(event.code)) {
        gameInstance.handleKeyInput(event.code, true);
        event.preventDefault();
        return;
    }
    switch (event.code) {
        case 'Escape':
            gameInstance.togglePause();
            event.preventDefault();
            break;
    }
}

function handleKeyUp(event) {
    if (!gameInstance) return;
    if (gameInstance.handlePowerUpKeyInput && gameInstance.handlePowerUpKeyInput(event.code, false)) {
        event.preventDefault();
        return;
    }
    const trackedKeys = [
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'ArrowUp', 'ArrowDown',
        CONFIG.PLAYER.ABILITIES.DASH.KEY,
        CONFIG.PLAYER.ABILITIES.BRAKE.KEY
    ];
    if (trackedKeys.includes(event.code)) {
        gameInstance.handleKeyInput(event.code, false);
        event.preventDefault();
        return;
    }
}

function handleMouseMove(event) {
    if (!gameInstance || !gameInstance.canvas) return;
    const rect = gameInstance.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (gameInstance.handleMouseMove) {
        gameInstance.handleMouseMove(mouseX, mouseY);
    }
}

function handleWindowBlur() {
    if (gameInstance && gameInstance.setGameRunning) {
        gameInstance.setGameRunning(false);
    }
}

function handleWindowFocus() {
    if (gameInstance && gameInstance.setGameRunning) {
        gameInstance.setGameRunning(true);
    }
}

// Manejar redimensionamiento de ventana
window.addEventListener('resize', () => {
    if (gameInstance && gameInstance.canvas) {
        gameInstance.canvas.width = window.innerWidth;
        gameInstance.canvas.height = window.innerHeight;
    }
});

// Iniciar banco de pruebas cuando se cargue la página
document.addEventListener('DOMContentLoaded', initTestbed); 