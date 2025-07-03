import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class AimSystem extends System {
    constructor(entityManager, eventBus, mousePosition, game, camera) {
        super(entityManager, eventBus);
        this.mousePosition = mousePosition;
        this.game = game;
        this.camera = camera;
    }

    update(deltaTime) {
        // Este sistema SOLO actúa si el modo es 'MANUAL'
        if (this.game.aimMode !== 'MANUAL') return;

        const entities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (entities.length === 0) return;

        const playerId = entities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);

        // En modo MANUAL siempre usamos el ratón para apuntar
        // La posición de la nave EN PANTALLA es siempre el centro de la cámara/canvas.
        const playerScreenX = this.camera.width / 2;
        const playerScreenY = this.camera.height / 2;
        
        // La posición del ratón YA está en coordenadas de pantalla.
        const mouseX = this.mousePosition.x;
        const mouseY = this.mousePosition.y;

        // Calculamos el ángulo hacia el cursor del ratón
        const targetAngle = Math.atan2(mouseX - playerScreenX, -(mouseY - playerScreenY));

        // La interpolación suave del ángulo se mantiene igual
        let angleDiff = targetAngle - transform.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // He quitado "* 60" y he aumentado el factor de suavizado.
        // Multiplicar por deltaTime ya normaliza el tiempo.
        transform.angle += angleDiff * CONFIG.PLAYER.AIM_SMOOTHING_FACTOR * 10 * deltaTime;
    }
} 