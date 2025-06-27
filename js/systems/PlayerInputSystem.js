import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class PlayerInputSystem extends System {
    constructor(entityManager, eventBus, keyboardState) {
        super(entityManager, eventBus);
        this.keyboardState = keyboardState;
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (entities.length === 0) return;

        const playerId = entities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);

        let thrust = 0;
        if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) {
            thrust = CONFIG.PLAYER.ACCELERATION;
        }
        if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) {
            thrust = -CONFIG.PLAYER.ACCELERATION * 0.5; // Retroceso
        }

        if (thrust !== 0) {
            // Aplicamos la fuerza en la dirección que apunta la nave
            // Esta es la matemática correcta de la antigua clase Ship
            const forceX = Math.sin(transform.angle) * thrust;
            const forceY = -Math.cos(transform.angle) * thrust;
            
            transform.acceleration.x += forceX;
            transform.acceleration.y += forceY;
        }
    }
} 