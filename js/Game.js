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
        this.enemies = [];
        this.enemyWaveManager = null;
        this.powerUpSystem = null;
        this.fleetManager = null;
        
        // Recursos
        this.materials = 0;
        
        // Object Pools
        this.materialPool = null;
        
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
        // Si estamos pausados para selección de power-up, solo actualizar materiales
        if (this.gameState === 'PAUSED_FOR_LEVEL_UP') {
            this.updateMaterials(deltaTime);
            return;
        }
        
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
        
        // Actualizar enemigos
        this.updateEnemies(deltaTime);
        
        // Actualizar flota aliada
        if (this.fleetManager) {
            this.fleetManager.update(deltaTime);
        }
        
        // Actualizar proyectiles
        this.updateProjectiles(deltaTime);
        
        // Actualizar explosiones
        this.updateExplosions(deltaTime);
        
        // Actualizar materiales
        this.updateMaterials(deltaTime);
        
        // Recolectar materiales
        this.collectMaterials();
        
        // Actualizar sistema de oleadas
        if (this.enemyWaveManager) {
            this.enemyWaveManager.update(deltaTime);
        }
        
        // Detectar colisiones
        this.detectCollisions();
    }
    
    /**
     * Renderiza el frame actual
     */
    render() {
        // Limpiar canvas (OBLIGATORIO al inicio de cada render)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar entidades en orden de capas
        
        // Renderizar explosiones (fondo)
        this.renderExplosions();
        
        // Renderizar materiales
        this.renderMaterials();
        
        // Renderizar enemigos
        this.renderEnemies();
        
        // Renderizar flota aliada
        if (this.fleetManager) {
            this.fleetManager.render(this.ctx);
        }
        
        // Renderizar comandante
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        // Renderizar proyectiles (primer plano)
        this.renderProjectiles();
        
        // Renderizar HUD
        this.renderHUD();
        
        // Renderizar UI de power-ups si está activa
        if (this.gameState === 'PAUSED_FOR_LEVEL_UP' && this.powerUpSystem) {
            this.powerUpSystem.renderPowerUpSelectionUI(this.ctx);
        }
        
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
            
            // Información de disparo
            this.ctx.fillStyle = this.player.canFire() ? '#00FF00' : '#FF6666';
            this.ctx.fillText(`Disparo: ${this.player.canFire() ? 'LISTO' : this.player.fireCooldown.toFixed(1)}s`, 10, 65);
        }
        
        // Información de oleadas
        if (this.enemyWaveManager) {
            const waveInfo = this.enemyWaveManager.getWaveInfo();
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.fillText(`Oleada: ${waveInfo.currentWave}`, 10, 85);
            this.ctx.fillText(`Ciclo: ${waveInfo.currentCycle}`, 10, 105);
            this.ctx.fillText(`Enemigos: ${waveInfo.enemiesRemaining}`, 10, 125);
            
            // Mostrar countdown si estamos en pausa entre oleadas
            if (waveInfo.isInWaveBreak) {
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.fillText(`Siguiente oleada en: ${waveInfo.waveBreakTimeRemaining.toFixed(1)}s`, 10, 145);
            }
        }
        
        // Información de progresión
        if (this.powerUpSystem) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText(`Nivel: ${this.powerUpSystem.currentLevel}`, 10, 165);
            this.ctx.fillText(`XP: ${this.powerUpSystem.currentXP}/${this.powerUpSystem.xpToNextLevel}`, 10, 185);
            
            // Barra de progreso XP
            const xpProgress = this.powerUpSystem.getXPProgress();
            const barWidth = 200;
            const barHeight = 8;
            const barX = 10;
            const barY = 195;
            
            // Fondo de la barra
            this.ctx.fillStyle = '#333333';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Progreso
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(barX, barY, barWidth * xpProgress, barHeight);
            
            // Contorno
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
        
        // Materiales
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillText(`Materiales: ${this.materials}`, 10, 220);
        
        // Estadísticas de pools (más abajo)
        if (this.projectilePool) {
            const projectileStats = this.projectilePool.getStats();
            this.ctx.fillStyle = '#888888';
            this.ctx.font = '12px Courier New';
            this.ctx.fillText(`Proyectiles: ${projectileStats.activeCount}/${projectileStats.poolSize}`, 10, 185);
        }
        
        if (this.explosionPool) {
            const explosionStats = this.explosionPool.getStats();
            this.ctx.fillStyle = '#888888';
            this.ctx.fillText(`Explosiones: ${explosionStats.activeCount}/${explosionStats.poolSize}`, 10, 200);
        }
        
        // Controles (solo si está jugando)
        if (this.gameState === 'PLAYING') {
            this.ctx.font = '14px Courier New';
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.fillText('WASD / Flechas: Mover', 10, this.canvas.height - 80);
            this.ctx.fillText('Disparo: AUTOMÁTICO', 10, this.canvas.height - 60);
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
        
        // Mensajes de progreso de oleadas
        if (this.gameState === 'PLAYING' && this.enemyWaveManager) {
            const waveInfo = this.enemyWaveManager.getWaveInfo();
            
            // Mensaje cuando se completa una oleada
            if (waveInfo.isInWaveBreak) {
                this.ctx.fillStyle = '#00FF00';
                this.ctx.font = '24px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    '¡OLEADA COMPLETADA!', 
                    this.canvas.width / 2, 
                    this.canvas.height / 2 - 20
                );
                
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '16px Courier New';
                this.ctx.fillText(
                    `Preparando Oleada ${waveInfo.currentWave}...`, 
                    this.canvas.width / 2, 
                    this.canvas.height / 2 + 10
                );
                
                // Mensaje especial para cambio de ciclo
                if (waveInfo.currentWave === 1 && waveInfo.currentCycle > 1) {
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.font = '20px Courier New';
                    this.ctx.fillText(
                        `¡CICLO ${waveInfo.currentCycle} INICIADO!`, 
                        this.canvas.width / 2, 
                        this.canvas.height / 2 + 40
                    );
                    this.ctx.fillStyle = '#FFAA00';
                    this.ctx.font = '14px Courier New';
                    this.ctx.fillText(
                        'Los enemigos son más fuertes', 
                        this.canvas.width / 2, 
                        this.canvas.height / 2 + 60
                    );
                }
            }
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
        console.log("🔧 Inicializando sistemas del juego...");
        
        // Inicializar Object Pools
        this.initObjectPools();
        
        // Crear el comandante en el centro de la pantalla
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.player = new PlayerShip(centerX, centerY);
        
        // Asignar pool de proyectiles al comandante
        this.player.setProjectilePool(this.projectilePool);
        
        // Actualizar límites de pantalla del comandante
        this.player.updateScreenBounds(this.canvas.width, this.canvas.height);
        
        // Arrays para entidades del juego
        this.enemies = [];
        this.activeProjectiles = [];
        this.activeExplosions = [];
        
        // Inicializar FleetManager
        this.fleetManager = new FleetManager(this);
        this.fleetManager.init();
        
        // Asignar pools al FleetManager
        this.fleetManager.setProjectilePool(this.projectilePool);
        this.fleetManager.setExplosionPool(this.explosionPool);
        
        // Inicializar sistema de oleadas
        this.enemyWaveManager = new EnemyWaveManager(this, this.config);
        this.enemyWaveManager.init();
        
        // Inicializar sistema de power-ups
        this.powerUpSystem = new PowerUpSystem(this, this.config);
        this.powerUpSystem.init();
        
        // Añadir primera nave aliada de prueba para la Fase 5.2
        const testAlly = new AllyShip(this.player.position.x, this.player.position.y, this);
        testAlly.type = 'testFormationAlly';
        this.fleetManager.addShip(testAlly);
        
        console.log("✅ Sistemas básicos inicializados");
        console.log("👑 Comandante creado en el centro:", centerX, centerY);
    }
    
    /**
     * Inicializa los Object Pools
     */
    initObjectPools() {
        console.log("🏊 Inicializando Object Pools...");
        
        // Pool de proyectiles
        this.projectilePool = new ObjectPool(Projectile, CONFIG.POOL_SIZE_PROJECTILES);
        this.projectilePool.init();
        
        // Pool de explosiones
        this.explosionPool = new ObjectPool(Explosion, CONFIG.POOL_SIZE_EXPLOSIONS);
        this.explosionPool.init();
        
        // Pool de materiales
        this.materialPool = new ObjectPool(Material, CONFIG.POOL_SIZE_MATERIALS, this.config);
        this.materialPool.init();
        
        console.log("✅ Object Pools inicializados");
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
     * Establece el estado del juego
     * @param {string} newState - Nuevo estado del juego
     */
    setGameState(newState) {
        console.log(`🎮 Cambio de estado: ${this.gameState} → ${newState}`);
        this.gameState = newState;
    }
    
    /**
     * Maneja la entrada de teclado para el juego
     * @param {string} keyCode - Código de la tecla
     * @param {boolean} isPressed - Si la tecla está presionada
     */
    handleKeyInput(keyCode, isPressed) {
        this.keyboardState[keyCode] = isPressed;
    }
    
    /**
     * Actualiza todos los enemigos
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateEnemies(deltaTime) {
        // Actualizar enemigos activos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            // Eliminar enemigos muertos
            if (!enemy.isAlive) {
                console.log("👾 Enemigo eliminado del array");
                this.enemies.splice(i, 1);
            }
        }
    }
    
    /**
     * Actualiza todos los proyectiles
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateProjectiles(deltaTime) {
        const activeProjectiles = this.projectilePool.getActiveObjects();
        
        for (const projectile of activeProjectiles) {
            projectile.update(deltaTime);
        }
    }
    
    /**
     * Actualiza todas las explosiones
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateExplosions(deltaTime) {
        const activeExplosions = this.explosionPool.getActiveObjects();
        
        for (const explosion of activeExplosions) {
            explosion.update(deltaTime);
        }
    }
    
    /**
     * Detecta y procesa todas las colisiones
     */
    detectCollisions() {
        const activeProjectiles = this.projectilePool.getActiveObjects();
        
        // Colisiones proyectiles del jugador vs enemigos
        for (const projectile of activeProjectiles) {
            if (projectile.owner !== 'player') continue;
            
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (projectile.isColliding(enemy)) {
                    // Aplicar daño al enemigo
                    const wasDestroyed = enemy.takeDamage(projectile.damage);
                    
                    // Desactivar proyectil
                    this.projectilePool.release(projectile);
                    
                    // Si el enemigo fue destruido, crear explosión y notificar sistemas
                    if (wasDestroyed) {
                        this.createExplosion(enemy.position.x, enemy.position.y, enemy.radius);
                        
                        // Llamar al método onDestroy del enemigo para drop de materiales
                        if (enemy.onDestroy) {
                            enemy.onDestroy();
                        }
                        
                        // Añadir XP al jugador
                        if (this.powerUpSystem) {
                            this.powerUpSystem.addXP(enemy.xpValue || CONFIG.ENEMY_BASE_XP_VALUE);
                        }
                        
                        // Notificar al wave manager
                        if (this.enemyWaveManager) {
                            this.enemyWaveManager.onEnemyDestroyed();
                        }
                    }
                    
                    break; // Un proyectil solo puede golpear un enemigo
                }
            }
        }
        
        // Colisiones enemigos vs jugador
        for (const enemy of this.enemies) {
            if (enemy.isColliding(this.player)) {
                // El daño se maneja en EnemyShip.dealDamageToTarget()
                // Aquí solo detectamos la colisión
            }
        }
    }
    
    /**
     * Crea una explosión en la posición especificada
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} size - Tamaño de la explosión
     */
    createExplosion(x, y, size = 20) {
        const explosion = this.explosionPool.get();
        if (explosion) {
            explosion.activate(x, y, size);
        }
    }
    
    /**
     * Renderiza todos los enemigos
     */
    renderEnemies() {
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
    }
    
    /**
     * Renderiza todos los proyectiles
     */
    renderProjectiles() {
        const activeProjectiles = this.projectilePool.getActiveObjects();
        
        for (const projectile of activeProjectiles) {
            projectile.render(this.ctx);
        }
    }
    
    /**
     * Renderiza todas las explosiones
     */
    renderExplosions() {
        const activeExplosions = this.explosionPool.getActiveObjects();
        
        for (const explosion of activeExplosions) {
            explosion.render(this.ctx);
        }
    }
    
    /**
     * Actualiza todos los materiales
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateMaterials(deltaTime) {
        const activeMaterials = this.materialPool.getActiveObjects();
        
        for (const material of activeMaterials) {
            material.update(deltaTime);
        }
    }
    
    /**
     * Recolecta materiales cercanos al jugador
     */
    collectMaterials() {
        if (!this.player || !this.player.isAlive) return;
        
        const activeMaterials = this.materialPool.getActiveObjects();
        const collectionRadius = this.powerUpSystem ? this.powerUpSystem.collectionRadius : CONFIG.MATERIAL_COLLECTION_RADIUS;
        
        for (let i = activeMaterials.length - 1; i >= 0; i--) {
            const material = activeMaterials[i];
            
            if (material.isInCollectionRange(this.player.position, collectionRadius)) {
                // Aplicar multiplicador de materiales si existe
                const finalValue = this.powerUpSystem ? 
                    Math.floor(material.value * this.powerUpSystem.materialMultiplier) : 
                    material.value;
                
                this.materials += finalValue;
                this.materialPool.release(material);
                
                console.log(`💎 Material recolectado: +${finalValue} (Total: ${this.materials})`);
            }
        }
    }
    
    /**
     * Renderiza todos los materiales
     */
    renderMaterials() {
        const activeMaterials = this.materialPool.getActiveObjects();
        
        for (const material of activeMaterials) {
            material.render(this.ctx);
        }
    }
    
    /**
     * Maneja la selección de power-ups
     * @param {number} chosenIndex - Índice del power-up seleccionado
     */
    handlePowerUpSelection(chosenIndex) {
        if (this.powerUpSystem && this.gameState === 'PAUSED_FOR_LEVEL_UP') {
            this.powerUpSystem.applyPowerUp(chosenIndex);
        }
    }
    
    /**
     * Maneja entrada de teclado específica para power-ups
     * @param {string} keyCode - Código de la tecla
     * @param {boolean} isPressed - Si la tecla fue presionada
     * @returns {boolean} - true si la entrada fue manejada
     */
    handlePowerUpKeyInput(keyCode, isPressed) {
        if (!isPressed || !this.powerUpSystem) return false;
        
        return this.powerUpSystem.handleKeyInput(keyCode);
    }
    

}

console.log("✅ Game.js cargado correctamente"); 