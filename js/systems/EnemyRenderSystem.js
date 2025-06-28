import System from './System.js';
import EnemyComponent from '../components/EnemyComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class EnemyRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
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
            
            // Posición de la entidad en el mundo infinito
            const worldX = transform.position.x;
            const worldY = transform.position.y;
            
            // Traducimos a coordenadas relativas a la esquina superior izquierda del canvas
            const screenX = worldX - this.camera.x + (this.camera.width / 2);
            const screenY = worldY - this.camera.y + (this.camera.height / 2);
            
            const size = render.radius;
            
            // Dibujar triángulo apuntando hacia abajo (enemigo)
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY - size);
            this.ctx.lineTo(screenX - size, screenY + size);
            this.ctx.lineTo(screenX + size, screenY + size);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
} 