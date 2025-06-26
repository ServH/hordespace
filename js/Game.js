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
        this.eventBus = new EventBus();
        this.spriteCache = new SpriteCache();
        this.keyboardState = {};
        
        // === SISTEMA DE CONTROL DE RATÓN (FASE 5.6) ===
        this.mousePosition = { x: 0, y: 0 };
        this.mouseAimActive = CONFIG.PLAYER.MOUSE_AIM_DEFAULT_ACTIVE;
        
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
            
            // === FASE 5.6: ACTUALIZAR APUNTADO CON RATÓN ===
            this.player.updateAim(this.mousePosition, this.mouseAimActive, deltaTime);
            
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
        // Limpieza de pantalla condicional al estado del juego
        if (this.gameState === 'PLAYING') {
            // Si estamos jugando, aplicamos el efecto de estela (fading overlay)
            this.ctx.fillStyle = 'rgba(0, 5, 15, 0.25)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Si estamos en cualquier otro estado (PAUSED, GAME_OVER, PAUSED_FOR_LEVEL_UP),
            // limpiamos la pantalla de forma normal con un fondo sólido.
            this.ctx.fillStyle = '#00050F'; // Un color de fondo sólido y oscuro
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
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
        
        // Pre-renderizar assets para optimización
        this.preRenderAssets();
        
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
        this.enemyWaveManager = new EnemyWaveManager(this, this.config, this.eventBus);
        this.enemyWaveManager.init();
        
        // Inicializar sistema de power-ups
        this.powerUpSystem = new PowerUpSystem(this, this.config, this.eventBus);
        this.powerUpSystem.init();
        
        // Suscribirse a eventos para efectos visuales
        this.eventBus.subscribe('enemy:destroyed', (data) => {
            const { enemy, position, radius } = data;

            // Crear explosión
            this.createExplosion(position.x, position.y, radius);

            // Gestionar drop de materiales (lógica que estaba en enemy.onDestroy)
            if (enemy && typeof enemy.onDestroy === 'function') {
                enemy.onDestroy();
            }
        });
        
        // Las naves aliadas ahora se añaden únicamente a través de power-ups
        
        console.log("✅ Sistemas básicos inicializados");
        console.log("👑 Comandante creado en el centro:", centerX, centerY);
    }
    
    /**
     * Inicializa los Object Pools para entidades frecuentes
     */
    initObjectPools() {
        // ¡CRÍTICO! Corregir instanciación de projectilePool para pasar this
        this.projectilePool = new ObjectPool(Projectile, CONFIG.POOL_SIZES.PROJECTILES, this);
        this.explosionPool = new ObjectPool(Explosion, CONFIG.POOL_SIZES.EXPLOSIONS);
        this.materialPool = new ObjectPool(Material, CONFIG.POOL_SIZES.MATERIALS);
        
        console.log("🏊 Object Pools inicializados:", {
            projectiles: CONFIG.POOL_SIZES.PROJECTILES,
            explosions: CONFIG.POOL_SIZES.EXPLOSIONS,
            materials: CONFIG.POOL_SIZES.MATERIALS
        });
    }

    /**
     * Pre-renderiza todos los assets necesarios como sprites para optimización.
     */
    preRenderAssets() {
        console.log("🖌️ Pre-renderizando assets...");

        // Obtener las definiciones de los proyectiles desde CONFIG
        const projectileTypes = CONFIG.PROJECTILE.PROJECTILE_TYPES;

        for (const typeId in projectileTypes) {
            const def = projectileTypes[typeId];
            const size = (def.RADIUS * (def.GLOW_RADIUS_MULTIPLIER || 1)) * 2 + 4; // Tamaño del canvas basado en el radio + halo

            // Usamos una función anónima para pasar la lógica de dibujado
            this.spriteCache.preRender(def.VISUAL_TYPE, size, size, (ctx, w, h) => {
                // Movemos la lógica de dibujado de Projectile.js aquí
                // El centro del canvas es (w / 2, h / 2)
                const centerX = w / 2;
                const centerY = h / 2;

                // Copiamos y adaptamos la lógica del método render correspondiente de Projectile.js
                // NOTA: Reemplazamos this.position por el centro del canvas y this.radius por def.RADIUS, etc.
                switch (def.VISUAL_TYPE) {
                    case 'laser':
                        // El láser se dibuja verticalmente, luego lo rotamos al usarlo
                        const halfLength = def.RADIUS * 4 / 2;
                        ctx.strokeStyle = def.COLOR;
                        ctx.globalAlpha = 0.3;
                        ctx.lineWidth = def.LINE_WIDTH * def.GLOW_RADIUS_MULTIPLIER;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY - halfLength);
                        ctx.lineTo(centerX, centerY + halfLength);
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                        ctx.lineWidth = def.LINE_WIDTH * def.INNER_CORE_RADIUS_MULTIPLIER;
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY - halfLength);
                        ctx.lineTo(centerX, centerY + halfLength);
                        ctx.stroke();
                        break;
                    case 'orb':
                        const outerRadius = def.RADIUS * def.GLOW_RADIUS_MULTIPLIER;
                        const innerRadius = def.RADIUS * def.INNER_CORE_RADIUS_MULTIPLIER;
                        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius);
                        gradient.addColorStop(0, '#FFFFFF');
                        gradient.addColorStop(0.3, def.COLOR);
                        gradient.addColorStop(1, 'rgba(0,0,0,0)');
                        ctx.globalAlpha = 0.6;
                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                    case 'bullet':
                        const glowRadius = def.RADIUS * def.GLOW_RADIUS_MULTIPLIER;
                        const coreRadius = def.RADIUS * def.INNER_CORE_RADIUS_MULTIPLIER;
                        ctx.globalAlpha = 0.4;
                        ctx.fillStyle = def.COLOR;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                        ctx.fillStyle = def.COLOR;
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, def.RADIUS, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                }
            });
        }
    }
    
    /**
     * Ajusta el tamaño del canvas a la ventana
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Actualizar config con nuevas dimensiones
        this.config.CANVAS.WIDTH = this.canvas.width;
        this.config.CANVAS.HEIGHT = this.canvas.height;
        
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
        for (const projectile of this.projectilePool.pool) {
            if (!projectile.active) continue;
            projectile.update(deltaTime);
        }
    }
    
    /**
     * Actualiza todas las explosiones
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateExplosions(deltaTime) {
        for (const explosion of this.explosionPool.pool) {
            if (!explosion.active) continue;
            explosion.update(deltaTime);
        }
    }
    
    /**
     * Detecta y procesa todas las colisiones
     */
    detectCollisions() {
        // Colisiones proyectiles del jugador y aliados vs enemigos
        for (const projectile of this.projectilePool.pool) {
            if (!projectile.active) continue;
            // CORRECCIÓN CRÍTICA: Incluir proyectiles de aliados
            if (projectile.owner !== 'player' && projectile.owner !== 'ally') continue;
            
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (projectile.isColliding(enemy)) {
                    // Aplicar daño al enemigo
                    const wasDestroyed = enemy.takeDamage(projectile.damage);
                    
                    // Log de debug para proyectiles de aliados
                    if (projectile.owner === 'ally') {
                        console.log(`🎯 Proyectil aliado impacta enemigo: ${projectile.damage} daño, enemigo ${wasDestroyed ? 'destruido' : `${enemy.hp}/${enemy.maxHp} HP restante`}`);
                    }
                    
                    // Desactivar proyectil
                    this.projectilePool.release(projectile);
                    
                    // Si el enemigo fue destruido, publicar evento
                    if (wasDestroyed) {
                        // Publica un único evento con todos los datos necesarios
                        this.eventBus.publish('enemy:destroyed', {
                            enemy: enemy, // Pasamos el objeto entero por si es útil
                            xpValue: enemy.xpValue || CONFIG.ENEMY.DEFAULT.XP_VALUE,
                            position: { x: enemy.position.x, y: enemy.position.y },
                            radius: enemy.radius
                        });
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
        for (const projectile of this.projectilePool.pool) {
            if (!projectile.active) continue;

            const sprite = this.spriteCache.get(projectile.visualType);
            if (sprite) {
                const drawSize = (projectile.radius * projectile.glowRadiusMultiplier) * 2;
                const halfSize = drawSize / 2;

                // El láser es el único que necesita rotación
                if (projectile.visualType === 'laser') {
                    this.ctx.save();
                    this.ctx.translate(projectile.position.x, projectile.position.y);
                    this.ctx.rotate(projectile.angle);
                    this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                    this.ctx.restore();
                } else {
                    this.ctx.drawImage(sprite, projectile.position.x - halfSize, projectile.position.y - halfSize, drawSize, drawSize);
                }
            }
        }
    }
    
    /**
     * Renderiza todas las explosiones
     */
    renderExplosions() {
        for (const explosion of this.explosionPool.pool) {
            if (!explosion.active) continue;
            explosion.render(this.ctx);
        }
    }
    
    /**
     * Actualiza todos los materiales
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateMaterials(deltaTime) {
        for (const material of this.materialPool.pool) {
            if (!material.active) continue;
            material.update(deltaTime);
        }
    }
    
    /**
     * Recolecta materiales cercanos al jugador
     */
    collectMaterials() {
        if (!this.player || !this.player.isAlive) return;
        
        const collectionRadius = this.powerUpSystem ? this.powerUpSystem.collectionRadius : CONFIG.MATERIAL.COLLECTION_RADIUS;
        
        for (const material of this.materialPool.pool) {
            if (!material.active) continue;
            
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
        for (const material of this.materialPool.pool) {
            if (!material.active) continue;
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
    
    // === MÉTODOS DE CONTROL DE RATÓN (FASE 5.6) ===
    
    /**
     * Maneja el movimiento del ratón
     * @param {number} mouseX - Posición X del ratón en el canvas
     * @param {number} mouseY - Posición Y del ratón en el canvas
     */
    handleMouseMove(mouseX, mouseY) {
        this.mousePosition.x = mouseX;
        this.mousePosition.y = mouseY;
    }
    
    /**
     * Alterna el control de apuntado con ratón
     */
    toggleMouseAim() {
        this.mouseAimActive = !this.mouseAimActive;
        console.log(`🖱️ Control de ratón ${this.mouseAimActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }

}

console.log("✅ Game.js cargado correctamente"); 