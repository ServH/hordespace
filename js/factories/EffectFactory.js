import TransformComponent from '../components/TransformComponent.js';
import EffectComponent from '../components/EffectComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';

export default class EffectFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.eventBus.subscribe('effect:spawn', this.create.bind(this));
    }

    create(data) {
        const entity = this.entityManager.createEntity();
        const transform = new TransformComponent(data.x, data.y);
        const effect = new EffectComponent(data.type, data.duration);
        const lifetime = new LifetimeComponent(data.duration);
        
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, effect);
        this.entityManager.addComponent(entity, lifetime);
    }
} 