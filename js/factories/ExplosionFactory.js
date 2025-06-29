import TransformComponent from '../components/TransformComponent.js';
import ExplosionEffectComponent from '../components/ExplosionEffectComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';

export default class ExplosionFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        
        // Suscribirse al evento de enemigo destruido
        this.eventBus.subscribe('enemy:destroyed', this.onEnemyDestroyed.bind(this));
        
        console.log("🏭 ExplosionFactory inicializada");
    }
    
    /**
     * Maneja el evento de enemigo destruido
     * @param {Object} data - Datos del evento
     */
    onEnemyDestroyed(data) {
        const { position, radius = 20 } = data;
        
        if (position) {
            this.createExplosion(position.x, position.y, radius);
        }
    }
    
    /**
     * Crea una entidad de explosión
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} size - Tamaño de la explosión
     */
    createExplosion(x, y, size = 20) {
        const entity = this.entityManager.createEntity();
        
        // Componente de transformación para la posición
        const transform = new TransformComponent();
        transform.position.x = x;
        transform.position.y = y;
        
        // Componente de efecto de explosión
        const explosionEffect = new ExplosionEffectComponent({
            size: size,
            duration: CONFIG.EXPLOSION_EFFECTS.DURATION
        });
        
        // Componente de vida útil para auto-destrucción
        const lifetime = new LifetimeComponent(CONFIG.EXPLOSION_EFFECTS.DURATION);
        
        // Añadir componentes a la entidad
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, explosionEffect);
        this.entityManager.addComponent(entity, lifetime);
        
        console.log(`💥 Explosión creada en (${x.toFixed(1)}, ${y.toFixed(1)}) con tamaño ${size}`);
        
        return entity;
    }
    
    /**
     * Crea una explosión personalizada con configuración específica
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {Object} config - Configuración personalizada
     */
    createCustomExplosion(x, y, config = {}) {
        const entity = this.entityManager.createEntity();
        
        // Componente de transformación
        const transform = new TransformComponent();
        transform.position.x = x;
        transform.position.y = y;
        
        // Componente de efecto con configuración personalizada
        const explosionEffect = new ExplosionEffectComponent({
            size: config.size || 20,
            duration: config.duration || CONFIG.EXPLOSION_EFFECTS.DURATION,
            primaryColor: config.primaryColor || CONFIG.EXPLOSION_EFFECTS.COLORS[0],
            secondaryColor: config.secondaryColor || CONFIG.EXPLOSION_EFFECTS.COLORS[1]
        });
        
        // Componente de vida útil
        const lifetime = new LifetimeComponent(explosionEffect.duration);
        
        // Añadir componentes
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, explosionEffect);
        this.entityManager.addComponent(entity, lifetime);
        
        console.log(`💥 Explosión personalizada creada en (${x.toFixed(1)}, ${y.toFixed(1)})`);
        
        return entity;
    }
} 