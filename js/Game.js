/**
 * Space Horde Survivor - Clase Game Principal
 * Orquesta el bucle principal del juego y gestiona estados
 */

import EntityManager from './EntityManager.js';
import TransformComponent from './components/TransformComponent.js';
import HealthComponent from './components/HealthComponent.js';
import PlayerControlledComponent from './components/PlayerControlledComponent.js';
import WeaponComponent from './components/WeaponComponent.js';
import CollisionComponent from './components/CollisionComponent.js';
import RenderComponent from './components/RenderComponent.js';
import PhysicsSystem from './systems/PhysicsSystem.js';
import ProjectileMovementSystem from './systems/ProjectileMovementSystem.js';
import LifetimeSystem from './systems/LifetimeSystem.js';
import ProjectileRenderSystem from './systems/ProjectileRenderSystem.js';
import PlayerInputSystem from './systems/PlayerInputSystem.js';
import AimSystem from './systems/AimSystem.js';
import BoundsSystem from './systems/BoundsSystem.js';
import WeaponSystem from './systems/WeaponSystem.js';
import ProjectileFactory from './factories/ProjectileFactory.js';
import EnemyFactory from './factories/EnemyFactory.js';
import AllyFactory from './factories/AllyFactory.js';
import EnemyAISystem from './systems/EnemyAISystem.js';
import EnemyRenderSystem from './systems/EnemyRenderSystem.js';
import PlayerRenderSystem from './systems/PlayerRenderSystem.js';
import InvincibilitySystem from './systems/InvincibilitySystem.js';
import CollisionSystem from './systems/CollisionSystem.js';
import DamageSystem from './systems/DamageSystem.js';
import MaterialDropSystem from './systems/MaterialDropSystem.js';
import FleetSystem from './systems/FleetSystem.js';
import FormationMovementSystem from './systems/FormationMovementSystem.js';
import AllyCombatAISystem from './systems/AllyCombatAISystem.js';
import AllyRenderSystem from './systems/AllyRenderSystem.js';
import PhysicsComponent from './components/PhysicsComponent.js';
import EventBus from './EventBus.js';
import SpriteCache from './SpriteCache.js';
import PlayerShip from './PlayerShip.js';
import EnemyWaveManager from './EnemyWaveManager.js';
import PowerUpSystem from './PowerUpSystem.js';
import ObjectPool from './ObjectPool.js';
import Projectile from './Projectile.js';
import Explosion from './Explosion.js';
import Material from './Material.js';

export default class Game {
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
        
        // Recursos
        this.materials = 0;
        
        // Object Pools
        this.materialPool = null;
        
        // Sistema de entrada
        this.eventBus = new EventBus();
        this.spriteCache = new SpriteCache();
        this.keyboardState = {};
        
        // === NUEVO SISTEMA ECS ===
        this.entityManager = new EntityManager();
        this.logicSystems = []; // Sistemas de lógica (update)
        this.renderSystems = []; // Sistemas de renderizado (render)
        
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
        
        // Verificar si el jugador fue destruido
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, HealthComponent);
        if (playerEntities.length > 0) {
            const playerHealth = this.entityManager.getComponent(playerEntities[0], HealthComponent);
            if (playerHealth.hp <= 0 && this.gameState === 'PLAYING') {
                this.gameState = 'GAME_OVER';
                console.log("💀 Game Over - El Comandante ha sido destruido");
            }
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
        
        // --- ACTUALIZAR TODOS LOS SISTEMAS DE LÓGICA ECS ---
        for (const system of this.logicSystems) {
            system.update(deltaTime);
        }
    }
    
    /**
     * Renderiza el frame actual
     */
    render() {
        // Primero, determinamos si se está mostrando una UI que ocupa toda la pantalla.
        const isShowingFullScreenUI = this.gameState === 'PAUSED_FOR_LEVEL_UP' ||
                                    this.gameState === 'GAME_OVER' ||
                                    (this.enemyWaveManager && this.enemyWaveManager.isInWaveBreak);

        if (this.gameState === 'PLAYING' && !isShowingFullScreenUI) {
            // Si estamos jugando Y NO estamos mostrando una UI a pantalla completa...
            // aplicamos el efecto de estela (fading overlay).
            this.ctx.fillStyle = 'rgba(0, 5, 15, 0.25)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            // Para cualquier otro caso (pausa, game over, UI de power-ups, UI de fin de oleada)...
            // limpiamos la pantalla de forma normal con un fondo sólido.
            this.ctx.fillStyle = '#00050F'; // Un color de fondo sólido y oscuro
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Renderizar entidades en orden de capas
        
        // Renderizar explosiones (fondo)
        this.renderExplosions();
        
        // Renderizar materiales
        this.renderMaterials();
        
        // --- RENDERIZADO DE ENTIDADES MEDIANTE SISTEMAS ECS ---
        for (const system of this.renderSystems) {
            system.render(); // Los sistemas de renderizado usan render()
        }
        
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
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px "Share Tech Mono", monospace';
        this.ctx.textAlign = 'left';
        
        // --- Obtención de datos desde el EntityManager ---
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent);
        
        // Declaramos TODAS las variables aquí arriba, con un valor inicial null.
        let playerId = null;
        let playerHealth = null;
        let playerTransform = null;

        if (playerEntities.length > 0) {
            // Asignamos el valor a la variable ya declarada.
            playerId = playerEntities[0];
            playerHealth = this.entityManager.getComponent(playerId, HealthComponent);
            playerTransform = this.entityManager.getComponent(playerId, TransformComponent);
        }

        // --- Renderizado del HUD ---
        // El resto del código ahora puede usar las variables de forma segura,
        // siempre y cuando compruebe si son null.
        if (playerHealth && playerTransform) {
            // Barra de vida
            const healthRatio = playerHealth.hp / playerHealth.maxHp;
            const healthColor = healthRatio > 0.6 ? '#00FF00' : healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
            this.ctx.fillStyle = healthColor;
            const hpText = `HP: ${Math.round(playerHealth.hp)} / ${playerHealth.maxHp}`;
            this.ctx.fillText(hpText, 20, 30);

            // Velocidad
            const speed = Math.sqrt(playerTransform.velocity.x**2 + playerTransform.velocity.y**2);
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(`Velocidad: ${speed.toFixed(0)}`, 20, 50);

        } else {
            this.ctx.fillText("HP: -- / --", 20, 30);
            this.ctx.fillText("Velocidad: --", 20, 50);
        }

        // Renderizar información de la oleada (esta parte ya funcionaba bien)
        if (this.enemyWaveManager) {
            const waveInfo = this.enemyWaveManager.getWaveInfo();
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Oleada: ${waveInfo.currentWave} / Ciclo: ${waveInfo.currentCycle}`, this.canvas.width - 20, 30);
            const enemiesText = `Enemigos: ${waveInfo.enemiesRemaining}`;
            this.ctx.fillText(enemiesText, this.canvas.width - 20, 50);
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
        
        // Debug del comandante ECS
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length > 0) {
            const transform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillText(`Pos: (${transform.position.x.toFixed(0)}, ${transform.position.y.toFixed(0)})`, rightX, y);
            y += 15;
            this.ctx.fillText(`Vel: (${transform.velocity.x.toFixed(0)}, ${transform.velocity.y.toFixed(0)})`, rightX, y);
            y += 15;
            this.ctx.fillText(`Ángulo: ${(transform.angle * 180 / Math.PI).toFixed(0)}°`, rightX, y);
            y += 15;
            this.ctx.fillText(`Acel: (${transform.acceleration.x.toFixed(0)}, ${transform.acceleration.y.toFixed(0)})`, rightX, y);
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
        
        // --- INICIO DE LA NUEVA LÓGICA ECS ---
        const playerEntity = this.entityManager.createEntity();
        this.playerEntityId = playerEntity; // Guardamos la ID del jugador
        
        // --- Ensamblaje de la Entidad Jugador ---
        const playerDef = CONFIG.PLAYER;
        const playerTransform = new TransformComponent(centerX, centerY, 0, playerDef.RADIUS);
        
        this.entityManager.addComponent(this.playerEntityId, playerTransform);
        this.entityManager.addComponent(this.playerEntityId, new HealthComponent(playerDef.HP));
        this.entityManager.addComponent(this.playerEntityId, new PlayerControlledComponent());
        this.entityManager.addComponent(this.playerEntityId, new WeaponComponent(playerDef.FIRE_RATE, playerDef.PROJECTILE_TYPE_ID));
        this.entityManager.addComponent(this.playerEntityId, new CollisionComponent(playerDef.RADIUS, 'player'));
        this.entityManager.addComponent(this.playerEntityId, new RenderComponent('player_ship', playerDef.RADIUS));
        this.entityManager.addComponent(this.playerEntityId, new PhysicsComponent(playerDef.SPEED, playerDef.FRICTION));
        
        console.log(`✨ Entidad Jugador creada en ECS con ID: ${playerEntity}`);
        // --- FIN DE LA NUEVA LÓGICA ECS ---
        
        // Arrays para entidades del juego
        this.activeProjectiles = [];
        this.activeExplosions = [];
        
        // Inicializar sistema de oleadas
        this.enemyWaveManager = new EnemyWaveManager(this, this.config, this.eventBus);
        this.enemyWaveManager.init();
        
        // Inicializar sistema de power-ups
        this.powerUpSystem = new PowerUpSystem(this, this.config, this.eventBus);
        this.powerUpSystem.init();
        
        // Suscribirse a eventos para efectos visuales
        this.eventBus.subscribe('enemy:destroyed', (data) => {
            const { position, radius } = data;

            // Crear explosión
            this.createExplosion(position.x, position.y, radius);

            // Nota: Los materiales ahora se manejan a través del MaterialDropSystem
        });
        
        // Las naves aliadas ahora se añaden únicamente a través de power-ups
        
        // --- INICIALIZAR SISTEMAS DE LÓGICA ---
        // 1. INPUT: Recoger la intención del jugador.
        this.logicSystems.push(new PlayerInputSystem(this.entityManager, this.eventBus, this.keyboardState));

        // 2. AIM: Sistema de apuntado (ratón y alineación con velocidad).
        this.logicSystems.push(new AimSystem(this.entityManager, this.eventBus, this.mousePosition, this.mouseAimActive));

        // 3. BOUNDS: Sistema de límites de pantalla.
        this.logicSystems.push(new BoundsSystem(this.entityManager, this.eventBus));

        // 4. IA: Los sistemas de IA deciden qué hacer (aplican aceleración).
        this.logicSystems.push(new EnemyAISystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new AllyCombatAISystem(this.entityManager, this.eventBus));
        
        // 5. SISTEMAS DE FLOTA: Calculan formaciones y mueven aliados
        this.logicSystems.push(new FleetSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new FormationMovementSystem(this.entityManager, this.eventBus));
        
        // 6. FÍSICA: El motor de física mueve TODO según su aceleración y velocidad.
        this.logicSystems.push(new PhysicsSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new ProjectileMovementSystem(this.entityManager, this.eventBus));
        
        // 7. LÓGICA DE JUEGO: Sistemas que dependen de las nuevas posiciones.
        this.logicSystems.push(new CollisionSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new DamageSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new WeaponSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new InvincibilitySystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new LifetimeSystem(this.entityManager, this.eventBus));
        this.logicSystems.push(new MaterialDropSystem(this.entityManager, this.eventBus, this.materialPool));
        
        console.log(`⚙️ Sistemas de lógica ECS inicializados: ${this.logicSystems.length}`);
        
        // --- INICIALIZAR SISTEMAS DE RENDERIZADO ---
        this.renderSystems.push(new ProjectileRenderSystem(this.entityManager, this.eventBus, this.ctx, this.spriteCache));
        this.renderSystems.push(new EnemyRenderSystem(this.entityManager, this.eventBus, this.ctx));
        this.renderSystems.push(new PlayerRenderSystem(this.entityManager, this.eventBus, this.ctx));
        this.renderSystems.push(new AllyRenderSystem(this.entityManager, this.eventBus, this.ctx));
        console.log(`🎨 Sistemas de renderizado ECS inicializados: ${this.renderSystems.length}`);
        
        // --- INICIALIZAR FACTORIES ---
        this.projectileFactory = new ProjectileFactory(this.entityManager, this.eventBus);
        this.enemyFactory = new EnemyFactory(this.entityManager, this.eventBus);
        this.allyFactory = new AllyFactory(this.entityManager, this.eventBus);
        
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
        const oldState = this.gameState;
        console.log(`🎮 Cambio de estado: ${oldState} → ${newState}`);
        this.gameState = newState;

        // ¡AQUÍ ESTÁ LA LÓGICA CLAVE!
        // Si estamos volviendo al juego DESDE un estado de UI a pantalla completa,
        // forzamos una limpieza total del canvas UNA SOLA VEZ para borrar el "fantasma" de la UI.
        const wasShowingUI = oldState === 'PAUSED_FOR_LEVEL_UP' || oldState === 'GAME_OVER';

        if (newState === 'PLAYING' && wasShowingUI) {
            console.log("🧼 Forzando limpieza de canvas para eliminar fantasma de UI.");
            this.ctx.fillStyle = '#00050F'; // El mismo color de fondo sólido
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
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
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        
        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
        const collectionRadius = this.powerUpSystem ? this.powerUpSystem.collectionRadius : CONFIG.MATERIAL.COLLECTION_RADIUS;
        
        for (const material of this.materialPool.pool) {
            if (!material.active) continue;
            
            if (material.isInCollectionRange(playerTransform.position, collectionRadius)) {
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