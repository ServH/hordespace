import System from './System.js';
import ExplosionEffectComponent from '../components/ExplosionEffectComponent.js';

export default class ExplosionAnimationSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.requiredComponents = ['ExplosionEffectComponent', 'TransformComponent'];
    }
    
    update(deltaTime) {
        // Usamos el método correcto para obtener las entidades
        const entities = this.entityManager.getEntitiesWith(ExplosionEffectComponent);

        for (const entityId of entities) {
            const explosionEffect = this.entityManager.getComponent(entityId, ExplosionEffectComponent);

            // La lógica de animación se mantiene, pero la separamos del dibujado
            explosionEffect.timer += deltaTime;
            const duration = explosionEffect.duration;
            const expandDuration = duration * 0.25;
            const peakDuration = duration * 0.15;

            if (explosionEffect.timer < expandDuration) {
                explosionEffect.phase = 'expanding';
            } else if (explosionEffect.timer < expandDuration + peakDuration) {
                explosionEffect.phase = 'peak';
            } else {
                explosionEffect.phase = 'fading';
            }
        }
    }
    
    /**
     * Actualiza las partículas de la explosión
     * @param {ExplosionEffectComponent} explosionEffect - Componente de efecto
     * @param {TransformComponent} transform - Componente de transformación
     * @param {number} deltaTime - Tiempo transcurrido
     */
    updateParticles(explosionEffect, transform, deltaTime) {
        for (const particle of explosionEffect.particles) {
            // Actualizar posición relativa al centro de la explosión
            particle.x = transform.position.x + particle.vx * explosionEffect.timer;
            particle.y = transform.position.y + particle.vy * explosionEffect.timer;
            
            // Aplicar fricción
            particle.vx *= CONFIG.EXPLOSION_EFFECTS.PARTICLES.FRICTION;
            particle.vy *= CONFIG.EXPLOSION_EFFECTS.PARTICLES.FRICTION;
            
            // Actualizar vida
            particle.life -= deltaTime;
            
            // Actualizar alpha y tamaño basado en vida restante
            const lifeRatio = particle.life / particle.maxLife;
            particle.alpha = Math.max(0, lifeRatio);
            particle.size = particle.maxSize * lifeRatio;
        }
        
        // Filtrar partículas muertas
        explosionEffect.particles = explosionEffect.particles.filter(p => p.life > 0);
    }
} 