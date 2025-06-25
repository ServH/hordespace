/**
 * Space Horde Survivor - EnemyWaveManager
 * Gestiona la aparición de enemigos por oleadas y ciclos
 * Controla la progresión y escalado de dificultad
 */

class EnemyWaveManager {
    constructor(gameInstance, config) {
        this.game = gameInstance;
        this.config = config;
        
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
        // Generar posición fuera de pantalla
        const spawnPosition = this.getRandomSpawnPosition();
        
        // Crear nuevo enemigo
        const enemy = new EnemyShip(
            spawnPosition.x,
            spawnPosition.y,
            this.game.player
        );
        
        // Aplicar escalado de dificultad
        this.applyDifficultyScaling(enemy);
        
        // Añadir al juego
        this.game.enemies.push(enemy);
        this.spawnedEnemiesCount++;
        
        console.log(`👾 Enemigo spawneado en (${spawnPosition.x.toFixed(0)}, ${spawnPosition.y.toFixed(0)}) - ${this.spawnedEnemiesCount}/${this.enemiesToSpawnThisWave}`);
    }
    
    /**
     * Genera una posición aleatoria fuera de los límites de la pantalla
     * @returns {Object} Posición con x e y
     */
    getRandomSpawnPosition() {
        const margin = 50; // margen fuera de pantalla
        const side = Math.floor(Math.random() * 4); // 0=arriba, 1=derecha, 2=abajo, 3=izquierda
        
        let x, y;
        
        switch (side) {
            case 0: // Arriba
                x = Math.random() * this.gameWidth;
                y = -margin;
                break;
            case 1: // Derecha
                x = this.gameWidth + margin;
                y = Math.random() * this.gameHeight;
                break;
            case 2: // Abajo
                x = Math.random() * this.gameWidth;
                y = this.gameHeight + margin;
                break;
            case 3: // Izquierda
                x = -margin;
                y = Math.random() * this.gameHeight;
                break;
        }
        
        return { x, y };
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
     * Método llamado cuando un enemigo es destruido
     */
    onEnemyDestroyed() {
        this.enemiesRemainingInWave--;
        console.log(`💥 Enemigo destruido - Quedan: ${this.enemiesRemainingInWave}`);
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