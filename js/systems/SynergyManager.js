/**
 * Space Horde Survivor - SynergyManager
 * El "Chef" del sistema de sinergias y evoluciones
 * Su misión: analizar el inventario del jugador y determinar qué evoluciones están disponibles
 * 
 * Fase 2: El SynergyManager y la Lógica de Selección
 */

import System from './System.js';
import { EVOLUTION_RECIPES } from '../evolutions.js';

export default class SynergyManager extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.recipes = EVOLUTION_RECIPES;
        console.log('📜 SynergyManager cargado con ' + this.recipes.length + ' recetas.');
    }

    /**
     * Comprueba las recetas de evolución contra el estado actual del jugador.
     * @param {Set<string>} acquiredPowerUps - Un Set con los IDs de los power-ups que tiene el jugador.
     * @param {Array<object>} fleetShips - Un array de las naves actuales en la flota.
     * @returns {Array<object>} - Una lista de las recetas de evolución que están listas para ser ofrecidas.
     */
    getAvailableEvolutions(acquiredPowerUps, fleetShips) {
        const availableEvolutions = [];

        for (const recipe of this.recipes) {
            // Comprobar si ya se ha adquirido esta evolución para no ofrecerla de nuevo
            if (acquiredPowerUps.has(recipe.id)) {
                continue;
            }

            const shipsOk = this.checkShipPrerequisites(recipe.prerequisites.ships, fleetShips);
            const powerupsOk = this.checkPowerUpPrerequisites(recipe.prerequisites.powerups, acquiredPowerUps);

            if (shipsOk && powerupsOk) {
                availableEvolutions.push(recipe);
            }
        }
        
        return availableEvolutions;
    }

    /**
     * Verifica si las naves requeridas están presentes en la flota actual
     * @param {Array<string>} requiredShips - Array de tipos de naves requeridas
     * @param {Array<object>} currentFleet - Array de naves actuales en la flota
     * @returns {boolean} - True si todas las naves requeridas están presentes
     */
    checkShipPrerequisites(requiredShips, currentFleet) {
        if (requiredShips.length === 0) return true;
        // Comprueba si CADA nave requerida está presente en la flota actual.
        return requiredShips.every(reqShipType => 
            currentFleet.some(ally => ally.type === reqShipType)
        );
    }

    /**
     * Verifica si los power-ups requeridos han sido adquiridos
     * @param {Array<string>} requiredPowerUps - Array de IDs de power-ups requeridos
     * @param {Set<string>} acquiredPowerUps - Set de power-ups adquiridos
     * @returns {boolean} - True si todos los power-ups requeridos están adquiridos
     */
    checkPowerUpPrerequisites(requiredPowerUps, acquiredPowerUps) {
        if (requiredPowerUps.length === 0) return true;
        // Comprueba si CADA power-up requerido ya ha sido adquirido.
        return requiredPowerUps.every(reqId => acquiredPowerUps.has(reqId));
    }
    
    /**
     * Obtiene las categorías únicas de power-ups disponibles
     * @param {Array<object>} powerUpDefinitions - Definiciones de power-ups
     * @returns {Array<string>} - Array de categorías únicas
     */
    getAvailableCategories(powerUpDefinitions) {
        const categories = new Set();
        powerUpDefinitions.forEach(powerUp => {
            if (powerUp.category) {
                categories.add(powerUp.category);
            }
        });
        return Array.from(categories);
    }

    /**
     * Filtra power-ups por categoría
     * @param {Array<object>} powerUpDefinitions - Definiciones de power-ups
     * @param {string} category - Categoría a filtrar
     * @returns {Array<object>} - Power-ups de la categoría especificada
     */
    getPowerUpsByCategory(powerUpDefinitions, category) {
        return powerUpDefinitions.filter(powerUp => powerUp.category === category);
    }
    
    // Este sistema no necesita un método update, ya que es llamado bajo demanda.
    update(deltaTime) {} 
} 