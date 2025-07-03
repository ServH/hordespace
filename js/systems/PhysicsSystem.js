import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

/**
 * PhysicsSystem - Aplica la física básica a las entidades.
 * Opera sobre entidades con TransformComponent y PhysicsComponent.
 */
export default class PhysicsSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
    }

    update(deltaTime) {
        // Ahora solo opera sobre entidades que tienen TANTO Transform como Physics
        const entities = this.entityManager.getEntitiesWith(TransformComponent, PhysicsComponent);

        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const physics = this.entityManager.getComponent(entityId, PhysicsComponent); // ¡Obtenemos el nuevo componente!

            // Aplicar aceleración a velocidad
            transform.velocity.x += transform.acceleration.x * deltaTime;
            transform.velocity.y += transform.acceleration.y * deltaTime;

            // Aplicar fricción DESDE EL COMPONENTE
            transform.velocity.x *= Math.pow(physics.friction, deltaTime);
            transform.velocity.y *= Math.pow(physics.friction, deltaTime);

            // Limitar velocidad máxima DESDE EL COMPONENTE (a menos que se ignore el límite)
            const currentSpeed = Math.sqrt(transform.velocity.x * transform.velocity.x + transform.velocity.y * transform.velocity.y);
            const ignoreLimit = this.entityManager.hasComponent(entityId, IgnoreSpeedLimitComponent);
            if (!ignoreLimit && currentSpeed > physics.maxSpeed) {
                const ratio = physics.maxSpeed / currentSpeed;
                transform.velocity.x *= ratio;
                transform.velocity.y *= ratio;
            }

            // Actualizar posición
            transform.position.x += transform.velocity.x * deltaTime;
            transform.position.y += transform.velocity.y * deltaTime;

            // Resetear aceleración para el próximo frame
            transform.acceleration.x = 0;
            transform.acceleration.y = 0;
        }
    }
} 