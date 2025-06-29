import System from './System.js';
import ExplosionEffectComponent from '../components/ExplosionEffectComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class ExplosionRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }
    
    render() {
        const entities = this.entityManager.getEntitiesWith(ExplosionEffectComponent, TransformComponent);
        
        this.ctx.save();
        for (const entityId of entities) {
            const explosion = this.entityManager.getComponent(entityId, ExplosionEffectComponent);
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Convertimos la posición del mundo a la posición de la pantalla
            const screenX = transform.position.x - this.camera.x + this.camera.width / 2;
            const screenY = transform.position.y - this.camera.y + this.camera.height / 2;
            
            // Lógica de renderizado (es la misma, pero usa screenX/Y)
            const progress = explosion.timer / explosion.duration;
            let currentSize = 0;
            
            if (explosion.phase === 'expanding') {
                currentSize = explosion.baseSize * (explosion.timer / (explosion.duration * 0.25));
            } else if (explosion.phase === 'peak') {
                currentSize = explosion.baseSize;
            } else { // Fading
                const fadeProgress = (explosion.timer - (explosion.duration * 0.4)) / (explosion.duration * 0.6);
                currentSize = explosion.baseSize * (1 - fadeProgress);
            }
            
            if(currentSize <= 0) continue;
            
            // Renderizar núcleo con gradiente
            const alpha = Math.min(1, 2 * (1 - progress));
            this.ctx.globalAlpha = alpha;
            const gradient = this.ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, currentSize);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(255, 170, 0, ${alpha * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, currentSize, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }
} 