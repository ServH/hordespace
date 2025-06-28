/**
 * Space Horde Survivor - EnemyWaveManager
 * Gestiona la aparición de enemigos por oleadas y ciclos
 * Controla la progresión y escalado de dificultad
 */

import PlayerControlledComponent from './components/PlayerControlledComponent.js';
import TransformComponent from './components/TransformComponent.js';

export default class EnemyWaveManager {
    constructor(entityManager, config, eventBus) {
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
        
        // Dimensiones del juego
        this.gameWidth = this.config.CANVAS.WIDTH;
        this.gameHeight = this.config.CANVAS.HEIGHT;
        
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
        let spawnOrigin = { x: 0, y: 0 };

        if (playerEntities.length > 0) {
            const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
            
            // 1. Punto de partida: la posición actual del jugador.
            const playerPos = playerTransform.position;
            
            // 2. Vector de predicción: hacia dónde se dirige el jugador.
            const playerVel = playerTransform.velocity;
            
            // 3. Tiempo de predicción: cuántos segundos hacia el futuro miraremos.
            // Un valor más alto hará que los enemigos aparezcan más lejos por delante.
            const predictionTime = 1.5; // Juega con este valor (entre 1.0 y 2.0 es un buen comienzo).
            
            // 4. Calcular el punto de origen del spawn.
            spawnOrigin.x = playerPos.x + playerVel.x * predictionTime;
            spawnOrigin.y = playerPos.y + playerVel.y * predictionTime;

        } else {
            // Fallback por si no hay jugador (improbable, pero seguro)
            // Usamos el centro de la pantalla como origen
            spawnOrigin.x = this.gameWidth / 2;
            spawnOrigin.y = this.gameHeight / 2;
        }
        
        // 5. Ahora, generamos la posición final del enemigo en un radio aleatorio
        // ALREDEDOR de ese punto de origen futuro, y justo fuera de la pantalla.
        const spawnRadius = Math.hypot(this.gameWidth / 2, this.gameHeight / 2) + 100; // Un círculo un poco más grande que la pantalla.
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
        enemy.materialPool = this.entityManager.materialPool;
        
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