/**
 * PowerUpSystem - Sistema de experiencia, niveles y power-ups CON SINERGIAS Y NIVELES
 * Maneja la progresión del jugador y las mejoras roguelike con sistema de evoluciones y niveles
 * 
 * Fase 1: Implementando Niveles de Power-Ups
 */

import PlayerControlledComponent from './components/PlayerControlledComponent.js';
import PhysicsComponent from './components/PhysicsComponent.js';
import HealthComponent from './components/HealthComponent.js';
import WeaponComponent from './components/WeaponComponent.js';

export default class PowerUpSystem {
    constructor(entityManager, config, eventBus, synergyManager, fleetSystem) {
        this.entityManager = entityManager;
        this.config = config;
        this.eventBus = eventBus;
        this.synergyManager = synergyManager; // El "Chef"
        this.fleetSystem = fleetSystem;       // Para saber qué naves tiene el jugador
        
        this.currentXP = 0;
        this.currentLevel = 1;
        this.xpToNextLevel = config.POWER_UP_SYSTEM.BASE_XP_TO_LEVEL_UP;
        
        this.powerUpOptions = [];
        this.isLevelUpPending = false;
        this.selectedOptionIndex = 0;
        this.acquiredPowerUps = new Map();
        
        this.xpMultiplier = 1.0;
        this.materialMultiplier = 1.0;
        this.collectionRadius = config.MATERIAL.COLLECTION_RADIUS;

        this.eventBus.subscribe('enemy:destroyed', (data) => {
            if (data && data.xpValue) {
                this.addXP(data.xpValue);
            }
        });
        
        this.eventBus.subscribe('debug:level_up', () => this.levelUp());
        this.eventBus.subscribe('debug:add_xp', (data) => this.addXP(data.amount));
        this.eventBus.subscribe('debug:grant_powerup', (data) => {
            console.log(`DEBUG: Otorgando power-up: ${data.powerUp.name}`);
            this.applyPowerUpEffect(data.powerUp);
            const currentLevel = this.acquiredPowerUps.get(data.powerUp.id) || 0;
            this.acquiredPowerUps.set(data.powerUp.id, currentLevel + 1);
        });
        
        this.eventBus.subscribe('debug:grant_evolution', (data) => {
            const evolution = data.evolution;
            console.log(`DEBUG: Otorgando evolución directamente: ${evolution.name}`);
            
            this.applyEvolutionEffect(evolution.effect);
            
            this.acquiredPowerUps.set(evolution.id, 1);
        });
        
        console.log("🎯 PowerUpSystem con Sinergias y Niveles inicializado");
    }
    
    /**
     * Inicializa el sistema
     */
    init() {
        this.acquiredPowerUps.clear();
        this.currentXP = 0;
        this.currentLevel = 1;
        this.xpToNextLevel = this.config.POWER_UP_SYSTEM.BASE_XP_TO_LEVEL_UP;
        this.isLevelUpPending = false;
        this.selectedOptionIndex = 0;

        this.eventBus.subscribe('enemy:destroyed', (data) => {
            if (data && data.xpValue) {
                this.addXP(data.xpValue);
            }
        });
        
        console.log("🎯 PowerUpSystem con Sinergias y Niveles inicializado");
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
                this.xpToNextLevel = this.config.POWER_UP_SYSTEM.BASE_XP_TO_LEVEL_UP +
            (this.currentLevel - 1) * this.config.POWER_UP_SYSTEM.XP_INCREASE_PER_LEVEL;
        
        console.log(`🎉 ¡NIVEL ${this.currentLevel}! Próximo nivel: ${this.xpToNextLevel} XP`);
        
        // Generar opciones de power-up
        this.generatePowerUpOptions();
        
        // Pausar el juego para selección
        this.isLevelUpPending = true;
        this.selectedOptionIndex = 0;
        this.eventBus.publish('game:set_state', 'PAUSED_FOR_LEVEL_UP');
    }
    
    /**
     * Genera 3 opciones aleatorias de power-ups
     */
    generatePowerUpOptions() {
        const filterByLevel = (powerup) => {
            const currentLevel = this.acquiredPowerUps.get(powerup.id) || 0;
            const maxLevel = powerup.maxLevel || 1;
            return currentLevel < maxLevel;
        };

        const allPowerUps = this.config.POWER_UP_DEFINITIONS;
        this.powerUpOptions = [];
        
        // Agrupar todos los power-ups por su categoría, filtrando por nivel
        const pools = {
            Defensive: allPowerUps.filter(p => p.category === 'Defensive' && filterByLevel(p)),
            Offensive: allPowerUps.filter(p => p.category === 'Offensive' && filterByLevel(p)),
            Fleet: allPowerUps.filter(p => p.category === 'Fleet' && filterByLevel(p)),
            Utility: allPowerUps.filter(p => p.category === 'Utility' && filterByLevel(p)),
            Special: [] // La categoría para las evoluciones, empieza vacía
        };

        // --- MAGIA DE SINERGIAS ---
        // Preguntamos al "Chef" si hay evoluciones listas
        const currentFleet = this.fleetSystem.getFleetData(); // Necesitamos un método que nos dé las naves
        const availableEvolutions = this.synergyManager.getAvailableEvolutions(this.getAcquiredPowerUpsAsSet(), currentFleet);
        
        if (availableEvolutions.length > 0) {
            console.log("🌟 ¡Evoluciones disponibles!", availableEvolutions.map(e => e.name));
            pools.Special.push(...availableEvolutions);
        }
        // -------------------------

        // Lógica de "3 de 4" (o más) categorías
        const availableCategories = Object.keys(pools).filter(key => pools[key].length > 0);
        
        // Barajar las categorías
        for (let i = availableCategories.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableCategories[i], availableCategories[j]] = [availableCategories[j], availableCategories[i]];
        }

        // Seleccionar hasta 3 power-ups de 3 categorías diferentes
        for (let i = 0; i < 3 && i < availableCategories.length; i++) {
            const categoryKey = availableCategories[i];
            const pool = pools[categoryKey];
            const randomIndex = Math.floor(Math.random() * pool.length);
            this.powerUpOptions.push(pool[randomIndex]);
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
        console.log(`✨ Aplicando power-up: ${powerUp.name} (${powerUp.type})`);
        console.log(`🔍 Efecto:`, powerUp.effect);
        
        try {
            this.applyPowerUpEffect(powerUp);
            const currentLevel = this.acquiredPowerUps.get(powerUp.id) || 0;
            this.acquiredPowerUps.set(powerUp.id, currentLevel + 1);
            console.log(`✅ Power-up [${powerUp.id}] adquirido. Nuevo nivel: ${currentLevel + 1}`);
        } catch (error) {
            console.error(`❌ Error aplicando power-up ${powerUp.name}:`, error);
            console.error(`🔍 Detalles del power-up:`, powerUp);
            return; // No continuar si hay error
        }
        
        // Finalizar selección
        this.isLevelUpPending = false;
        this.powerUpOptions = [];
        this.eventBus.publish('game:set_state', 'PLAYING');
    }
    
    /**
     * Aplica el efecto del power-up al jugador
     */
    applyPowerUpEffect(powerUp) {
        const effect = powerUp.effect;
        
        switch (powerUp.type) {
            case 'Commander':
                this.applyCommanderEffect(effect);
                break;
            case 'Special':
            case 'Utility': // Añadimos Utility
                this.applySpecialEffect(effect);
                break;
            case 'Fleet':
                this.applyFleetEffect(effect);
                break;
            case 'Evolution': // <-- NUEVO TIPO DE POWER-UP
                this.applyEvolutionEffect(effect);
                break;
            default:
                console.warn("⚠️ Tipo de power-up desconocido:", powerUp.type);
        }
    }
    
    /**
     * Aplica efectos que modifican directamente al comandante
     */
    applyCommanderEffect(effect) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent);
        if (playerEntities.length === 0) {
            console.error("❌ No se encontró la entidad del jugador para aplicar el power-up.");
            return;
        }
        const playerId = playerEntities[0];
        const prop = effect.prop;
        let componentToModify;
        let oldValue;

        // CASO 1: El power-up modifica directamente una propiedad de un componente del jugador.
        const componentMap = {
            'maxSpeed': PhysicsComponent,
            'friction': PhysicsComponent,
            'maxHp': HealthComponent,
            'healthRegen': HealthComponent,
            'fireRate': WeaponComponent
        };

        if (componentMap[prop]) {
            componentToModify = this.entityManager.getComponent(playerId, componentMap[prop]);
            if (componentToModify) {
                oldValue = componentToModify[prop];
                if (effect.multiplier) componentToModify[prop] *= effect.multiplier;
                if (effect.additive) componentToModify[prop] += effect.additive;
                
                console.log(`🔧 Propiedad [${prop}] en ${componentToModify.constructor.name} cambiada: ${oldValue.toFixed(2)} → ${componentToModify[prop].toFixed(2)}`);
                
                // Caso especial: si es HP máximo, también curar al jugador
                if (prop === 'maxHp') {
                    const health = this.entityManager.getComponent(playerId, HealthComponent);
                    health.hp = Math.min(health.hp + effect.additive, health.maxHp);
                }
            }
            return; // Misión cumplida para este tipo de power-up.
        }

        // CASO 2: Power-ups con lógica especial (como 'pierce', 'bounces', 'damage' o 'CHANGE_WEAPON').
        // Primero verificamos si es un efecto especial de cambio de arma
        if (effect.type === 'CHANGE_WEAPON') {
            const playerWeapon = this.entityManager.getComponent(playerId, WeaponComponent);
            if (playerWeapon) {
                console.log(`🔫 Cambio de Arma! De ${playerWeapon.projectileTypeId} a ${effect.newProjectileTypeId}`);
                playerWeapon.projectileTypeId = effect.newProjectileTypeId;
            }
            return;
        }

        switch (prop) {
            case 'pierce':
                componentToModify = this.entityManager.getComponent(playerId, WeaponComponent);
                if (componentToModify) {
                    oldValue = componentToModify.bonusPierce;
                    componentToModify.bonusPierce += effect.additive;
                    console.log(`🔧 Propiedad [bonusPierce] en WeaponComponent cambiada: ${oldValue} → ${componentToModify.bonusPierce}`);
                }
                break;
                
            case 'bounces':
                componentToModify = this.entityManager.getComponent(playerId, WeaponComponent);
                if (componentToModify) {
                    oldValue = componentToModify.bonusBounces;
                    componentToModify.bonusBounces += effect.additive;
                    console.log(`🔧 Propiedad [bonusBounces] en WeaponComponent cambiada: ${oldValue} → ${componentToModify.bonusBounces}`);
                }
                break;
                
            case 'damage':
                const playerWeapon = this.entityManager.getComponent(playerId, WeaponComponent);
                if (playerWeapon) {
                    const projectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[playerWeapon.projectileTypeId];
                    if (projectileDef) {
                        oldValue = projectileDef.DAMAGE;
                        projectileDef.DAMAGE *= effect.multiplier;
                        console.log(`🔧 Propiedad [DAMAGE] en ${playerWeapon.projectileTypeId} cambiada: ${oldValue.toFixed(2)} → ${projectileDef.DAMAGE.toFixed(2)}`);
                    }
                }
                break;
                
            case 'acceleration':
                oldValue = CONFIG.PLAYER.ACCELERATION;
                CONFIG.PLAYER.ACCELERATION *= effect.multiplier;
                console.log(`🔧 Propiedad [ACCELERATION] en CONFIG.PLAYER cambiada: ${oldValue.toFixed(2)} → ${CONFIG.PLAYER.ACCELERATION.toFixed(2)}`);
                break;
                
            default:
                console.warn(`⚠️ Propiedad de power-up de comandante no manejada: ${prop}`);
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
            
            // Publicar evento para que la AllyFactory cree la nave
            this.eventBus.publish('fleet:add_ship', { shipType: shipType });
            console.log(`🚀 Solicitando añadir nave a la flota: ${shipType}`);
        }
    }
    
    /**
     * Aplica efectos de evolución que modifican el sistema de juego
     */
    applyEvolutionEffect(effect) {
        console.log("🧬 Aplicando efecto de EVOLUCIÓN:", effect);
        
        switch (effect.type) {
            case 'EVOLVE_ALLY':
                // Publicar un evento que el AllyFactory escuchará
                this.eventBus.publish('fleet:evolve_ship', { from: effect.from, to: effect.to });
                break;
            case 'EVOLVE_WEAPON':
                // Publicar un evento que el WeaponComponent/System del jugador escuchará
                this.eventBus.publish('player:evolve_weapon', { newProjectileTypeId: effect.newProjectileTypeId });
                break;
            default:
                console.warn(`Tipo de efecto de evolución desconocido: ${effect.type}`);
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
        const optionWidth = 300;
        const optionHeight = 120;
        const spacing = 20;
        const numOptions = this.powerUpOptions.length;
        // Calcular el ancho total del grupo de tarjetas
        const totalWidth = numOptions * optionWidth + (numOptions - 1) * spacing;
        // Calcular el punto de inicio para centrar el grupo
        const startX = centerX - totalWidth / 2;

        // Fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`¡NIVEL ${this.currentLevel}!`, centerX, centerY - 200);
        ctx.font = '20px Arial';
        ctx.fillText('Elige una mejora:', centerX, centerY - 160);

        // Renderizar opciones
        this.powerUpOptions.forEach((option, index) => {
            const x = startX + index * (optionWidth + spacing);
            const y = centerY - optionHeight/2;

            // Fondo de la opción
            ctx.fillStyle = index === this.selectedOptionIndex ? '#4A90E2' : '#2C3E50';
            ctx.fillRect(x, y, optionWidth, optionHeight);

            // Borde
            ctx.strokeStyle = index === this.selectedOptionIndex ? '#FFFFFF' : '#7F8C8D';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, optionWidth, optionHeight);

            // Texto
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(option.name, x + optionWidth/2, y + 30);

            ctx.font = '14px Arial';
            ctx.fillText(option.description, x + optionWidth/2, y + 55);

            // Indicador de nivel (NUEVO)
            const currentLevel = this.getPowerUpLevel(option.id);
            const maxLevel = option.maxLevel || 1;
            if (currentLevel > 0) {
                ctx.fillStyle = '#F39C12';
                ctx.font = '12px Arial';
                ctx.fillText(`Nivel ${currentLevel}/${maxLevel}`, x + optionWidth/2, y + 75);
            }

            // Indicador de selección
            if (index === this.selectedOptionIndex) {
                ctx.fillStyle = '#F39C12';
                ctx.fillText('►', x + 10, y + 30);
            }

            // Número de opción
            ctx.fillStyle = '#BDC3C7';
            ctx.font = '12px Arial';
            ctx.fillText(`${index + 1}`, x + optionWidth - 20, y + 20);
        });

        // Instrucciones
        ctx.fillStyle = '#BDC3C7';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Usa ↑↓ para navegar, ENTER para seleccionar', centerX, centerY + 150);
        ctx.fillText('O presiona 1, 2, 3 para selección rápida', centerX, centerY + 175);
    }
    
    /**
     * Obtiene el progreso de XP actual
     */
    getXPProgress() {
        return {
            current: this.currentXP,
            required: this.xpToNextLevel,
            level: this.currentLevel,
            progress: this.currentXP / this.xpToNextLevel
        };
    }

    /**
     * Obtiene el progreso de XP como porcentaje para el HUD (método legacy)
     */
    getXPProgressPercentage() {
        const totalXPForCurrentLevel = this.xpToNextLevel;
        const xpInCurrentLevel = this.currentXP;
        return Math.min(xpInCurrentLevel / totalXPForCurrentLevel, 1.0);
    }

    /**
     * Obtiene el Map de power-ups adquiridos por el jugador
     * @returns {Map<string, number>} - Map con los IDs de power-ups adquiridos y sus niveles
     */
    getAcquiredPowerUps() {
        return this.acquiredPowerUps;
    }

    /**
     * Obtiene los power-ups adquiridos como Set para compatibilidad con SynergyManager
     * @returns {Set<string>} - Set con los IDs de power-ups adquiridos
     */
    getAcquiredPowerUpsAsSet() {
        return new Set(this.acquiredPowerUps.keys());
    }

    /**
     * Obtiene el nivel actual de un power-up específico
     * @param {string} powerUpId - ID del power-up
     * @returns {number} - Nivel actual (0 si no se ha adquirido)
     */
    getPowerUpLevel(powerUpId) {
        return this.acquiredPowerUps.get(powerUpId) || 0;
    }

    /**
     * Obtiene información de debug sobre el estado del sistema
     */
    getDebugInfo() {
        return {
            currentLevel: this.currentLevel,
            currentXP: this.currentXP,
            xpToNextLevel: this.xpToNextLevel,
            acquiredPowerUps: Array.from(this.acquiredPowerUps.entries()),
            powerUpCount: this.acquiredPowerUps.size,
            xpMultiplier: this.xpMultiplier,
            materialMultiplier: this.materialMultiplier,
            collectionRadius: this.collectionRadius
        };
    }
} 