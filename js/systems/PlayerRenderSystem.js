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

    _drawCommanderShip(ctx, size) {
        const mainColor = CONFIG.PLAYER.COLOR; // '#00FF00'
        const accentColor = '#FFFFFF';
        const detailColor = '#88FFEE'; // Un cyan claro para detalles

        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 8;

        // Capa 1: Alas/Pods Laterales (la base)
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(0, size * 0.6);
        ctx.lineTo(-size * 0.7, size * 0.8);
        ctx.lineTo(-size * 0.5, -size * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, size * 0.6);
        ctx.lineTo(size * 0.7, size * 0.8);
        ctx.lineTo(size * 0.5, -size * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Capa 2: Cuerpo Principal (más claro y al frente)
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.moveTo(0, -size); // Punta de la nave
        ctx.lineTo(-size * 0.4, size * 0.9);
        ctx.lineTo(0, size * 0.7);
        ctx.lineTo(size * 0.4, size * 0.9);
        ctx.closePath();
        ctx.fill();

        // Capa 3: Cabina
        ctx.fillStyle = detailColor;
        ctx.beginPath();
        ctx.arc(0, -size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

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

        // Dibujar el nuevo diseño "Phoenix" del Comandante
        this._drawCommanderShip(this.ctx, size);

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