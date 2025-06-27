import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';

/**
 * PhysicsSystem - Aplica la física básica a las entidades.
 * Opera sobre entidades con TransformComponent.
 */
export default class PhysicsSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(TransformComponent);

        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);

            // --- Lógica copiada y adaptada de Ship.update() ---

            // La fricción y maxSpeed ahora deben estar en un componente.
            // Por ahora, para probar, podemos usar valores fijos o leerlos de un futuro PhysicsComponent.
            const friction = 0.95; // Valor temporal
            const maxSpeed = 300; // Valor temporal

            // Aplicar aceleración a velocidad
            transform.velocity.x += transform.acceleration.x * deltaTime;
            transform.velocity.y += transform.acceleration.y * deltaTime;

            // Aplicar fricción
            transform.velocity.x *= Math.pow(friction, deltaTime);
            transform.velocity.y *= Math.pow(friction, deltaTime);

            // Limitar velocidad máxima
            const currentSpeed = Math.sqrt(transform.velocity.x * transform.velocity.x + transform.velocity.y * transform.velocity.y);
            if (currentSpeed > maxSpeed) {
                const ratio = maxSpeed / currentSpeed;
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