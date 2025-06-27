import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ProjectileRenderSystem extends System {
    constructor(entityManager, eventBus, spriteCache, ctx) {
        super(entityManager, eventBus);
        this.spriteCache = spriteCache;
        this.ctx = ctx;
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(TransformComponent, ProjectileComponent, RenderComponent);
        
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const renderComp = this.entityManager.getComponent(entityId, RenderComponent);
            
            // Usar sprite cacheado si está disponible
            const sprite = this.spriteCache.get(renderComp.visualType);
            if (sprite) {
                this.ctx.save();
                this.ctx.translate(transform.position.x, transform.position.y);
                this.ctx.rotate(transform.angle);
                this.ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
                this.ctx.restore();
            } else {
                // Fallback: renderizado básico
                this.ctx.save();
                this.ctx.translate(transform.position.x, transform.position.y);
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, renderComp.radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
} 