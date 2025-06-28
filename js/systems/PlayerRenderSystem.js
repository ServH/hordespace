import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import InvincibilityComponent from '../components/InvincibilityComponent.js';

export default class PlayerRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    update(deltaTime) {}

    render() {
        const players = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent, RenderComponent, HealthComponent);
        if (players.length === 0) return;

        const playerId = players[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);
        const render = this.entityManager.getComponent(playerId, RenderComponent);
        const health = this.entityManager.getComponent(playerId, HealthComponent);
        const isInvincible = this.entityManager.hasComponent(playerId, InvincibilityComponent);

        // El jugador SIEMPRE se dibuja en el centro de la pantalla
        const screenX = this.camera.width / 2;
        const screenY = this.camera.height / 2;
        const size = render.radius;

        this.ctx.save();
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(transform.angle);

        // Efecto de parpadeo si es invencible
        if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.globalAlpha = 0.3;
        }

        // Lógica de dibujado copiada de PlayerShip.js
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(-size * 0.6, size * 0.8);
        this.ctx.lineTo(size * 0.6, size * 0.8);
        this.ctx.closePath();
        this.ctx.fillStyle = CONFIG.PLAYER.COLOR;
        this.ctx.fill();
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
        
        // Lógica de la barra de vida (simplificada)
        if (health.hp < health.maxHp) {
            const barWidth = size * 2;
            const barHeight = 4;
            const barY = screenY - size - 15;
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth * (health.hp / health.maxHp), barHeight);
        }
    }
} 