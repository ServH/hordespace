import System from './System.js';
import EnemyComponent from '../components/EnemyComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class EnemyRenderSystem extends System {
    constructor(entityManager, eventBus, ctx) {
        super(entityManager, eventBus);
        this.ctx = ctx;
    }

    // Este sistema solo renderiza, por lo que su 'update' puede estar vacío.
    update(deltaTime) {}

    render() {
        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent, RenderComponent);
        
        this.ctx.fillStyle = 'red';
        this.ctx.strokeStyle = 'darkred';
        this.ctx.lineWidth = 2;
        
        for (const entityId of enemies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            
            const x = transform.position.x;
            const y = transform.position.y;
            const size = render.radius;
            
            // Dibujar triángulo apuntando hacia abajo (enemigo)
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - size);
            this.ctx.lineTo(x - size, y + size);
            this.ctx.lineTo(x + size, y + size);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
} 