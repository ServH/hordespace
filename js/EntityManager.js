/**
 * EntityManager - Gestiona todas las entidades y sus componentes.
 */
import SpatialGrid from './SpatialGrid.js';
import TransformComponent from './components/TransformComponent.js';

export default class EntityManager {
    constructor() {
        this.entities = new Set();
        this.components = new Map();
        this.nextEntityId = 0;
        this.spatialGrid = new SpatialGrid(300); // Tamaño de celda recomendado
        console.log("🗃️ EntityManager creado.");
    }

    createEntity() {
        const entityId = this.nextEntityId++;
        this.entities.add(entityId);
        return entityId;
    }

    destroyEntity(entityId) {
        // Si tiene TransformComponent, eliminar de la rejilla
        const transform = this.getComponent(entityId, TransformComponent);
        if (transform) {
            this.spatialGrid.remove(entityId, transform.position.x, transform.position.y);
        }
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
        this.components.get(ComponentClass).set(entityId, component);

        // Si es un TransformComponent, añadir a la rejilla
        if (component instanceof TransformComponent) {
            this.spatialGrid.add(entityId, component.position.x, component.position.y);
        }
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