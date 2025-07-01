import System from './System.js';
import EffectComponent from '../components/EffectComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class EffectRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(EffectComponent, TransformComponent);
        this.ctx.save();
        
        for (const id of entities) {
            const effect = this.entityManager.getComponent(id, EffectComponent);
            const transform = this.entityManager.getComponent(id, TransformComponent);

            const progress = effect.timer / effect.duration;
            const alpha = 1 - progress;

            if (effect.type === 'upgrade_pulse') {
                const radius = 40 * progress;
                this.ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(
                    transform.position.x - this.camera.x + this.camera.width / 2, 
                    transform.position.y - this.camera.y + this.camera.height / 2, 
                    radius, 0, Math.PI * 2
                );
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(EffectComponent);
        for (const id of entities) {
            this.entityManager.getComponent(id, EffectComponent).timer += deltaTime;
        }
    }
} 