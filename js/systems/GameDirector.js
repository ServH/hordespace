/**
 * GameDirector - Sistema de Dirección de Juego con Escalado Procedural
 * Reemplaza el sistema de fases fijas con un escalado dinámico basado en fórmulas
 * Orquesta la tensión del juego de manera infinitamente escalable
 */

import System from './System.js';
import EnemyComponent from '../components/EnemyComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class GameDirector extends System {
    constructor(entityManager, eventBus, camera) {
        super(entityManager, eventBus);
        this.camera = camera;
        this.gameTime = 0;
        this.spawnCooldown = 0;
        // Ya no usamos la timeline manual, apuntamos a la nueva configuración de escalado
        this.scalingConfig = CONFIG.GAME_DIRECTOR_SCALING;
        this.gameDuration = 1800; // 30 minutos en segundos
        
        // Nueva propiedad para controlar el spawn de materiales
        this.materialSpawnCooldown = 15; // Empezará a crear materiales a los 15s
    }

    update(deltaTime) {
        this.gameTime += deltaTime;
        this.spawnCooldown = Math.max(0, this.spawnCooldown - deltaTime);

        if (this.gameTime >= this.gameDuration && this.gameDuration > 0) {
            this.eventBus.publish('game:set_state', 'GAME_WIN');
            return;
        }

        // 1. Calcular los parámetros de dificultad actuales usando las fórmulas
        const minutes = this.gameTime / 60;
        const currentSpawnRate = this.scalingConfig.SPAWN_RATE.base + (this.scalingConfig.SPAWN_RATE.increasePerSecond * this.gameTime);
        const currentMaxEnemies = Math.floor(this.scalingConfig.MAX_ENEMIES.base + (this.scalingConfig.MAX_ENEMIES.increasePerSecond * this.gameTime));
        const currentDifficultyMultiplier = this.scalingConfig.DIFFICULTY_MULTIPLIER.base + (this.scalingConfig.DIFFICULTY_MULTIPLIER.increasePerMinute * minutes);

        // 2. Determinar qué enemigos pueden aparecer en este momento del juego
        const enemyPool = this.getAvailableEnemyPool();

        // 3. Controlar el spawning
        if (this.spawnCooldown <= 0) {
            const enemiesOnScreen = this.entityManager.getEntitiesWith(EnemyComponent).length;

            if (enemiesOnScreen < currentMaxEnemies) {
                // Elegir un tipo de enemigo del pool según sus pesos
                const chosenEnemyType = this.chooseEnemyFromPool(enemyPool);
                const enemyDefinition = CONFIG.ENEMY[chosenEnemyType.toUpperCase()];

                // Escalar el enemigo y solicitar su creación
                const scaledConfig = this.getScaledEnemyConfig(currentDifficultyMultiplier, enemyDefinition);
                this.eventBus.publish('enemy:request_spawn', scaledConfig);
            }

            if (currentSpawnRate > 0) {
                this.spawnCooldown = 1 / currentSpawnRate;
            }
        }
        
        // NUEVA LÓGICA: Generar cúmulos de materiales periódicamente
        this.materialSpawnCooldown -= deltaTime;
        if (this.materialSpawnCooldown <= 0) {
            this.materialSpawnCooldown = 20 + Math.random() * 10; // Siguiente cúmulo en 20-30s

            // Obtenemos una posición aleatoria lejos del jugador para que sea un descubrimiento
            const spawnPos = this.getRandomSpawnPosition();
            const clusterSize = 3 + Math.floor(Math.random() * 3); // De 3 a 5 cristales

            console.log(`🗺️ Creando cúmulo de ${clusterSize} materiales en (${spawnPos.x.toFixed(0)}, ${spawnPos.y.toFixed(0)})`);
            for (let i = 0; i < clusterSize; i++) {
                // Esparcimos los cristales un poco alrededor del punto central
                const offsetX = (Math.random() - 0.5) * 50;
                const offsetY = (Math.random() - 0.5) * 50;
                this.eventBus.publish('material:request_spawn', { 
                    x: spawnPos.x + offsetX, 
                    y: spawnPos.y + offsetY 
                });
            }
        }
    }

    // Nuevo método para determinar el pool de enemigos disponibles
    getAvailableEnemyPool() {
        // Siempre empezamos con el enemigo por defecto
        const pool = [{ type: 'default', weight: 100 }];
        
        for (const intro of this.scalingConfig.ENEMY_INTRODUCTION_TIMELINE) {
            if (this.gameTime >= intro.startTime) {
                // Calculamos el peso actual del enemigo, que aumenta con el tiempo
                const minutesSinceIntroduced = (this.gameTime - intro.startTime) / 60;
                const currentWeight = intro.initialWeight + (intro.weightIncreasePerMinute * minutesSinceIntroduced);
                pool.push({ type: intro.type, weight: currentWeight });
            }
        }
        return pool;
    }

    // Nuevo método para elegir un enemigo del pool según sus pesos
    chooseEnemyFromPool(pool) {
        const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
        let random = Math.random() * totalWeight;

        for (const entry of pool) {
            if (random < entry.weight) {
                return entry.type;
            }
            random -= entry.weight;
        }
        return pool[0].type; // Fallback
    }

    getScaledEnemyConfig(multiplier, definition) {
        // Esta lógica es similar a la del antiguo WaveManager, pero simplificada
        const spawnPosition = this.getRandomSpawnPosition();
        
        return {
            definition: definition, // Pasamos la definición completa
            position: spawnPosition,
            hp: Math.floor(definition.HP * multiplier),
            damage: Math.floor(definition.DAMAGE * multiplier),
            maxSpeed: definition.SPEED * multiplier,
            xpValue: Math.floor(definition.XP_VALUE * multiplier)
        };
    }

    getRandomSpawnPosition() {
        // Obtener el jugador desde el EntityManager
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        
        if (!this.camera || playerEntities.length === 0) {
            // Fallback: spawn en una posición aleatoria lejos del origen
            const spawnRadius = 500;
            const randomAngle = Math.random() * 2 * Math.PI;
            return {
                x: Math.cos(randomAngle) * spawnRadius,
                y: Math.sin(randomAngle) * spawnRadius
            };
        }

        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
        const spawnRadius = Math.hypot(this.camera.width / 2, this.camera.height / 2) + 100;
        const randomAngle = Math.random() * 2 * Math.PI;
        
        const finalSpawnX = playerTransform.position.x + Math.cos(randomAngle) * spawnRadius;
        const finalSpawnY = playerTransform.position.y + Math.sin(randomAngle) * spawnRadius;
        
        return { x: finalSpawnX, y: finalSpawnY };
    }

    // Métodos públicos para obtener información del estado del juego
    getGameTime() {
        return this.gameTime;
    }

    getCurrentDifficultyInfo() {
        const minutes = this.gameTime / 60;
        const currentSpawnRate = this.scalingConfig.SPAWN_RATE.base + (this.scalingConfig.SPAWN_RATE.increasePerSecond * this.gameTime);
        const currentMaxEnemies = Math.floor(this.scalingConfig.MAX_ENEMIES.base + (this.scalingConfig.MAX_ENEMIES.increasePerSecond * this.gameTime));
        const currentDifficultyMultiplier = this.scalingConfig.DIFFICULTY_MULTIPLIER.base + (this.scalingConfig.DIFFICULTY_MULTIPLIER.increasePerMinute * minutes);
        
        return {
            spawnRate: currentSpawnRate,
            maxEnemies: currentMaxEnemies,
            difficultyMultiplier: currentDifficultyMultiplier,
            availableEnemyTypes: this.getAvailableEnemyPool().map(enemy => enemy.type)
        };
    }

    getTimeRemaining() {
        return Math.max(0, this.gameDuration - this.gameTime);
    }

    getProgressPercentage() {
        return (this.gameTime / this.gameDuration) * 100;
    }
} 