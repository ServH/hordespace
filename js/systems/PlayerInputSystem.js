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

        // --- NUEVA LÓGICA DE FUERZAS COMBINADAS ---

        let forwardForce = 0;
        if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) {
            forwardForce = CONFIG.PLAYER.ACCELERATION;
        } else if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) {
            forwardForce = -CONFIG.PLAYER.ACCELERATION * 0.5; // Retroceso a media potencia
        }

        let strafeForce = 0;
        if (this.keyboardState['KeyA']) { // Strafe Izquierda
            strafeForce = -CONFIG.PLAYER.STRAFE_ACCELERATION;
        } else if (this.keyboardState['KeyD']) { // Strafe Derecha
            strafeForce = CONFIG.PLAYER.STRAFE_ACCELERATION;
        }
        
        // Si no hay ninguna fuerza que aplicar, salimos pronto.
        if (forwardForce === 0 && strafeForce === 0) return;

        // Calculamos los vectores de dirección
        const forwardX = Math.sin(transform.angle);
        const forwardY = -Math.cos(transform.angle);
        
        // El vector de strafe es perpendicular al vector de avance
        const strafeX = -forwardY;
        const strafeY = forwardX;

        // Combinamos ambas fuerzas en un único vector de aceleración final
        const totalForceX = (forwardX * forwardForce) + (strafeX * strafeForce);
        const totalForceY = (forwardY * forwardForce) + (strafeY * strafeForce);

        // Aplicamos la fuerza combinada a la aceleración de la nave
        transform.acceleration.x += totalForceX;
        transform.acceleration.y += totalForceY;
    }
} 