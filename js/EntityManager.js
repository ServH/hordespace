/**
 * EntityManager - Gestiona todas las entidades y sus componentes.
 */
export default class EntityManager {
    constructor() {
        this.entities = new Set();
        this.components = new Map();
        this.nextEntityId = 0;
        console.log("🗃️ EntityManager creado.");
    }

    createEntity() {
        const entityId = this.nextEntityId++;
        this.entities.add(entityId);
        return entityId;
    }

    destroyEntity(entityId) {
        for (const componentMap of this.components.values()) {
            componentMap.delete(entityId);
        }
        this.entities.delete(entityId);
    }

    addComponent(entityId, component) {
        const ComponentClass = component.constructor;
        if (!this.components.has(ComponentClass)) {
            this.components.set(ComponentClass, new Map());
        }
        // Añadir referencia a la entidad en el componente
        component.entityId = entityId;
        this.components.get(ComponentClass).set(entityId, component);
    }

    getComponent(entityId, ComponentClass) {
        const componentMap = this.components.get(ComponentClass);
        return componentMap ? componentMap.get(entityId) : undefined;
    }

    hasComponent(entityId, ComponentClass) {
        return this.components.has(ComponentClass) && this.components.get(ComponentClass).has(entityId);
    }

    removeComponent(entityId, ComponentClass) {
        const componentMap = this.components.get(ComponentClass);
        if (componentMap) {
            componentMap.delete(entityId);
        }
    }

    getEntitiesWith(...ComponentClasses) {
        const entities = [];
        for (const entityId of this.entities) {
            if (ComponentClasses.every(ComponentClass => this.hasComponent(entityId, ComponentClass))) {
                entities.push(entityId);
            }
        }
        return entities;
    }
} 