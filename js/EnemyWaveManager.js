/**
 * Space Horde Survivor - EnemyWaveManager
 * Gestiona la aparición de enemigos por oleadas y ciclos
 * Controla la progresión y escalado de dificultad
 */

import PlayerControlledComponent from './components/PlayerControlledComponent.js';
import TransformComponent from './components/TransformComponent.js';

export default class EnemyWaveManager {
    constructor(game, entityManager, config, eventBus) {
        this.game = game; // Guardamos la referencia al juego
        this.entityManager = entityManager;
        this.config = config;
        this.eventBus = eventBus;
        
        // Propiedades de oleadas y ciclos
        this.currentWave = 1;
        this.currentCycle = 1;
        this.enemiesRemainingInWave = 0;
        this.waveTimer = 0;
        this.spawnInterval = this.config.ENEMY.DEFAULT.SPAWN_RATE_INITIAL;
        this.enemiesToSpawnThisWave = 0;
        this.spawnedEnemiesCount = 0;
        this.waveActive = false;
        
        // Timer para pausa entre oleadas
        this.waveBreakTimer = 0;
        this.waveBreakDuration = 3; // 3 segundos de pausa entre oleadas
        this.isInWaveBreak = false;
        
        console.log("🌊 EnemyWaveManager inicializado");
    }
    
    /**
     * Inicializa el sistema de oleadas y comienza la primera oleada
     */
    init() {
        console.log("🚀 Inicializando sistema de oleadas...");

        this.eventBus.subscribe('enemy:destroyed', () => {
            this.enemiesRemainingInWave--;
            console.log(`💥 Enemigo destruido (evento recibido) - Quedan: ${this.enemiesRemainingInWave}`);
        });

        this.startWave(this.currentWave);
    }
    
    /**
     * Comienza una nueva oleada
     * @param {number} waveNumber - Número de la oleada
     */
    startWave(waveNumber) {
        console.log(`🌊 Iniciando Oleada ${waveNumber} - Ciclo ${this.currentCycle}`);
        
        // Reiniciar timers y contadores
        this.waveTimer = 0;
        this.spawnedEnemiesCount = 0;
        this.waveActive = true;
        this.isInWaveBreak = false;
        
        // Calcular cantidad de enemigos para esta oleada
        // Fórmula: oleada * 2 + (ciclo - 1) * 5
        this.enemiesToSpawnThisWave = waveNumber * 2 + (this.currentCycle - 1) * 5;
        this.enemiesRemainingInWave = this.enemiesToSpawnThisWave;
        
        // Ajustar intervalo de spawn (más rápido con cada oleada/ciclo)
        const difficultyFactor = 1 - ((this.currentCycle - 1) * 0.1 + (waveNumber - 1) * 0.02);
        this.spawnInterval = Math.max(
            this.config.ENEMY.DEFAULT.SPAWN_RATE_INITIAL * difficultyFactor,
            0.5 // mínimo 0.5 segundos entre spawns
        );
        
        console.log(`📊 Oleada ${waveNumber}: ${this.enemiesToSpawnThisWave} enemigos, intervalo: ${this.spawnInterval.toFixed(2)}s`);
    }
    
    /**
     * Actualiza el sistema de oleadas
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Si estamos en pausa entre oleadas
        if (this.isInWaveBreak) {
            this.waveBreakTimer += deltaTime;
            if (this.waveBreakTimer >= this.waveBreakDuration) {
                this.waveBreakTimer = 0;
                this.startWave(this.currentWave);
            }
            return;
        }
        
        // Si no hay oleada activa, no hacer nada
        if (!this.waveActive) {
            return;
        }
        
        // Gestión de spawn de enemigos
        this.waveTimer += deltaTime;
        if (this.waveTimer >= this.spawnInterval && this.spawnedEnemiesCount < this.enemiesToSpawnThisWave) {
            this.spawnEnemy();
            this.waveTimer = 0;
        }
        
        // Verificar fin de oleada
        if (this.enemiesRemainingInWave <= 0) {
            this.endWave();
        }
    }
    
    /**
     * Genera un enemigo en una posición aleatoria fuera de pantalla
     */
    spawnEnemy() {
        // Este método ya no crea el enemigo, solo pide que se cree uno.
        const scaledConfig = this.getScaledEnemyConfig(); // Usamos tu método existente
        this.eventBus.publish('enemy:request_spawn', scaledConfig);
        this.spawnedEnemiesCount++;
    }
    
    /**
     * Genera una posición predictiva en la trayectoria del jugador
     * @returns {Object} Posición con x e y
     */
    getRandomSpawnPosition() {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        
        // El origen del spawn sigue la cámara, que a su vez sigue al jugador.
        let spawnOrigin = { x: this.game.camera.x, y: this.game.camera.y };

        if (playerEntities.length > 0) {
            const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
            const playerVel = playerTransform.velocity;
            
            const predictionTime = 1.5;
            
            // Calculamos el punto de origen PREDICHO en el mundo.
            spawnOrigin.x += playerVel.x * predictionTime;
            spawnOrigin.y += playerVel.y * predictionTime;
        }

        // Leemos el tamaño directamente desde la cámara del objeto 'game'.
        const spawnRadius = Math.hypot(this.game.camera.width / 2, this.game.camera.height / 2) + 100;
        
        const randomAngle = Math.random() * 2 * Math.PI;
        
        const spawnX = spawnOrigin.x + Math.cos(randomAngle) * spawnRadius;
        const spawnY = spawnOrigin.y + Math.sin(randomAngle) * spawnRadius;

        return { x: spawnX, y: spawnY };
    }
    
    /**
     * Obtiene la configuración escalada para un enemigo (datos puros)
     * @returns {Object} Configuración del enemigo escalada
     */
    getScaledEnemyConfig() {
        const spawnPosition = this.getRandomSpawnPosition();
        const cycleScaling = Math.pow(this.config.WAVE_MANAGER.DIFFICULTY_HP_SCALING, this.currentCycle - 1);
        const damageScaling = Math.pow(this.config.WAVE_MANAGER.DIFFICULTY_DAMAGE_SCALING, this.currentCycle - 1);
        const speedScaling = Math.pow(1.05, this.currentCycle - 1);
        
        return {
            position: spawnPosition,
            hp: Math.floor(this.config.ENEMY.DEFAULT.HP * cycleScaling),
            damage: Math.floor(this.config.ENEMY.DEFAULT.DAMAGE * damageScaling),
            maxSpeed: this.config.ENEMY.DEFAULT.SPEED * speedScaling,  // ¡CORREGIDO: SPEED, no MAX_SPEED!
            xpValue: Math.floor(this.config.ENEMY.DEFAULT.XP_VALUE * cycleScaling)
        };
    }

    /**
     * Aplica el escalado de dificultad a un enemigo
     * @param {EnemyShip} enemy - Enemigo a escalar
     */
    applyDifficultyScaling(enemy) {
        const cycleScaling = Math.pow(this.config.WAVE_MANAGER.DIFFICULTY_HP_SCALING, this.currentCycle - 1);
        
        // Escalar HP
        enemy.maxHp = Math.floor(enemy.maxHp * cycleScaling);
        enemy.hp = enemy.maxHp;
        
        // Añadir propiedad de daño escalado al enemigo
        const damageScaling = Math.pow(this.config.WAVE_MANAGER.DIFFICULTY_DAMAGE_SCALING, this.currentCycle - 1);
        enemy.scaledDamage = Math.floor(this.config.ENEMY.DEFAULT.DAMAGE * damageScaling);
        
        // Escalar valor de XP (más XP por enemigos más difíciles)
        enemy.xpValue = Math.floor(enemy.xpValue * cycleScaling);
        
        // Opcional: escalar ligeramente la velocidad (menos agresivo)
        const speedScaling = Math.pow(1.05, this.currentCycle - 1); // +5% por ciclo
        enemy.maxSpeed *= speedScaling;
        
        // Asignar referencia al pool de materiales
        enemy.materialPool = this.game.materialPool;
        
        console.log(`⚡ Enemigo escalado - HP: ${enemy.hp}, Daño: ${enemy.scaledDamage}, XP: ${enemy.xpValue}, Velocidad: ${enemy.maxSpeed.toFixed(1)}`);
    }
    

    
    /**
     * Finaliza la oleada actual
     */
    endWave() {
        console.log(`✅ Oleada ${this.currentWave} completada!`);
        
        this.waveActive = false;
        this.currentWave++;
        
        // Verificar si completamos un ciclo
        if (this.currentWave > this.config.WAVE_MANAGER.WAVES_PER_CYCLE) {
            this.currentCycle++;
            this.currentWave = 1;
            console.log(`🎉 ¡CICLO ${this.currentCycle - 1} COMPLETADO! Iniciando Ciclo ${this.currentCycle}`);
        }
        
        // Iniciar pausa entre oleadas
        this.isInWaveBreak = true;
        this.waveBreakTimer = 0;
    }
    
    /**
     * Obtiene información del estado actual para el HUD
     * @returns {Object} Estado actual del sistema de oleadas
     */
    getWaveInfo() {
        return {
            currentWave: this.currentWave,
            currentCycle: this.currentCycle,
            enemiesRemaining: this.enemiesRemainingInWave,
            isInWaveBreak: this.isInWaveBreak,
            waveBreakTimeRemaining: Math.max(0, this.waveBreakDuration - this.waveBreakTimer)
        };
    }
}

// Hacer la clase disponible globalmente
window.EnemyWaveManager = EnemyWaveManager; 