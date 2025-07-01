import System from './System.js';
import DashComponent from '../components/DashComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class DashRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(DashComponent, TransformComponent, PlayerControlledComponent);
        if (entities.length === 0) return;

        const entityId = entities[0];
        const dash = this.entityManager.getComponent(entityId, DashComponent);
        const progress = 1 - (dash.duration / CONFIG.PLAYER.ABILITIES.DASH.DURATION);

        this.ctx.save();
        this.ctx.translate(this.camera.width / 2, this.camera.height / 2);

        // Efecto: líneas que se expanden desde el centro
        const numLines = 12;
        const maxRadius = 80;
        const currentRadius = maxRadius * progress;
        const alpha = 1 - progress;

        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        this.ctx.lineWidth = 2.5;

        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * 2 * Math.PI;
            const startX = Math.sin(angle) * (currentRadius - 20);
            const startY = Math.cos(angle) * (currentRadius - 20);
            const endX = Math.sin(angle) * currentRadius;
            const endY = Math.cos(angle) * currentRadius;
            
            if (currentRadius > 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
        }

        // Efecto adicional: círculo de energía
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, currentRadius * 0.7, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }
} 