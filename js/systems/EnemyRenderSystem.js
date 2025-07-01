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

    _drawEnemyShip(ctx, size, isBeingBeamed, enemyType) {
        const mainColor = isBeingBeamed ? 'white' : '#CC0000';
        
        // El color del núcleo ahora depende del tipo de enemigo
        const glowColor = isBeingBeamed ? 'white' : 
                          (enemyType === 'elite' ? CONFIG.ENEMY.ELITE.COLOR : CONFIG.ENEMY.DEFAULT.COLOR);
        const accentColor = enemyType === 'elite' ? '#660066' : '#440000';

        ctx.save();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;

        // 1. Alas/Cuchillas
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.moveTo(0, size); // Punta inferior
        ctx.lineTo(-size, -size * 0.5);
        ctx.lineTo(-size * 0.4, -size * 0.3);
        ctx.lineTo(0, size * 0.5); // Pliegue central
        ctx.lineTo(size * 0.4, -size * 0.3);
        ctx.lineTo(size, -size * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Núcleo/Ojo brillante
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        const pulse = 0.8 + Math.sin(Date.now() / 150) * 0.2; // Pulso más rápido
        ctx.arc(0, 0, size * 0.3 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

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
            
            // Obtener el tipo de enemigo
            const enemyComp = this.entityManager.getComponent(entityId, EnemyComponent);
            
            // Dibujar el nuevo diseño "Reaver" del enemigo
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(transform.angle);
            this._drawEnemyShip(this.ctx, size, isBeingBeamed, enemyComp.typeId);
            this.ctx.rotate(-transform.angle);
            this.ctx.translate(-screenX, -screenY);
            
            this.ctx.restore(); // Restauramos el estado del canvas para no afectar a otros dibujos
        }
    }
} 