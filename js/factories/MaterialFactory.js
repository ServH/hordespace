import TransformComponent from '../components/TransformComponent.js';
import MaterialComponent from '../components/MaterialComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class MaterialFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        
        // YA NO SE SUSCRIBE A enemy:destroyed
        // Los materiales ahora son solo para exploración
        
        console.log("🏭 MaterialFactory inicializada (solo para exploración)");
    }
    
    /**
     * Crea un cúmulo de cristales para exploración
     * @param {number} centerX - Posición X del centro del cúmulo
     * @param {number} centerY - Posición Y del centro del cúmulo
     * @param {number} clusterSize - Número de cristales en el cúmulo (3-5)
     */
    createMaterialCluster(centerX, centerY, clusterSize = 3) {
        const crystals = [];
        
        for (let i = 0; i < clusterSize; i++) {
            // Distribuir cristales en un círculo alrededor del centro
            const angle = (i / clusterSize) * Math.PI * 2;
            const distance = 20 + Math.random() * 30; // Entre 20 y 50 píxeles del centro
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            const crystal = this.createExplorationCrystal(x, y);
            crystals.push(crystal);
        }
        
        console.log(`💎 Cúmulo de ${clusterSize} cristales creado en (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
        return crystals;
    }
    
    /**
     * Crea un cristal de exploración
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     */
    createExplorationCrystal(x, y) {
        const entity = this.entityManager.createEntity();
        
        // Componente de transformación
        const transform = new TransformComponent();
        transform.position.x = x;
        transform.position.y = y;
        
        // Sin velocidad inicial - los cristales de exploración aparecen estáticos
        transform.velocity.x = 0;
        transform.velocity.y = 0;
        
        // Componente de material con valor fijo
        const material = new MaterialComponent(2); // Valor ligeramente superior por ser de exploración
        
        // Componente de recolección
        const collectible = new CollectibleComponent(60); // Radio de recolección
        
        // Componente de vida útil más larga para exploración
        const lifetime = new LifetimeComponent(120); // 2 minutos de vida
        
        // Componente de renderizado
        const render = new RenderComponent('material_crystal', 10); // Ligeramente más grande
        
        // Componente de física
        const physics = new PhysicsComponent(300, 0.95);
        
        // Añadir componentes a la entidad
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, material);
        this.entityManager.addComponent(entity, collectible);
        this.entityManager.addComponent(entity, lifetime);
        this.entityManager.addComponent(entity, render);
        this.entityManager.addComponent(entity, physics);
        
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
        
        // Componente de física para que pueda moverse
        const physics = new PhysicsComponent(config.maxSpeed || 500, config.friction || 0.92);
        
        // Añadir componentes
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, material);
        this.entityManager.addComponent(entity, collectible);
        this.entityManager.addComponent(entity, lifetime);
        this.entityManager.addComponent(entity, render);
        this.entityManager.addComponent(entity, physics);
        
        console.log(`💎 Material personalizado creado en (${x.toFixed(1)}, ${y.toFixed(1)})`);
        
        return entity;
    }
} 