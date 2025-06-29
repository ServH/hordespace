import System from './System.js';
import EnemyComponent from '../components/EnemyComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import IsTakingBeamDamageComponent from '../components/IsTakingBeamDamageComponent.js';

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
        
        for (const entityId of enemies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            
            // Comprobamos si el enemigo tiene la etiqueta de "siendo dañado por rayo"
            const isBeingBeamed = this.entityManager.hasComponent(entityId, IsTakingBeamDamageComponent);
            
            this.ctx.save(); // Guardamos el estado del canvas
            
            if (isBeingBeamed) {
                // Si está siendo dañado, lo tintamos de blanco y lo hacemos parpadear.
                this.ctx.fillStyle = 'white';
                this.ctx.strokeStyle = 'lightgray';
                this.ctx.globalAlpha = Math.random() * 0.5 + 0.5; // Opacidad aleatoria para parpadeo
            } else {
                // Si no, lo dibujamos con su color normal.
                this.ctx.fillStyle = 'red';
                this.ctx.strokeStyle = 'darkred';
            }
            
            this.ctx.lineWidth = 2;
            
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
            
            this.ctx.restore(); // Restauramos el estado del canvas para no afectar a otros dibujos
        }
    }
} 