import System from './System.js';
import ThrusterComponent from '../components/ThrusterComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import ParticleComponent from '../components/ParticleComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class ThrusterSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(ThrusterComponent, TransformComponent);

        for (const entityId of entities) {
            const thruster = this.entityManager.getComponent(entityId, ThrusterComponent);
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Solo emitir partículas si la nave se está moviendo
            const isMoving = Math.abs(transform.velocity.x) > 5 || Math.abs(transform.velocity.y) > 5;
            if (!isMoving) continue;
            
            thruster.emitCooldown -= deltaTime;

            if (thruster.emitCooldown <= 0) {
                thruster.emitCooldown = 1 / thruster.emitRate; // Resetear cooldown
                this.createParticle(entityId);
            }
        }
    }

    createParticle(parentId) {
        const parentTransform = this.entityManager.getComponent(parentId, TransformComponent);
        const parentThruster = this.entityManager.getComponent(parentId, ThrusterComponent);

        // Calcular la posición del propulsor en el mundo
        const angle = parentTransform.angle;
        const offsetX = parentThruster.offset.x;
        const offsetY = parentThruster.offset.y;
        
        // Rotar el offset según el ángulo de la nave
        const worldOffsetX = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
        const worldOffsetY = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
        
        const startX = parentTransform.position.x + worldOffsetX;
        const startY = parentTransform.position.y + worldOffsetY;

        // Crear la entidad partícula
        const particleId = this.entityManager.createEntity();

        // Crear TransformComponent para la partícula
        const particleTransform = new TransformComponent(startX, startY, 0, 2);
        
        // Darle a la partícula una pequeña velocidad inicial opuesta a la de la nave
        const velocityFactor = 0.15;
        const randomSpread = 30;
        particleTransform.velocity.x = -parentTransform.velocity.x * velocityFactor + (Math.random() - 0.5) * randomSpread;
        particleTransform.velocity.y = -parentTransform.velocity.y * velocityFactor + (Math.random() - 0.5) * randomSpread;

        // Añadir componentes a la partícula
        this.entityManager.addComponent(particleId, particleTransform);
        this.entityManager.addComponent(particleId, new ParticleComponent(parentId));
        this.entityManager.addComponent(particleId, new LifetimeComponent(parentThruster.particleLifetime));
        this.entityManager.addComponent(particleId, new PhysicsComponent(100, 0.95)); // Física simple para la partícula
        this.entityManager.addComponent(particleId, new RenderComponent('particle', 3, parentThruster.particleColor));
    }
} 