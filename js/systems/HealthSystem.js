import System from './System.js';
import HealthComponent from '../components/HealthComponent.js';
import InFormationBonusActiveComponent from '../components/InFormationBonusActiveComponent.js';

/**
 * HealthSystem - Gestiona toda la lógica relacionada con la salud de las entidades.
 * Incluye regeneración natural y bonificaciones especiales como el bono de formación.
 */
export default class HealthSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(HealthComponent);

        for (const entityId of entities) {
            const health = this.entityManager.getComponent(entityId, HealthComponent);

            // Calculamos la regeneración total
            let totalRegen = health.healthRegen || 0;

            // --- LÓGICA DEL BONO DE FORMACIÓN ---
            // Si la entidad tiene el bono de formación, le añadimos la regeneración extra.
            if (this.entityManager.hasComponent(entityId, InFormationBonusActiveComponent)) {
                const bonusComponent = this.entityManager.getComponent(entityId, InFormationBonusActiveComponent);
                
                // Comprobamos si tiene el bono REPAIR activo
                if (bonusComponent && bonusComponent.activeBonuses.has('REPAIR')) {
                    const repairBonus = CONFIG.FORMATION.FORMATION_BONUSES.REPAIR;
                    totalRegen += repairBonus.healthRegen || 1;
                }
            }
            // ------------------------------------

            // Aplicamos la regeneración si hay alguna
            if (totalRegen > 0 && health.hp < health.maxHp) {
                health.hp = Math.min(health.maxHp, health.hp + totalRegen * deltaTime);
            }
        }
    }
} 