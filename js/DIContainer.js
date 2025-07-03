/**
 * Un simple pero potente Contenedor de Inyección de Dependencias.
 * Gestiona la creación de servicios (sistemas, fábricas) y sus dependencias.
 */
export default class DIContainer {
    constructor() {
        this.services = new Map();
        this.instances = new Map(); // Cache para singletons
        console.log("📦 DI Container creado.");
    }

    /**
     * Registra un servicio/clase en el contenedor.
     * @param {string} name - El nombre del servicio (ej. 'physicsSystem').
     * @param {Function} definition - La clase misma (ej. PhysicsSystem).
     * @param {string[]} dependencies - Un array con los nombres de sus dependencias.
     */
    register(name, definition, dependencies = []) {
        this.services.set(name, { definition, dependencies });
    }

    /**
     * Obtiene una instancia de un servicio.
     * Resuelve y crea las dependencias automáticamente.
     * Usa un cache para asegurar que solo se crea una instancia (patrón Singleton).
     * @param {string} name - El nombre del servicio a obtener.
     * @returns {*} La instancia del servicio.
     */
    get(name) {
        // Si ya hemos creado esta instancia antes, la devolvemos del cache.
        if (this.instances.has(name)) {
            return this.instances.get(name);
        }

        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Servicio no encontrado: ${name}`);
        }

        // Resolver y obtener las dependencias recursivamente.
        const dependencies = service.dependencies.map(depName => this.get(depName));
        
        // Crear la nueva instancia, pasando las dependencias resueltas.
        const instance = new service.definition(...dependencies);
        
        // Guardar la instancia en cache para futuras llamadas.
        this.instances.set(name, instance);

        return instance;
    }
} 