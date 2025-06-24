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
        
        // Entidades del juego
        this.player = null;
        
        // Sistema de entrada
        this.keyboardState = {};
        
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
        
        // Actualizar comandante
        if (this.player) {
            // Pasar estado del teclado al comandante
            this.player.handleInput(this.keyboardState);
            
            // Actualizar comandante
            this.player.update(deltaTime);
            
            // Verificar si el comandante fue destruido
            if (!this.player.isAlive && this.gameState === 'PLAYING') {
                this.gameState = 'GAME_OVER';
                console.log("💀 Game Over - El Comandante ha sido destruido");
            }
        }
        
        // TODO: Actualizar entidades del juego (Fase 2+)
        // - Actualizar flota
        // - Actualizar enemigos
        // - Actualizar proyectiles
        // - Detectar colisiones
        // - Actualizar efectos
    }
    
    /**
     * Renderiza el frame actual
     */
    render() {
        // Limpiar canvas (OBLIGATORIO al inicio de cada render)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // TODO: Renderizar entidades del juego (Fase 2+)
        // - Renderizar fondo espacial
        // - Renderizar enemigos
        // - Renderizar flota
        // - Renderizar proyectiles
        // - Renderizar efectos
        
        // Renderizar comandante
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Renderizar HUD
        this.renderHUD();
        
        // Renderizar información de debug
        this.renderDebugInfo();
    }
    
    /**
     * Renderiza el HUD del juego
     */
    renderHUD() {
        this.ctx.save();
        
        // Configuración base del texto
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'left';
        
        // HP del comandante
        if (this.player) {
            const healthRatio = this.player.hp / this.player.maxHp;
            const healthColor = healthRatio > 0.6 ? '#00FF00' : healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
            
            this.ctx.fillStyle = healthColor;
            this.ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 10, 25);
            
            // Velocidad actual
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(`Velocidad: ${this.player.getCurrentSpeed().toFixed(0)}`, 10, 45);
        }
        
        // Estado del juego
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText(`Estado: ${this.gameState}`, 10, 65);
        
        // Controles (solo si está jugando)
        if (this.gameState === 'PLAYING') {
            this.ctx.font = '14px Courier New';
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.fillText('WASD / Flechas: Mover', 10, this.canvas.height - 60);
            this.ctx.fillText('ESC: Pausar', 10, this.canvas.height - 40);
        }
        
        // Mensaje de Game Over
        if (this.gameState === 'GAME_OVER') {
            this.ctx.font = '32px Courier New';
            this.ctx.fillStyle = '#FF0000';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '16px Courier New';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText('Presiona F5 para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Renderiza información de debug en pantalla
     */
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '14px Courier New';
        this.ctx.textAlign = 'right';
        
        const rightX = this.canvas.width - 10;
        let y = 25;
        
        // Mostrar FPS
        this.ctx.fillText(`FPS: ${this.fpsDisplay}`, rightX, y);
        y += 20;
        
        // Debug del comandante si existe
        if (this.player) {
            const debugInfo = this.player.getDebugInfo();
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillText(`Pos: ${debugInfo.position}`, rightX, y);
            y += 15;
            this.ctx.fillText(`Vel: ${debugInfo.velocity}`, rightX, y);
            y += 15;
            this.ctx.fillText(`Ángulo: ${debugInfo.angle}`, rightX, y);
            y += 15;
            this.ctx.fillText(`Propulsión: ${debugInfo.thrust}`, rightX, y);
        }
        
        // Mensaje de fase completada
        if (this.gameState === 'PLAYING') {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '18px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                'Fase 1: Comandante Implementado', 
                this.canvas.width / 2, 
                50
            );
        }
        
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
     * Inicializa los sistemas del juego
     */
    initGameSystems() {
        // Crear el comandante en el centro de la pantalla
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.player = new PlayerShip(centerX, centerY);
        
        // Actualizar límites de pantalla del comandante
        this.player.updateScreenBounds(this.canvas.width, this.canvas.height);
        
        console.log("🔧 Sistemas del juego inicializados");
        console.log("👑 Comandante creado en el centro:", centerX, centerY);
        
        // TODO: Inicializar sistemas en fases futuras
        // - FleetManager
        // - EnemyWaveManager
        // - PowerUpSystem
        // - CommanderAbilities
        // - ObjectPools
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
        
        // Actualizar límites del comandante si existe
        if (this.player) {
            this.player.updateScreenBounds(this.canvas.width, this.canvas.height);
        }
        
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
    
    /**
     * Maneja la entrada de teclado para el juego
     * @param {string} keyCode - Código de la tecla
     * @param {boolean} isPressed - Si la tecla está presionada
     */
    handleKeyInput(keyCode, isPressed) {
        this.keyboardState[keyCode] = isPressed;
    }
}

console.log("✅ Game.js cargado correctamente"); 