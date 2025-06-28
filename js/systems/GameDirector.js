/**
 * GameDirector - Sistema de Dirección de Juego
 * Reemplaza al EnemyWaveManager con un sistema de progresión basado en tiempo
 * Orquesta la tensión del juego según una línea de tiempo predefinida
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
        this.timeline = CONFIG.GAME_DIRECTOR_TIMELINE;
        this.currentPhase = null;
        this.gameDuration = 300; // 5 minutos en segundos
    }

    update(deltaTime) {
        this.gameTime += deltaTime;
        this.spawnCooldown = Math.max(0, this.spawnCooldown - deltaTime);

        // Verificar si el juego ha terminado
        if (this.gameTime >= this.gameDuration) {
            this.eventBus.publish('game:set_state', 'GAME_WIN');
            return;
        }

        // 1. Determinar la fase actual según el tiempo de juego
        let activePhase = this.timeline[0];
        for (const phase of this.timeline) {
            if (this.gameTime >= phase.startTime) {
                activePhase = phase;
            } else {
                break; // Las fases deben estar ordenadas por tiempo
            }
        }
        this.currentPhase = activePhase;

        // 2. Controlar el spawning de enemigos
        if (this.spawnCooldown <= 0) {
            const enemiesOnScreen = this.entityManager.getEntitiesWith(EnemyComponent).length;
            
            if (enemiesOnScreen < this.currentPhase.maxEnemies) {
                this.spawnEnemy();
            }

            // Reiniciar el cooldown basado en la tasa de la fase actual
            if (this.currentPhase.spawnRate > 0) {
                this.spawnCooldown = 1 / this.currentPhase.spawnRate;
            }
        }
    }

    spawnEnemy() {
        // Por ahora, solo tenemos un tipo de enemigo, 'default'.
        // La lógica para elegir de 'enemyPool' vendrá después.
        const enemyType = this.currentPhase.enemyPool[0].type; 

        // 3. Crear la configuración del enemigo escalada por la dificultad de la fase
        const scaledConfig = this.getScaledEnemyConfig(this.currentPhase.difficultyMultiplier);

        // 4. Publicar el evento para que la fábrica cree el enemigo
        this.eventBus.publish('enemy:request_spawn', scaledConfig);
    }

    getScaledEnemyConfig(multiplier) {
        // Esta lógica es similar a la del antiguo WaveManager, pero simplificada
        const spawnPosition = this.getRandomSpawnPosition();
        const baseConfig = CONFIG.ENEMY.DEFAULT;
        
        return {
            position: spawnPosition,
            hp: Math.floor(baseConfig.HP * multiplier),
            damage: Math.floor(baseConfig.DAMAGE * multiplier),
            maxSpeed: baseConfig.SPEED * multiplier,
            xpValue: Math.floor(baseConfig.XP_VALUE * multiplier)
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

    getCurrentPhase() {
        return this.currentPhase;
    }

    getTimeRemaining() {
        return Math.max(0, this.gameDuration - this.gameTime);
    }

    getProgressPercentage() {
        return (this.gameTime / this.gameDuration) * 100;
    }
} 