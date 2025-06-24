/**
 * Space Horde Survivor - Clase Game Principal
 * Orquesta el bucle principal del juego y gestiona estados
 */

class Game {
    constructor(canvas, ctx, config) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.config = config;
        
        // Control del bucle de juego
        this.gameRunning = false;
        this.lastUpdateTime = 0;
        this.deltaTime = 0;
        
        // Estados del juego
        this.gameState = 'PLAYING'; // PLAYING, PAUSED, GAME_OVER, HANGAR
        
        // Contadores de debug
        this.frameCount = 0;
        this.fpsDisplay = 0;
        this.lastFpsUpdate = 0;
        
        console.log("🎮 Game class inicializada");
    }
    
    /**
     * Inicializa el juego y comienza el bucle principal
     */
    init() {
        console.log("🚀 Iniciando Space Horde Survivor...");
        
        // Configurar canvas
        this.resizeCanvas();
        
        // Inicializar sistemas del juego (futuras fases)
        this.initGameSystems();
        
        // Comenzar el bucle principal
        this.gameRunning = true;
        this.lastUpdateTime = performance.now();
        this.gameLoop();
        
        console.log("✅ Juego iniciado correctamente");
    }
    
    /**
     * Bucle principal del juego usando requestAnimationFrame
     */
    gameLoop = (currentTime = performance.now()) => {
        // Verificar si el juego debe continuar ejecutándose
        if (!this.gameRunning) {
            console.log("⏸️ Game loop pausado");
            return;
        }
        
        // Calcular deltaTime en segundos
        this.deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        // Limitar deltaTime para evitar saltos grandes
        this.deltaTime = Math.min(this.deltaTime, 1/30); // máximo 30 FPS
        
        // Actualizar lógica del juego
        this.update(this.deltaTime);
        
        // Renderizar frame actual
        this.render();
        
        // Actualizar contador de FPS
        this.updateFPS(currentTime);
        
        // Continuar el bucle
        requestAnimationFrame(this.gameLoop);
    }
    
    /**
     * Actualiza toda la lógica del juego
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Solo procesar actualizaciones si estamos jugando
        if (this.gameState !== 'PLAYING') {
            return;
        }
        
        // TODO: Actualizar entidades del juego (Fase 1+)
        // - Actualizar comandante
        // - Actualizar flota
        // - Actualizar enemigos
        // - Actualizar proyectiles
        // - Detectar colisiones
        // - Actualizar efectos
        
        // Debug: mostrar que el update está funcionando
        if (this.frameCount % 60 === 0) {
            console.log(`🔄 Update ejecutándose - DeltaTime: ${deltaTime.toFixed(4)}s`);
        }
    }
    
    /**
     * Renderiza el frame actual
     */
    render() {
        // Limpiar canvas (OBLIGATORIO al inicio de cada render)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // TODO: Renderizar entidades del juego (Fase 1+)
        // - Renderizar fondo espacial
        // - Renderizar enemigos
        // - Renderizar comandante
        // - Renderizar flota
        // - Renderizar proyectiles
        // - Renderizar efectos
        // - Renderizar HUD
        
        // Renderizar información de debug temporal
        this.renderDebugInfo();
    }
    
    /**
     * Renderiza información de debug en pantalla
     */
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '16px Courier New';
        
        // Mostrar FPS
        this.ctx.fillText(`FPS: ${this.fpsDisplay}`, 10, 25);
        
        // Mostrar estado del juego
        this.ctx.fillText(`Estado: ${this.gameState}`, 10, 45);
        
        // Mostrar mensaje de funcionamiento
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            'Space Horde Survivor - Fase 0 Completada', 
            this.canvas.width / 2, 
            this.canvas.height / 2
        );
        this.ctx.fillText(
            'Presiona ESC para pausar/reanudar', 
            this.canvas.width / 2, 
            this.canvas.height / 2 + 30
        );
        
        this.ctx.restore();
    }
    
    /**
     * Actualiza el contador de FPS
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fpsDisplay = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }
    
    /**
     * Inicializa los sistemas del juego (placeholder para futuras fases)
     */
    initGameSystems() {
        // TODO: Inicializar sistemas en fases futuras
        // - FleetManager
        // - EnemyWaveManager
        // - PowerUpSystem
        // - CommanderAbilities
        // - ObjectPools
        
        console.log("🔧 Sistemas del juego inicializados (placeholder)");
    }
    
    /**
     * Ajusta el tamaño del canvas a la ventana
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Actualizar config con nuevas dimensiones
        this.config.CANVAS_WIDTH = this.canvas.width;
        this.config.CANVAS_HEIGHT = this.canvas.height;
        
        console.log(`📐 Canvas redimensionado: ${this.canvas.width}x${this.canvas.height}`);
    }
    
    /**
     * Controla el estado de ejecución del juego
     * @param {boolean} running - Si el juego debe ejecutarse
     */
    setGameRunning(running) {
        const wasRunning = this.gameRunning;
        this.gameRunning = running;
        
        if (!wasRunning && running) {
            // Reanudar: reiniciar el tiempo para evitar salto grande de deltaTime
            this.lastUpdateTime = performance.now();
            this.gameLoop();
            console.log("▶️ Juego reanudado");
        } else if (wasRunning && !running) {
            console.log("⏸️ Juego pausado");
        }
    }
    
    /**
     * Alterna entre pausado y ejecutándose
     */
    togglePause() {
        this.setGameRunning(!this.gameRunning);
    }
}

console.log("✅ Game.js cargado correctamente"); 