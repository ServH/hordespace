import System from './System.js';
import RenderComponent from '../components/RenderComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';

export default class MaterialRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(RenderComponent, TransformComponent, CollectibleComponent);
        if (entities.length === 0) return;

        this.ctx.save();
        const time = performance.now() / 1000;

        for (const entityId of entities) {
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            if (render.visualType !== 'material_crystal') continue;

            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const collectible = this.entityManager.getComponent(entityId, CollectibleComponent);

            const screenX = transform.position.x - this.camera.x + this.camera.width / 2;
            const screenY = transform.position.y - this.camera.y + this.camera.height / 2;

            this._drawFragment(this.ctx, screenX, screenY, render.radius, time, entityId, collectible.isAttracted);
        }

        this.ctx.restore();
    }

    _drawFragment(ctx, x, y, radius, time, id, isAttracted) {
        ctx.save();
        ctx.translate(x, y);

        // Rotación constante y lenta
        ctx.rotate((time / 2) + id);

        // Efecto de vibración cuando es atraído
        if (isAttracted) {
            const vibrateX = (Math.random() - 0.5) * 2;
            const vibrateY = (Math.random() - 0.5) * 2;
            ctx.translate(vibrateX, vibrateY);
        }

        // Dibujar la forma principal irregular
        ctx.fillStyle = '#CCCCCC';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(radius * 0.8, -radius * 0.3);
        ctx.lineTo(radius * 0.5, radius * 0.7);
        ctx.lineTo(-radius * 0.5, radius * 0.7);
        ctx.lineTo(-radius * 0.8, -radius * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pulso de brillo sutil
        const pulse = 0.5 + (Math.sin(time * 3 + id) + 1) / 4; // De 0.5 a 1.0
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.5})`;
        ctx.fill();

        ctx.restore();
    }
} 