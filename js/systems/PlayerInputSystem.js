import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import AbilitiesComponent from '../components/AbilitiesComponent.js';
import DashComponent from '../components/DashComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';
import InvincibilityComponent from '../components/InvincibilityComponent.js';

export default class PlayerInputSystem extends System {
    constructor(entityManager, eventBus, keyboardState) {
        super(entityManager, eventBus);
        this.keyboardState = keyboardState;
        this.keyFPressed = false; // Flag para evitar múltiples llamadas
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

        // --- NUEVA LÓGICA DE MOVIMIENTO DESACOPLADO ---
        // Este sistema permite movimiento libre independiente del ángulo de la nave,
        // creando la mecánica de "kiting" y "orbiting" estándar de la industria.

        const acceleration = CONFIG.PLAYER.ACCELERATION;
        let forceX = 0;
        let forceY = 0;

        // 1. Acumular la intención de movimiento en los ejes X e Y absolutos de la pantalla
        if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) {
            forceY -= 1; // Intención de ir hacia arriba
        }
        if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) {
            forceY += 1; // Intención de ir hacia abajo
        }
        if (this.keyboardState['KeyA']) {
            forceX -= 1; // Intención de ir hacia la izquierda
        }
        if (this.keyboardState['KeyD']) {
            forceX += 1; // Intención de ir hacia la derecha
        }

        // 2. Normalizar el vector de fuerza si hay movimiento diagonal
        //    Esto evita el bug clásico de moverse más rápido en diagonal
        const magnitude = Math.hypot(forceX, forceY);
        if (magnitude > 0) {
            const normalizedX = forceX / magnitude;
            const normalizedY = forceY / magnitude;
            
            // 3. Aplicar la aceleración al vector normalizado
            //    El movimiento ahora es completamente independiente del ángulo de la nave
            transform.acceleration.x += normalizedX * acceleration;
            transform.acceleration.y += normalizedY * acceleration;
        }

        // --- INICIO DE LA NUEVA LÓGICA DE HABILIDADES ---

        // 1. LÓGICA DEL DASH (TECLA ESPACIO)
        const dashConfig = CONFIG.PLAYER.ABILITIES.DASH;
        abilities.cooldowns.dash = Math.max(0, abilities.cooldowns.dash - deltaTime);

        // Si se presiona la tecla del dash, no hay cooldown, y no estamos ya en un dash...
        if (this.keyboardState[dashConfig.KEY] && abilities.cooldowns.dash === 0 && !this.entityManager.hasComponent(playerId, DashComponent)) {
            
            // --- NUEVA LÓGICA DE DIRECCIÓN ---
            let dashDirX = 0;
            let dashDirY = 0;

            if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) { dashDirY -= 1; }
            if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) { dashDirY += 1; }
            if (this.keyboardState['KeyA']) { dashDirX -= 1; }
            if (this.keyboardState['KeyD']) { dashDirX += 1; }

            const dashMagnitude = Math.hypot(dashDirX, dashDirY);

            if (dashMagnitude > 0) {
                // El jugador está pulsando una dirección, la usamos
                dashDirX /= dashMagnitude;
                dashDirY /= dashMagnitude;
            } else {
                // Si no se pulsa ninguna tecla de dirección, el dash va hacia donde mira la nave
                dashDirX = Math.sin(transform.angle);
                dashDirY = -Math.cos(transform.angle);
            }
            // --- FIN DE LA NUEVA LÓGICA ---

            // Pasamos la dirección calculada al componente
            this.entityManager.addComponent(playerId, new DashComponent(dashConfig.DURATION, { x: dashDirX, y: dashDirY }));
            this.entityManager.addComponent(playerId, new IgnoreSpeedLimitComponent());
            // MEJORA 1: Añadimos invulnerabilidad durante el dash
            this.entityManager.addComponent(playerId, new InvincibilityComponent(dashConfig.DURATION));
            
            // Y ponemos la habilidad en cooldown.
            abilities.cooldowns.dash = dashConfig.COOLDOWN;
            console.log(`⚡ DASH DIRECCIONAL con INVULNERABILIDAD ACTIVADO hacia (${dashDirX.toFixed(2)}, ${dashDirY.toFixed(2)})`);
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

        // 3. LÓGICA DE CAMBIO DE FORMACIÓN (TECLA F)
        if (this.keyboardState[CONFIG.FORMATION.FORMATION_CYCLE_KEY] && !this.keyFPressed) {
            this.eventBus.publish('command:cycle_formation');
            this.keyFPressed = true; // Flag para evitar múltiples llamadas
        }
        if (!this.keyboardState[CONFIG.FORMATION.FORMATION_CYCLE_KEY]) {
            this.keyFPressed = false;
        }

        // --- FIN DE LA NUEVA LÓGICA DE HABILIDADES ---
    }
} 