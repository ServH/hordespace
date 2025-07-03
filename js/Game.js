/**
 * Space Horde Survivor - Clase Game Principal
 * Orquesta el bucle principal del juego y gestiona estados
 */

// === IMPORTS CORE ===
import EntityManager from './EntityManager.js';
import EventBus from './EventBus.js';
import SpriteCache from './SpriteCache.js';
import DIContainer from './DIContainer.js';
import { registerServices } from './services.js';

// === IMPORTS COMPONENTES (para createPlayerEntity) ===
import TransformComponent from './components/TransformComponent.js';
import HealthComponent from './components/HealthComponent.js';
import PlayerControlledComponent from './components/PlayerControlledComponent.js';
import WeaponComponent from './components/WeaponComponent.js';
import CollisionComponent from './components/CollisionComponent.js';
import RenderComponent from './components/RenderComponent.js';
import PhysicsComponent from './components/PhysicsComponent.js';
import ThrusterComponent from './components/ThrusterComponent.js';
import TrailComponent from './components/TrailComponent.js';
import ParallaxLayerComponent from './components/ParallaxLayerComponent.js';
import EnemyComponent from './components/EnemyComponent.js';
import AbilitiesComponent from './components/AbilitiesComponent.js';

// === IMPORTS LEGACY (ObjectPools) ===
import ObjectPool from './ObjectPool.js';

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
        this.gameDirector = null;
        this.powerUpSystem = null;
        
        // Recursos
        this.materials = 0;
        
        // Sistema de entrada
        this.eventBus = new EventBus();
        this.spriteCache = new SpriteCache();
        this.keyboardState = {};
        
        // === NUEVO SISTEMA ECS ===
        this.entityManager = new EntityManager();
        this.logicSystems = []; // Sistemas de lógica (update)
        this.renderSystems = []; // Sistemas de renderizado (render)
        
        // === FASE 5: INYECCIÓN DE DEPENDENCIAS ===
        this.diContainer = new DIContainer();
        
        // === FASE 6: SISTEMA DE CÁMARA ===
        this.camera = {
            x: 0,
            y: 0,
            width: this.canvas.width,
            height: this.canvas.height
        };
        console.log("🎥 Cámara inicializada.");
        
        // === SISTEMA DE CONTROL DE APUNTADO (REFACTORIZADO) ===
        this.mousePosition = { x: 0, y: 0 };
        this.aimMode = CONFIG.PLAYER.AIM_DEFAULT_MODE;
        
        // Contadores de debug
        this.frameCount = 0;
        this.fpsDisplay = 0;
        this.lastFpsUpdate = 0;
        
        // Suscribirse a eventos de cambio de estado
        this.eventBus.subscribe('game:set_state', (newState) => this.setGameState(newState));
        
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

        // --- ¡EL CAMBIO CRÍTICO ESTÁ AQUÍ! ---
        // Actualizamos la cámara ANTES de que cualquier sistema de lógica se ejecute.
        // Ahora todos los sistemas (incluido EnemyWaveManager) trabajarán con la posición más reciente.
        const cameraPlayerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (cameraPlayerEntities.length > 0) {
            const playerTransform = this.entityManager.getComponent(cameraPlayerEntities[0], TransformComponent);
            
            // La cámara copia la posición del jugador en el mundo. Sin suavizado.
            // El jugador se mueve, la cámara lo sigue al instante.
            this.camera.x = playerTransform.position.x;
            this.camera.y = playerTransform.position.y;
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
        
        // Verificar victoria (sobrevivir 5 minutos)
        if (this.gameDirector && this.gameDirector.getGameTime() >= 300 && this.gameState === 'PLAYING') {
            this.gameState = 'VICTORY';
            console.log("🏆 ¡VICTORIA! Has sobrevivido 5 minutos.");
            return; // Detener la actualización
        }
        
        // Actualizar proyectiles
        this.updateProjectiles(deltaTime);
        
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
                                    this.gameState === 'VICTORY';

        // Limpiar completamente el canvas para una imagen nítida
        // Ahora que tenemos estelas de partículas dedicadas, no necesitamos el fading overlay global
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Solo para estados de UI, aplicamos un fondo sólido
        if (isShowingFullScreenUI) {
            this.ctx.fillStyle = '#00050F'; // Un color de fondo sólido y oscuro
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Renderizar entidades en orden de capas
        
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
        
        // Renderizar pantalla de victoria
        if (this.gameState === 'VICTORY') {
            this.renderVictoryScreen();
        }
        
        // Renderizar información de debug
        this.renderDebugInfo();
    }
    
    /**
     * Renderiza el HUD del juego
     */
    renderHUD() {
        this.ctx.save();
        this.ctx.font = '16px "Share Tech Mono", monospace';
        
        // --- INFORMACIÓN DEL JUGADOR ---
        this.ctx.textAlign = 'left';
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent);
        if (playerEntities.length > 0) {
            const playerId = playerEntities[0];
            const health = this.entityManager.getComponent(playerId, HealthComponent);
            const transform = this.entityManager.getComponent(playerId, TransformComponent);

            // Dibujar Vida (si el componente de vida existe)
            if (health) {
                const healthRatio = health.hp / health.maxHp;
                const healthColor = healthRatio > 0.6 ? '#00FF00' : healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
                this.ctx.fillStyle = healthColor;
                this.ctx.fillText(`HP: ${Math.round(health.hp)} / ${health.maxHp}`, 20, 30);
            }

            // Dibujar Velocidad (si el componente de transformación y su velocidad existen)
            if (transform && transform.velocity) {
                const speed = Math.hypot(transform.velocity.x, transform.velocity.y);
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(`Velocidad: ${speed.toFixed(0)}`, 20, 50);
            }
        } else {
            // Fallback si el jugador aún no ha sido creado en este frame
            this.ctx.fillStyle = 'white';
            this.ctx.fillText("HP: -- / --", 20, 30);
            this.ctx.fillText("Velocidad: --", 20, 50);
        }

        // --- INFORMACIÓN DEL DIRECTOR DE JUEGO ---
        if (this.gameDirector) {
            const gameTime = this.gameDirector.getGameTime();
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.font = 'bold 24px "Share Tech Mono", monospace';
            const minutes = Math.floor(gameTime / 60);
            const seconds = Math.floor(gameTime % 60);
            this.ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, 40);
        }

        // --- INFORMACIÓN DE LA FLOTA (si el sistema de flota existe) ---
        if (this.fleetSystem) {
            const fleetData = this.fleetSystem.getFleetData();
            const fleetKeys = Object.keys(fleetData);
            if (fleetKeys.length > 0) {
                this.ctx.textAlign = 'left';
                this.ctx.font = '14px "Share Tech Mono", monospace';
                this.ctx.fillStyle = '#CCCCCC';
                let startY = 80;
                this.ctx.fillText('FLOTA:', 20, startY);
                startY += 20;
                for (const shipType of fleetKeys) {
                    const count = fleetData[shipType];
                    const shipConfig = CONFIG.ALLY[shipType.toUpperCase()];
                    this.ctx.fillStyle = shipConfig ? shipConfig.COLOR : '#FFFFFF';
                    this.ctx.fillText(`- ${shipType.toUpperCase()} x${count}`, 30, startY);
                    startY += 18;
                }
            }
        }
        
        // --- INFORMACIÓN DEL MODO DE APUNTADO ---
        this.ctx.textAlign = 'right';
        this.ctx.font = '16px "Share Tech Mono", monospace';
        this.ctx.fillStyle = this.aimMode === 'MANUAL' ? '#00FFFF' : '#FFD700';
        this.ctx.fillText(`APUNTADO: ${this.aimMode}`, this.canvas.width - 20, this.canvas.height - 20);
        
        this.ctx.restore();
    }
    
    /**
     * Renderiza la pantalla de victoria
     */
    renderVictoryScreen() {
        this.ctx.save();
        
        // Fondo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Título de victoria
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px "Share Tech Mono", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡VICTORIA!', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        // Mensaje
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.font = '24px "Share Tech Mono", monospace';
        this.ctx.fillText('Has sobrevivido 5 minutos', this.canvas.width / 2, this.canvas.height / 2);
        
        // Tiempo final
        if (this.gameDirector) {
            const gameTime = this.gameDirector.getGameTime();
            const minutes = Math.floor(gameTime / 60);
            const seconds = Math.floor(gameTime % 60);
            this.ctx.fillText(`Tiempo final: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
        
        // Instrucciones
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '18px "Share Tech Mono", monospace';
        this.ctx.fillText('Presiona ESPACIO para reiniciar', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
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
        
        // Información del Game Director
        if (this.gameState === 'PLAYING' && this.gameDirector) {
            const difficultyInfo = this.gameDirector.getCurrentDifficultyInfo();
            const enemiesOnScreen = this.entityManager.getEntitiesWith(EnemyComponent).length;
            
            this.ctx.fillStyle = '#00FF00';
            this.ctx.font = '16px Courier New';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Tiempo: ${Math.floor(this.gameDirector.getGameTime())}s`, 10, 120);
            this.ctx.fillText(`Enemigos: ${enemiesOnScreen}/${difficultyInfo.maxEnemies}`, 10, 140);
            this.ctx.fillText(`Spawn Rate: ${difficultyInfo.spawnRate.toFixed(2)}/s`, 10, 160);
            this.ctx.fillText(`Dificultad: x${difficultyInfo.difficultyMultiplier.toFixed(2)}`, 10, 180);
            this.ctx.fillText(`Tipos: ${difficultyInfo.availableEnemyTypes.join(', ')}`, 10, 200);
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
     * MÉTODO FINAL: Inicialización Declarativa de Sistemas vía DI Container
     * Este método representa la culminación de la refactorización arquitectónica.
     * Game.js ya no "construye" dependencias - las "solicita" al contenedor.
     */
    initGameSystems() {
        console.log("🔧 Registrando y cableando sistemas vía DI Container...");

        // === PREPARACIÓN DE ASSETS Y POOLS ===
        this.preRenderAssets();
        this.initObjectPools();

        // === 1. REGISTRO DE INSTANCIAS ÚNICAS ===
        this.diContainer.instances.set('game', this);
        this.diContainer.instances.set('entityManager', this.entityManager);
        this.diContainer.instances.set('eventBus', this.eventBus);
        this.diContainer.instances.set('spriteCache', this.spriteCache);
        this.diContainer.instances.set('ctx', this.ctx);
        this.diContainer.instances.set('config', this.config);
        this.diContainer.instances.set('keyboardState', this.keyboardState);
        this.diContainer.instances.set('mousePosition', this.mousePosition);
        this.diContainer.instances.set('camera', this.camera);

        // === 2. CARGA DE DEFINICIONES DE SERVICIOS ===
        registerServices(this.diContainer);

        // === 3. CREACIÓN AUTOMÁTICA DE SISTEMAS ECS ===
        const logicSystemNames = [
            // 1. INPUT: Capturar la intención del jugador primero.
            'playerInputSystem', 
            'dashSystem',
            'aimSystem',
            'autoAimSystem',

            // 2. IA Y LÓGICA DE MOVIMIENTO: Decidir hacia dónde se mueven las cosas.
            'enemyAISystem', 
            'allyCombatAISystem', 
            'fleetSystem', 
            
            // 3. MOVIMIENTO: Aplicar toda la física y movimiento.
            'physicsSystem',             // Mueve naves (jugador, enemigos, aliados)
            'formationMovementSystem',   // Ajusta el movimiento de la formación
            'formationBonusSystem',      // Detecta formación estable y activa bonos
            'projectileMovementSystem',  // Mueve los proyectiles

            // 4. ACTUALIZACIÓN DE ESTADO POST-MOVIMIENTO:
            'spatialGridUpdateSystem',   // <-- AHORA se actualiza el grid, DESPUÉS de que TODO se ha movido.
            'boundsSystem',              // Comprueba límites del mundo (aunque ahora solo afecta proyectiles)
            
            // 5. ACCIONES Y COLISIONES: Ahora que todo está en su sitio, vemos qué pasa.
            'collisionSystem',           // <-- AHORA comprueba colisiones, con el grid 100% actualizado.
            'damageSystem',              // Aplica daño basado en colisiones.
            'beamSystem',                // <-- NUEVO: Sistema de rayo continuo
            'damageCooldownSystem',      // <-- NUEVO: Gestiona cooldowns de daño por tick
            'healthSystem',              // Gestiona regeneración y lógica de salud
            'weaponSystem',              // Gestiona los disparos.
            'invincibilitySystem',       // Gestiona la invencibilidad tras un golpe.
            'lifetimeSystem',            // Destruye entidades viejas (como proyectiles).
            'thrusterSystem',            // Genera partículas para las estelas.
            'allyAimingSystem',          // <-- Movido aquí para consistencia
            
            // 6. DIRECCIÓN DE JUEGO: Gestiona la progresión y spawning
            'gameDirector',              // <-- NUEVO: Sistema de dirección de juego
            'explosionAnimationSystem',  // <-- NUEVO: Sistema de animación de explosiones
            'attractionSystem',          // <-- NUEVO: Sistema de atracción magnética
            'collectionSystem',          // <-- NUEVO: Sistema de recolección de materiales
        ];
        const renderSystemNames = [
            'parallaxBackgroundSystem', // <-- Ponerlo al principio para que se renderice de fondo
            'trailRenderSystem', 
            'projectileRenderSystem', 
            'enemyRenderSystem', 
            'playerRenderSystem', 
            'allyRenderSystem',
            'formationBonusRenderSystem', // <-- Sistema de renderizado de auras de formación
            'explosionRenderSystem',      // <-- NUEVO: Sistema de renderizado de explosiones
            'materialRenderSystem',       // <-- NUEVO: Sistema de renderizado de materiales
            'dashRenderSystem',           // <-- NUEVO: Sistema de renderizado de efectos de dash
            'effectRenderSystem',         // <-- NUEVO: Sistema de renderizado de efectos visuales
        ];
        
        this.logicSystems = logicSystemNames.map(name => this.diContainer.get(name));
        this.renderSystems = renderSystemNames.map(name => this.diContainer.get(name));

        console.log(`⚙️ Sistemas de lógica ECS inicializados vía DI: ${this.logicSystems.length}`);
        console.log(`🎨 Sistemas de renderizado ECS inicializados vía DI: ${this.renderSystems.length}`);

        // === 4. OBTENCIÓN DE SISTEMAS DE JUEGO PRINCIPALES ===
        this.gameDirector = this.diContainer.get('gameDirector');
        this.powerUpSystem = this.diContainer.get('powerUpSystem');
        this.fleetSystem = this.diContainer.get('fleetSystem'); // <-- ¡AÑADIR ESTA LÍNEA!
        
        // Registrar powerUpSystem en el DIContainer para que otros sistemas puedan acceder a él
        this.diContainer.instances.set('powerUpSystem', this.powerUpSystem);

        // === 5. ACTIVACIÓN DE FÁBRICAS (LAZY LOADING) ===
        this.diContainer.get('projectileFactory');
        this.diContainer.get('enemyFactory');
        this.diContainer.get('allyFactory');
        this.diContainer.get('explosionFactory'); // <-- NUEVO: Activar fábrica de explosiones
        this.diContainer.get('materialFactory');  // <-- NUEVO: Activar fábrica de materiales
        this.diContainer.get('effectFactory');    // <-- NUEVO: Activar fábrica de efectos
        
        // === 6. INICIALIZACIÓN DE SISTEMAS LEGACY ===
        this.powerUpSystem.init();

        // === 7. CREACIÓN DEL FONDO PROCEDURAL ===
        this.createBackground();

        // === 8. CREACIÓN DE LA ENTIDAD JUGADOR ===
        this.createPlayerEntity();
        
        console.log("✅ Arquitectura ECS + DI completamente inicializada. ¡Listo para jugar!");
    }

    /**
     * Crea la entidad del jugador con todos sus componentes
     */
    createPlayerEntity() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const playerDef = CONFIG.PLAYER;

        const playerEntity = this.entityManager.createEntity();
        this.playerEntityId = playerEntity;
        
        const playerTransform = new TransformComponent(centerX, centerY, 0, playerDef.RADIUS);
        
        this.entityManager.addComponent(playerEntity, playerTransform);
        this.entityManager.addComponent(playerEntity, new HealthComponent(playerDef.HP));
        this.entityManager.addComponent(playerEntity, new PlayerControlledComponent());
        this.entityManager.addComponent(playerEntity, new WeaponComponent(playerDef.FIRE_RATE, playerDef.PROJECTILE_TYPE_ID));
        this.entityManager.addComponent(playerEntity, new CollisionComponent(playerDef.RADIUS, 'player'));
        this.entityManager.addComponent(playerEntity, new RenderComponent('player_ship', playerDef.RADIUS));
        this.entityManager.addComponent(playerEntity, new PhysicsComponent(playerDef.SPEED, playerDef.FRICTION));
        this.entityManager.addComponent(playerEntity, new AbilitiesComponent());
        
        // === AÑADIR PROPULSORES Y ESTELAS MÚLTIPLES PARA EL COMANDANTE ===
        const playerTrailType = playerDef.TRAIL_TYPE || 'PLAYER_DEFAULT';
        const trailConfig = CONFIG.TRAIL_TYPES[playerTrailType];

        // Definimos las posiciones de los 3 propulsores del Comandante
        const commanderThrusterOffsets = [
            { x: 0, y: playerDef.RADIUS * 0.8 },   // Central
            { x: -playerDef.RADIUS * 0.5, y: playerDef.RADIUS * 0.9 }, // Izquierdo
            { x: playerDef.RADIUS * 0.5, y: playerDef.RADIUS * 0.9 }   // Derecho
        ];

        // Le decimos al TrailComponent que espere 3 estelas
        this.entityManager.addComponent(playerEntity, new TrailComponent(trailConfig, 3));
        this.entityManager.addComponent(playerEntity, new ThrusterComponent({
            emitRate: 60,
            offsets: commanderThrusterOffsets, // Pasamos el array de offsets
            trailType: playerTrailType
        }));
        
        console.log(`👑 Comandante creado en ECS con ID: ${playerEntity} en posición (${centerX}, ${centerY})`);
    }

    /**
     * Crea el fondo procedural con efectos de paralaje
     */
    createBackground() {
        console.log("🌌 Creando fondo procedural...");

        // --- CAPA 1: Polvo Cósmico Lejano ---
        // Usamos un canvas pre-renderizado para máxima eficiencia
        const dustCanvasSize = 2048;
        this.spriteCache.preRender('dust_layer', dustCanvasSize, dustCanvasSize, (ctx, w, h) => {
            ctx.fillStyle = 'white';
            for (let i = 0; i < 400; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const size = Math.random() * 1.5;
                ctx.fillRect(x, y, size, size);
            }
        });
        
        const dustEntity = this.entityManager.createEntity();
        this.entityManager.addComponent(dustEntity, new TransformComponent(0, 0));
        this.entityManager.addComponent(dustEntity, new RenderComponent('dust_layer'));
        this.entityManager.addComponent(dustEntity, new ParallaxLayerComponent(0.1)); // Se mueve muy lento (10%)

        console.log("✨ Capa de polvo cósmico creada");

        // --- CAPA 2: Estrellas Intermedias ---
        const starsCanvasSize = 1024;
        this.spriteCache.preRender('stars_layer', starsCanvasSize, starsCanvasSize, (ctx, w, h) => {
            ctx.fillStyle = '#AAAAFF';
            for (let i = 0; i < 150; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const size = Math.random() * 2 + 0.5;
                ctx.fillRect(x, y, size, size);
            }
        });
        
        const starsEntity = this.entityManager.createEntity();
        this.entityManager.addComponent(starsEntity, new TransformComponent(0, 0));
        this.entityManager.addComponent(starsEntity, new RenderComponent('stars_layer'));
        this.entityManager.addComponent(starsEntity, new ParallaxLayerComponent(0.3)); // Velocidad media (30%)

        console.log("⭐ Capa de estrellas intermedias creada");

        // --- CAPA 3: Nubes de Polvo Cósmico (Sutil) ---
        const dustCloudCanvasSize = 2048;
        this.spriteCache.preRender('dust_cloud_layer', dustCloudCanvasSize, dustCloudCanvasSize, (ctx, w, h) => {
            // Un color sutil, púrpura/azul oscuro con opacidad MUY baja
            ctx.fillStyle = 'rgba(120, 80, 200, 0.05)'; // Color + Opacidad MUY baja
            for (let i = 0; i < 1500; i++) { // Más puntos que las estrellas para crear "densidad"
                const x = Math.random() * w;
                const y = Math.random() * h;
                const size = Math.random() * 2.5; // Un poco más grandes que las estrellas
                ctx.fillRect(x, y, size, size);
            }
        });
        
        const dustCloudEntity = this.entityManager.createEntity();
        this.entityManager.addComponent(dustCloudEntity, new TransformComponent(0, 0));
        this.entityManager.addComponent(dustCloudEntity, new RenderComponent('dust_cloud_layer'));
        this.entityManager.addComponent(dustCloudEntity, new ParallaxLayerComponent(0.3)); // Se mueve a velocidad media (30%)

        console.log("🌫️ Capa de nubes de polvo cósmico creada");
        console.log("✅ Fondo procedural completo - ¡El universo cobra vida!");
    }
    
    /**
     * Inicializa los Object Pools para entidades frecuentes
     */
    initObjectPools() {
        // Los materiales ahora se manejan completamente por ECS
        console.log("🏊 Object Pools inicializados: ECS ha reemplazado los pools legacy");
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
        
        // Actualizar tamaño de la cámara
        if (this.camera) {
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
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
        const oldState = this.gameState;
        console.log(`🎮 Cambio de estado: ${oldState} → ${newState}`);
        this.gameState = newState;

        // ¡AQUÍ ESTÁ LA LÓGICA CLAVE!
        // Si estamos volviendo al juego DESDE un estado de UI a pantalla completa,
        // forzamos una limpieza total del canvas UNA SOLA VEZ para borrar el "fantasma" de la UI.
        const wasShowingUI = oldState === 'PAUSED_FOR_LEVEL_UP' || oldState === 'GAME_OVER' || oldState === 'VICTORY';

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
     * Los proyectiles ahora se actualizan completamente por ECS
     * Este método ya no es necesario - se mantiene como referencia
     */
    updateProjectiles(deltaTime) {
        // Los proyectiles ahora se manejan por ProjectileMovementSystem y LifetimeSystem
        // No se necesita lógica aquí
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
     * Cicla entre los modos de apuntado disponibles
     */
    cycleAimMode() {
        const modes = CONFIG.PLAYER.AIM_MODES;
        const currentIndex = modes.indexOf(this.aimMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.aimMode = modes[nextIndex];
        console.log(`🎯 Modo de apuntado cambiado a: ${this.aimMode}`);
    }

}

console.log("✅ Game.js cargado correctamente");