import System from './System.js';
import DamageCooldownComponent from '../components/DamageCooldownComponent.js';
import IsTakingBeamDamageComponent from '../components/IsTakingBeamDamageComponent.js';

export default class DamageCooldownSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(DamageCooldownComponent);
        for (const entityId of entities) {
            const cooldownComp = this.entityManager.getComponent(entityId, DamageCooldownComponent);
            for (const [damageType, timer] of cooldownComp.cooldowns.entries()) {
                const newTime = timer - deltaTime;
                if (newTime <= 0) {
                    cooldownComp.cooldowns.delete(damageType);
                    
                    if (damageType === 'beam') {
                        this.entityManager.removeComponent(entityId, IsTakingBeamDamageComponent);
                    }
                } else {
                    cooldownComp.cooldowns.set(damageType, newTime);
                }
            }
            if (cooldownComp.cooldowns.size === 0) {
                this.entityManager.removeComponent(entityId, DamageCooldownComponent);
            }
        }
    }
} 