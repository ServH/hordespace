import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ProjectileRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, spriteCache) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.spriteCache = spriteCache;
    }

    // Este sistema solo renderiza, por lo que su 'update' puede estar vacío.
    update(deltaTime) {}

    render() {
        const entities = this.entityManager.getEntitiesWith(ProjectileComponent, TransformComponent, RenderComponent);
        
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            const sprite = this.spriteCache.get(render.visualType);

            if (sprite) {
                const drawSize = render.radius * render.glowRadiusMultiplier * 2;
                const halfSize = drawSize / 2;

                if (render.visualType === 'laser') {
                    this.ctx.save();
                    this.ctx.translate(transform.position.x, transform.position.y);
                    this.ctx.rotate(transform.angle);
                    this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                    this.ctx.restore();
                } else {
                    this.ctx.drawImage(sprite, transform.position.x - halfSize, transform.position.y - halfSize, drawSize, drawSize);
                }
            }
        }
    }
} 