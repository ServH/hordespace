import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class AimSystem extends System {
    constructor(entityManager, eventBus, mousePosition, mouseAimActive, camera) {
        super(entityManager, eventBus);
        this.mousePosition = mousePosition;
        this.mouseAimActive = mouseAimActive;
        this.camera = camera;
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (entities.length === 0) return;

        const playerId = entities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);

        let targetAngle = transform.angle; // Por defecto, mantenemos el ángulo actual

        if (this.mouseAimActive) {
            // La posición de la nave EN PANTALLA es siempre el centro de la cámara/canvas.
            const playerScreenX = this.camera.width / 2;
            const playerScreenY = this.camera.height / 2;
            
            // La posición del ratón YA está en coordenadas de pantalla.
            const mouseX = this.mousePosition.x;
            const mouseY = this.mousePosition.y;

            // Ahora la matemática tiene sentido. Comparamos dos puntos en el mismo "mapa".
            // Usamos la fórmula que ya sabíamos que funcionaba perfectamente.
            targetAngle = Math.atan2(mouseX - playerScreenX, -(mouseY - playerScreenY));

        } else {
            // La lógica de alineación por velocidad se mantiene, ya que se basa en
            // el vector de velocidad, que no depende de la posición.
            const speed = Math.hypot(transform.velocity.x, transform.velocity.y);
            if (speed > 5) {
                targetAngle = Math.atan2(transform.velocity.x, -transform.velocity.y);
            }
        }

        // La interpolación suave del ángulo se mantiene igual
        let angleDiff = targetAngle - transform.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // He quitado "* 60" y he aumentado el factor de suavizado.
        // Multiplicar por deltaTime ya normaliza el tiempo.
        transform.angle += angleDiff * CONFIG.PLAYER.AIM_SMOOTHING_FACTOR * 10 * deltaTime;
    }
} 