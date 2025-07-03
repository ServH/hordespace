import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';
import InFormationBonusActiveComponent from '../components/InFormationBonusActiveComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class FormationBonusSystem extends System {
    constructor(entityManager, eventBus, powerUpSystem) {
        super(entityManager, eventBus);
        this.powerUpSystem = powerUpSystem;
    }

    update(deltaTime) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        const playerId = playerEntities[0];
        const playerTransform = this.entityManager.getComponent(playerId, TransformComponent);

        const allies = this.entityManager.getEntitiesWith(FormationFollowerComponent, TransformComponent);
        
        // --- LÓGICA DE BONO ACTUALIZADA ---
        let isFormationStable = false;
        // El bono solo puede existir si hay al menos 1 aliado
        if (allies.length > 0) { 
            isFormationStable = true; // Suponemos que es estable hasta que se demuestre lo contrario
            for (const allyId of allies) {
                const allyTransform = this.entityManager.getComponent(allyId, TransformComponent);
                const follower = this.entityManager.getComponent(allyId, FormationFollowerComponent);
                const idealX = playerTransform.position.x + follower.targetOffset.x;
                const idealY = playerTransform.position.y + follower.targetOffset.y;
                const distanceToIdeal = Math.hypot(
                    allyTransform.position.x - idealX, 
                    allyTransform.position.y - idealY
                );

                if (distanceToIdeal > CONFIG.FORMATION.FORMATION_BONUS_TOLERANCE) {
                    isFormationStable = false;
                    break;
                }
            }
        }

        const bonusComponent = this.entityManager.getComponent(playerId, InFormationBonusActiveComponent);

        if (isFormationStable) {
            if (!bonusComponent) {
                // Si la formación es estable y no tiene el componente, creamos uno nuevo.
                const newBonusComponent = new InFormationBonusActiveComponent();
                this.entityManager.addComponent(playerId, newBonusComponent);
                // Ahora, lo rellenamos con los bonos que el jugador haya desbloqueado.
                this.updateActiveBonuses(newBonusComponent);
            }
            // Si ya tiene el componente, no hacemos nada, sus bonos ya están activos.
        } else {
            if (bonusComponent) {
                // Si la formación se rompe, eliminamos el componente de bonos.
                this.entityManager.removeComponent(playerId, InFormationBonusActiveComponent);
                console.log("❌ Formación rota. Bonos DESACTIVADOS.");
            }
        }
    }

    /**
     * Actualiza los bonos activos basándose en los power-ups adquiridos
     */
    updateActiveBonuses(bonusComponent) {
        bonusComponent.activeBonuses.clear(); // Limpiamos los bonos antiguos

        // Obtenemos los power-ups que ha adquirido el jugador
        const acquired = this.powerUpSystem.getAcquiredPowerUps();

        for (const [powerUpId, level] of acquired.entries()) {
            const powerUpDef = CONFIG.POWER_UP_DEFINITIONS.find(p => p.id === powerUpId);
            // Si el power-up es de tipo 'FormationUnlock', añadimos su bono a la lista de activos
            if (powerUpDef && powerUpDef.type === 'FormationUnlock' && level > 0) {
                bonusComponent.activeBonuses.add(powerUpDef.effect.bonusId);
                console.log(`✅ Bono de Formación ACTIVADO: ${powerUpDef.effect.bonusId}`);
            }
        }
    }
} 