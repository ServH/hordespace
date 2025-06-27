/**
 * Clase base para todos los Sistemas.
 * Proporciona dependencias comunes y una interfaz estándar.
 */
export default class System {
    constructor(entityManager, eventBus) {
        if (!entityManager || !eventBus) {
            throw new Error('Los sistemas deben recibir instancias de EntityManager y EventBus.');
        }
        this.entityManager = entityManager;
        this.eventBus = eventBus;
    }

    update(deltaTime) {
        // Este método debe ser sobrescrito por las clases hijas.
        throw new Error(`El método update() debe ser implementado por la subclase: ${this.constructor.name}`);
    }
} 