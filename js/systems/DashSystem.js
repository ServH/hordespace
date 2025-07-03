import System from './System.js';
import DashComponent from '../components/DashComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

export default class DashSystem extends System {
    update(deltaTime) {
        // Buscamos la entidad que está actualmente en estado de "dash"
        const entities = this.entityManager.getEntitiesWith(DashComponent, TransformComponent);
        if (entities.length === 0) return;

        const entityId = entities[0];
        const dash = this.entityManager.getComponent(entityId, DashComponent);
        const transform = this.entityManager.getComponent(entityId, TransformComponent);
        const dashConfig = CONFIG.PLAYER.ABILITIES.DASH;

        // 1. Aplicamos la fuerza del dash usando la dirección guardada en el componente
        const forceX = dash.direction.x * dashConfig.FORCE;
        const forceY = dash.direction.y * dashConfig.FORCE;
        transform.acceleration.x += forceX;
        transform.acceleration.y += forceY;

        // 2. Reducimos la duración restante del dash
        dash.duration -= deltaTime;

        // 3. Si el tiempo del dash ha terminado, eliminamos los componentes.
        if (dash.duration <= 0) {
            this.entityManager.removeComponent(entityId, DashComponent);
            this.entityManager.removeComponent(entityId, IgnoreSpeedLimitComponent);
            // El InvincibilityComponent se elimina automáticamente gracias al InvincibilitySystem
            console.log('💨 DASH TERMINADO');
        }
    }
} 