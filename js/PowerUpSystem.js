/**
 * PowerUpSystem - Sistema de experiencia, niveles y power-ups
 * Maneja la progresión del jugador y las mejoras roguelike
 */

class PowerUpSystem {
    constructor(gameInstance, config) {
        this.game = gameInstance;
        this.config = config;
        
        // Progresión del jugador
        this.currentXP = 0;
        this.currentLevel = 1;
        this.xpToNextLevel = config.BASE_XP_TO_LEVEL_UP;
        
        // Sistema de power-ups
        this.powerUpOptions = [];
        this.isLevelUpPending = false;
        
        // Multiplicadores especiales del jugador
        this.xpMultiplier = 1.0;
        this.materialMultiplier = 1.0;
        this.collectionRadius = config.MATERIAL_COLLECTION_RADIUS;
        
        // UI de selección
        this.selectedOptionIndex = 0; // Para navegación con teclado
    }
    
    /**
     * Inicializa el sistema
     */
    init() {
        this.currentXP = 0;
        this.currentLevel = 1;
        this.xpToNextLevel = this.config.BASE_XP_TO_LEVEL_UP;
        this.isLevelUpPending = false;
        this.selectedOptionIndex = 0;
        
        console.log("🎯 PowerUpSystem inicializado");
    }
    
    /**
     * Añade experiencia al jugador
     */
    addXP(amount) {
        const finalAmount = Math.floor(amount * this.xpMultiplier);
        this.currentXP += finalAmount;
        
        console.log(`📈 +${finalAmount} XP (${this.currentXP}/${this.xpToNextLevel})`);
        
        this.checkLevelUp();
    }
    
    /**
     * Verifica si el jugador debe subir de nivel
     */
    checkLevelUp() {
        if (this.currentXP >= this.xpToNextLevel && !this.isLevelUpPending) {
            this.levelUp();
        }
    }
    
    /**
     * Ejecuta la subida de nivel
     */
    levelUp() {
        this.currentLevel++;
        this.currentXP -= this.xpToNextLevel;
        
        // Calcular XP para el siguiente nivel (escalado)
        this.xpToNextLevel = this.config.BASE_XP_TO_LEVEL_UP + 
                            (this.currentLevel - 1) * this.config.XP_INCREASE_PER_LEVEL;
        
        console.log(`🎉 ¡NIVEL ${this.currentLevel}! Próximo nivel: ${this.xpToNextLevel} XP`);
        
        // Generar opciones de power-up
        this.generatePowerUpOptions();
        
        // Pausar el juego para selección
        this.isLevelUpPending = true;
        this.selectedOptionIndex = 0;
        this.game.setGameState('PAUSED_FOR_LEVEL_UP');
    }
    
    /**
     * Genera 3 opciones aleatorias de power-ups
     */
    generatePowerUpOptions() {
        const allPowerUps = [...this.config.POWER_UP_DEFINITIONS];
        this.powerUpOptions = [];
        
        // Seleccionar 3 power-ups únicos al azar
        for (let i = 0; i < 3 && allPowerUps.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * allPowerUps.length);
            const selectedPowerUp = allPowerUps.splice(randomIndex, 1)[0];
            this.powerUpOptions.push(selectedPowerUp);
        }
        
        console.log("🎲 Opciones de power-up generadas:", this.powerUpOptions.map(p => p.name));
    }
    
    /**
     * Aplica el power-up seleccionado
     */
    applyPowerUp(chosenIndex) {
        if (chosenIndex < 0 || chosenIndex >= this.powerUpOptions.length) {
            console.error("❌ Índice de power-up inválido:", chosenIndex);
            return;
        }
        
        const powerUp = this.powerUpOptions[chosenIndex];
        console.log(`✨ Aplicando power-up: ${powerUp.name}`);
        
        this.applyPowerUpEffect(powerUp);
        
        // Finalizar selección
        this.isLevelUpPending = false;
        this.powerUpOptions = [];
        this.game.setGameState('PLAYING');
    }
    
    /**
     * Aplica el efecto del power-up al jugador
     */
    applyPowerUpEffect(powerUp) {
        const effect = powerUp.effect;
        const player = this.game.player;
        
        switch (powerUp.type) {
            case 'Commander':
                this.applyCommanderEffect(player, effect);
                break;
            case 'Special':
                this.applySpecialEffect(effect);
                break;
            case 'Fleet':
                this.applyFleetEffect(effect);
                break;
            default:
                console.warn("⚠️ Tipo de power-up desconocido:", powerUp.type);
        }
    }
    
    /**
     * Aplica efectos que modifican directamente al comandante
     */
    applyCommanderEffect(player, effect) {
        const prop = effect.prop;
        
        if (effect.multiplier) {
            // Efecto multiplicativo
            if (player[prop] !== undefined) {
                const oldValue = player[prop];
                player[prop] *= effect.multiplier;
                console.log(`🔧 ${prop}: ${oldValue.toFixed(2)} → ${player[prop].toFixed(2)}`);
            }
        }
        
        if (effect.additive) {
            // Efecto aditivo
            if (player[prop] !== undefined) {
                const oldValue = player[prop];
                player[prop] += effect.additive;
                console.log(`🔧 ${prop}: ${oldValue} → ${player[prop]}`);
                
                // Caso especial: si es HP máximo, también curar al jugador
                if (prop === 'maxHp') {
                    player.hp = Math.min(player.hp + effect.additive, player.maxHp);
                }
            } else if (prop === 'healthRegen') {
                // Inicializar regeneración si no existe
                player.healthRegen = (player.healthRegen || 0) + effect.additive;
                console.log(`🔧 Nueva regeneración: ${player.healthRegen} HP/seg`);
            }
        }
    }
    
    /**
     * Aplica efectos especiales que modifican el sistema de juego
     */
    applySpecialEffect(effect) {
        const prop = effect.prop;
        
        if (effect.multiplier) {
            switch (prop) {
                case 'xpMultiplier':
                    this.xpMultiplier *= effect.multiplier;
                    console.log(`🔧 Multiplicador XP: ${this.xpMultiplier.toFixed(2)}`);
                    break;
                case 'materialMultiplier':
                    this.materialMultiplier *= effect.multiplier;
                    console.log(`🔧 Multiplicador Materiales: ${this.materialMultiplier.toFixed(2)}`);
                    break;
                case 'collectionRadius':
                    this.collectionRadius *= effect.multiplier;
                    console.log(`🔧 Radio de Recolección: ${this.collectionRadius.toFixed(1)}`);
                    break;
            }
        }
    }
    
    /**
     * Aplica efectos de flota que añaden naves aliadas
     */
    applyFleetEffect(effect) {
        const prop = effect.prop;
        
        if (prop === 'addShip') {
            const shipType = effect.value; // 'scout' o 'gunship'
            
            if (this.game.fleetManager) {
                this.game.fleetManager.addShip(shipType);
                console.log(`🚀 Añadiendo nave a la flota: ${shipType}`);
            } else {
                console.error("❌ FleetManager no disponible para añadir nave");
            }
        }
    }
    
    /**
     * Maneja la navegación por teclado en la UI de power-ups
     */
    handleKeyInput(key) {
        if (!this.isLevelUpPending) return false;
        
        switch (key) {
            case 'ArrowUp':
            case 'KeyW':
                this.selectedOptionIndex = Math.max(0, this.selectedOptionIndex - 1);
                return true;
            case 'ArrowDown':
            case 'KeyS':
                this.selectedOptionIndex = Math.min(2, this.selectedOptionIndex + 1);
                return true;
            case 'Enter':
            case 'Space':
                this.applyPowerUp(this.selectedOptionIndex);
                return true;
            case 'Digit1':
                this.applyPowerUp(0);
                return true;
            case 'Digit2':
                this.applyPowerUp(1);
                return true;
            case 'Digit3':
                this.applyPowerUp(2);
                return true;
        }
        
        return false;
    }
    
    /**
     * Renderiza la interfaz de selección de power-ups
     */
    renderPowerUpSelectionUI(ctx) {
        if (!this.isLevelUpPending || this.powerUpOptions.length === 0) return;
        
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Título
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('¡NIVEL SUPERIOR!', centerX, centerY - 200);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(`Nivel ${this.currentLevel}`, centerX, centerY - 160);
        
        // Instrucciones
        ctx.font = '18px Arial';
        ctx.fillStyle = '#CCCCCC';
        ctx.fillText('Elige una mejora:', centerX, centerY - 120);
        ctx.fillText('↑/↓ o W/S para navegar, ENTER o ESPACIO para seleccionar', centerX, centerY + 180);
        ctx.fillText('O presiona 1, 2, 3 para selección directa', centerX, centerY + 210);
        
        // Opciones de power-up
        const optionHeight = 80;
        const optionWidth = 500;
        const startY = centerY - 60;
        
        for (let i = 0; i < this.powerUpOptions.length; i++) {
            const powerUp = this.powerUpOptions[i];
            const y = startY + (i * optionHeight);
            const isSelected = i === this.selectedOptionIndex;
            
            // Fondo de la opción
            ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(centerX - optionWidth/2, y - 30, optionWidth, 60);
            
            // Borde
            ctx.strokeStyle = isSelected ? '#FFD700' : '#666666';
            ctx.lineWidth = isSelected ? 3 : 1;
            ctx.strokeRect(centerX - optionWidth/2, y - 30, optionWidth, 60);
            
            // Número de opción
            ctx.fillStyle = isSelected ? '#FFD700' : '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}.`, centerX - optionWidth/2 + 20, y - 5);
            
            // Nombre del power-up
            ctx.font = 'bold 18px Arial';
            ctx.fillText(powerUp.name, centerX - optionWidth/2 + 60, y - 5);
            
            // Descripción
            ctx.fillStyle = isSelected ? '#FFFF80' : '#CCCCCC';
            ctx.font = '14px Arial';
            ctx.fillText(powerUp.description, centerX - optionWidth/2 + 60, y + 15);
        }
    }
    
    /**
     * Obtiene el progreso de XP como porcentaje para el HUD
     */
    getXPProgress() {
        const totalXPForCurrentLevel = this.xpToNextLevel;
        const xpInCurrentLevel = this.currentXP;
        return Math.min(xpInCurrentLevel / totalXPForCurrentLevel, 1.0);
    }
} 