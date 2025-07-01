import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import AbilitiesComponent from '../components/AbilitiesComponent.js';
import DashComponent from '../components/DashComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

export default class PlayerInputSystem extends System {
    constructor(entityManager, eventBus, keyboardState) {
        super(entityManager, eventBus);
        this.keyboardState = keyboardState;
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(
            PlayerControlledComponent,
            TransformComponent,
            PhysicsComponent,
            AbilitiesComponent
        );
        if (entities.length === 0) return;

        const playerId = entities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);
        const physics = this.entityManager.getComponent(playerId, PhysicsComponent);
        const abilities = this.entityManager.getComponent(playerId, AbilitiesComponent);

        // --- LÓGICA DE MOVIMIENTO (EXISTENTE) ---

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
        
        // Aplicar fuerzas de movimiento si las hay
        if (forwardForce !== 0 || strafeForce !== 0) {
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

        // --- INICIO DE LA NUEVA LÓGICA DE HABILIDADES ---

        // 1. LÓGICA DEL DASH (TECLA ESPACIO)
        const dashConfig = CONFIG.PLAYER.ABILITIES.DASH;
        abilities.cooldowns.dash = Math.max(0, abilities.cooldowns.dash - deltaTime);

        // Si se presiona la tecla del dash, no hay cooldown, y no estamos ya en un dash...
        if (this.keyboardState[dashConfig.KEY] && abilities.cooldowns.dash === 0 && !this.entityManager.hasComponent(playerId, DashComponent)) {
            // ...entonces añadimos el componente Dash para activar el efecto.
            this.entityManager.addComponent(playerId, new DashComponent(dashConfig.DURATION));
            this.entityManager.addComponent(playerId, new IgnoreSpeedLimitComponent());
            // Y ponemos la habilidad en cooldown.
            abilities.cooldowns.dash = dashConfig.COOLDOWN;
            console.log('⚡ DASH ACTIVADO');
        }

        // 2. LÓGICA DEL FRENO (REFACTORIZADA - FUERZA ACTIVA)
        const brakeConfig = CONFIG.PLAYER.ABILITIES.BRAKE;
        if (this.keyboardState[brakeConfig.KEY]) {
            // Si la nave se está moviendo, aplicamos una fuerza de frenado
            const speed = Math.hypot(transform.velocity.x, transform.velocity.y);
            if (speed > 1) {
                // Calculamos una fuerza que se opone directamente a la velocidad actual
                const brakeForce = speed * brakeConfig.BRAKE_FORCE_MULTIPLIER;
                transform.acceleration.x -= (transform.velocity.x / speed) * brakeForce;
                transform.acceleration.y -= (transform.velocity.y / speed) * brakeForce;
            }
        }

        // --- FIN DE LA NUEVA LÓGICA DE HABILIDADES ---
    }
} 