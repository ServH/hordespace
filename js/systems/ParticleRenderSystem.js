import System from './System.js';
import ParticleComponent from '../components/ParticleComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';

export default class ParticleRenderSystem extends System {
    constructor(entityManager, eventBus, ctx) {
        super(entityManager, eventBus);
        this.ctx = ctx;
    }

    update(deltaTime) {} // No necesita lógica de update

    render() {
        const particles = this.entityManager.getEntitiesWith(ParticleComponent, TransformComponent, RenderComponent, LifetimeComponent);
        
        for (const entityId of particles) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            const lifetime = this.entityManager.getComponent(entityId, LifetimeComponent);

            // La opacidad se desvanece con el tiempo
            const lifeRatio = lifetime.timer / lifetime.maxLife;
            const alpha = Math.max(0, 1 - lifeRatio);
            
            // El tamaño también se reduce con el tiempo
            const sizeRatio = Math.max(0.1, 1 - lifeRatio * 0.7);
            
            this.ctx.globalAlpha = alpha;

            // Dibujar la partícula con efecto de glow
            const particleRadius = render.radius * sizeRatio;
            
            // Glow exterior
            this.ctx.fillStyle = render.color || '#00FFFF';
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(transform.position.x, transform.position.y, particleRadius * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Núcleo brillante
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(transform.position.x, transform.position.y, particleRadius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1.0; // Restaurar opacidad global
    }
} 