import TransformComponent from '../components/TransformComponent.js';
import MaterialComponent from '../components/MaterialComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class MaterialFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        
        // Suscribirse al evento de enemigo destruido
        this.eventBus.subscribe('enemy:destroyed', this.onEnemyDestroyed.bind(this));
        
        console.log("🏭 MaterialFactory inicializada");
    }
    
    /**
     * Maneja el evento de enemigo destruido
     * @param {Object} data - Datos del evento
     */
    onEnemyDestroyed(data) {
        const { position, radius = 20 } = data;
        
        if (position) {
            // Decidir si dropear material basado en la configuración
            const dropChance = CONFIG.MATERIAL?.DROP_CHANCE || 0.3;
            
            if (Math.random() < dropChance) {
                this.createMaterial(position.x, position.y, radius);
            }
        }
    }
    
    /**
     * Crea una entidad de material
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} enemyRadius - Radio del enemigo para calcular impulso inicial
     */
    createMaterial(x, y, enemyRadius = 20) {
        const entity = this.entityManager.createEntity();
        
        // Componente de transformación con impulso inicial
        const transform = new TransformComponent();
        transform.position.x = x;
        transform.position.y = y;
        
        // Impulso inicial simulando la expulsión del enemigo
        const impulseStrength = enemyRadius * 2;
        transform.velocity.x = (Math.random() - 0.5) * impulseStrength;
        transform.velocity.y = (Math.random() - 0.5) * impulseStrength;
        
        // Componente de material
        const material = new MaterialComponent(1); // Valor base
        
        // Componente de recolección
        const collectible = new CollectibleComponent(50); // Radio de recolección
        
        // Componente de vida útil
        const lifetime = new LifetimeComponent(30); // 30 segundos de vida
        
        // Componente de renderizado
        const render = new RenderComponent('material_crystal', 8); // Tipo visual y radio
        
        // Añadir componentes a la entidad
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, material);
        this.entityManager.addComponent(entity, collectible);
        this.entityManager.addComponent(entity, lifetime);
        this.entityManager.addComponent(entity, render);
        
        console.log(`💎 Material creado en (${x.toFixed(1)}, ${y.toFixed(1)})`);
        
        return entity;
    }
    
    /**
     * Crea un material personalizado con configuración específica
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {Object} config - Configuración personalizada
     */
    createCustomMaterial(x, y, config = {}) {
        const entity = this.entityManager.createEntity();
        
        // Componente de transformación
        const transform = new TransformComponent();
        transform.position.x = x;
        transform.position.y = y;
        
        // Velocidad inicial personalizada
        if (config.initialVelocity) {
            transform.velocity.x = config.initialVelocity.x || 0;
            transform.velocity.y = config.initialVelocity.y || 0;
        }
        
        // Componente de material con valor personalizado
        const material = new MaterialComponent(config.value || 1);
        
        // Componente de recolección con radio personalizado
        const collectible = new CollectibleComponent(config.collectionRadius || 50);
        
        // Componente de vida útil personalizada
        const lifetime = new LifetimeComponent(config.lifetime || 30);
        
        // Componente de renderizado
        const render = new RenderComponent('material_crystal', config.radius || 8);
        
        // Añadir componentes
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, material);
        this.entityManager.addComponent(entity, collectible);
        this.entityManager.addComponent(entity, lifetime);
        this.entityManager.addComponent(entity, render);
        
        console.log(`💎 Material personalizado creado en (${x.toFixed(1)}, ${y.toFixed(1)})`);
        
        return entity;
    }
} 