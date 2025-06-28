import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ProjectileRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, spriteCache, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.spriteCache = spriteCache;
        this.camera = camera;
    }

    // Este sistema solo renderiza, por lo que su 'update' puede estar vacío.
    update(deltaTime) {}

    render() {
        const entities = this.entityManager.getEntitiesWith(ProjectileComponent, TransformComponent, RenderComponent);
        
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            
            // Posición de la entidad en el mundo infinito
            const worldX = transform.position.x;
            const worldY = transform.position.y;
            
            // Traducimos a coordenadas relativas a la esquina superior izquierda del canvas
            const screenX = worldX - this.camera.x + (this.camera.width / 2);
            const screenY = worldY - this.camera.y + (this.camera.height / 2);
            
            const sprite = this.spriteCache.get(render.visualType);

            if (sprite) {
                const drawSize = render.radius * render.glowRadiusMultiplier * 2;
                const halfSize = drawSize / 2;

                if (render.visualType === 'laser') {
                    this.ctx.save();
                    this.ctx.translate(screenX, screenY);
                    this.ctx.rotate(transform.angle);
                    this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                    this.ctx.restore();
                } else {
                    this.ctx.drawImage(sprite, screenX - halfSize, screenY - halfSize, drawSize, drawSize);
                }
            }
        }
    }
} 