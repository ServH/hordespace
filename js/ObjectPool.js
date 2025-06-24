/**
 * Space Horde Survivor - Clase ObjectPool Genérica
 * Sistema de Object Pooling para optimización de rendimiento
 */

class ObjectPool {
    constructor(ObjectConstructor, poolSize, ...constructorArgs) {
        this.ObjectConstructor = ObjectConstructor;
        this.poolSize = poolSize;
        this.constructorArgs = constructorArgs;
        this.pool = [];
        this.activeCount = 0;
        this.totalCreated = 0;
        this.overflowCount = 0;
        
        // Estadísticas para debugging
        this.stats = {
            gets: 0,
            releases: 0,
            overflows: 0,
            peak: 0
        };
        
        console.log(`🏊 ObjectPool creado para ${ObjectConstructor.name}, tamaño: ${poolSize}`);
    }
    
    /**
     * Inicializa el pool pre-creando todos los objetos
     */
    init() {
        console.log(`🔧 Inicializando pool de ${this.ObjectConstructor.name}...`);
        
        for (let i = 0; i < this.poolSize; i++) {
            const obj = new this.ObjectConstructor(...this.constructorArgs);
            obj.active = false;
            obj.poolIndex = i; // Para debugging
            this.pool.push(obj);
            this.totalCreated++;
        }
        
        console.log(`✅ Pool inicializado: ${this.totalCreated} objetos de ${this.ObjectConstructor.name}`);
    }
    
    /**
     * Obtiene un objeto inactivo del pool
     * @returns {Object} - Objeto listo para usar
     */
    get() {
        this.stats.gets++;
        
        // Buscar primer objeto inactivo
        for (let i = 0; i < this.pool.length; i++) {
            const obj = this.pool[i];
            if (!obj.active) {
                obj.active = true;
                this.activeCount++;
                
                // Actualizar estadísticas
                if (this.activeCount > this.stats.peak) {
                    this.stats.peak = this.activeCount;
                }
                
                return obj;
            }
        }
        
        // Si llegamos aquí, el pool está lleno - crear objeto de overflow
        console.warn(`⚠️ Pool overflow en ${this.ObjectConstructor.name}! Creando objeto adicional.`);
        
        const overflowObj = new this.ObjectConstructor(...this.constructorArgs);
        overflowObj.active = true;
        overflowObj.poolIndex = -1; // Marca como overflow
        
        // Añadir al pool para gestión
        this.pool.push(overflowObj);
        this.totalCreated++;
        this.overflowCount++;
        this.activeCount++;
        this.stats.overflows++;
        
        return overflowObj;
    }
    
    /**
     * Devuelve un objeto al pool
     * @param {Object} obj - Objeto a devolver
     */
    release(obj) {
        if (!obj || !obj.active) {
            console.warn(`⚠️ Intento de release de objeto ya inactivo en ${this.ObjectConstructor.name}`);
            return;
        }
        
        // Desactivar objeto
        obj.active = false;
        this.activeCount--;
        this.stats.releases++;
        
        // Limpiar estado del objeto si tiene método cleanup
        if (typeof obj.cleanup === 'function') {
            obj.cleanup();
        } else {
            // Limpieza básica para objetos comunes
            this.basicCleanup(obj);
        }
    }
    
    /**
     * Limpieza básica para objetos que no tienen método cleanup
     * @param {Object} obj - Objeto a limpiar
     */
    basicCleanup(obj) {
        // Resetear posición fuera de pantalla
        if (obj.position) {
            obj.position.x = -1000;
            obj.position.y = -1000;
        }
        
        // Resetear velocidad
        if (obj.velocity) {
            obj.velocity.x = 0;
            obj.velocity.y = 0;
        }
        
        // Resetear propiedades comunes
        if (obj.hasOwnProperty('damage')) obj.damage = 0;
        if (obj.hasOwnProperty('timer')) obj.timer = 0;
        if (obj.hasOwnProperty('alpha')) obj.alpha = 1;
        if (obj.hasOwnProperty('scale')) obj.scale = 1;
    }
    
    /**
     * Obtiene todos los objetos activos del pool
     * @returns {Array} - Array de objetos activos
     */
    getActiveObjects() {
        return this.pool.filter(obj => obj.active);
    }
    
    /**
     * Obtiene estadísticas del pool
     * @returns {Object} - Estadísticas detalladas
     */
    getStats() {
        return {
            poolSize: this.poolSize,
            totalCreated: this.totalCreated,
            activeCount: this.activeCount,
            inactiveCount: this.pool.length - this.activeCount,
            overflowCount: this.overflowCount,
            utilizationPercent: ((this.activeCount / this.poolSize) * 100).toFixed(1),
            stats: { ...this.stats }
        };
    }
    
    /**
     * Imprime estadísticas del pool en consola
     */
    printStats() {
        const stats = this.getStats();
        console.log(`📊 ${this.ObjectConstructor.name} Pool Stats:`, {
            'Tamaño Pool': stats.poolSize,
            'Activos': stats.activeCount,
            'Inactivos': stats.inactiveCount,
            'Utilización': stats.utilizationPercent + '%',
            'Pico': stats.stats.peak,
            'Gets': stats.stats.gets,
            'Releases': stats.stats.releases,
            'Overflows': stats.stats.overflows
        });
    }
    
    /**
     * Fuerza la desactivación de todos los objetos (útil para reset de nivel)
     */
    releaseAll() {
        let releasedCount = 0;
        
        for (const obj of this.pool) {
            if (obj.active) {
                this.release(obj);
                releasedCount++;
            }
        }
        
        console.log(`🧹 Pool ${this.ObjectConstructor.name}: ${releasedCount} objetos liberados`);
    }
    
    /**
     * Optimiza el pool eliminando objetos de overflow si están inactivos
     */
    optimize() {
        const initialLength = this.pool.length;
        
        // Mantener solo objetos del pool original + algunos overflow activos
        this.pool = this.pool.filter((obj, index) => {
            // Mantener objetos del pool original
            if (index < this.poolSize) return true;
            
            // Para overflow, mantener solo si están activos
            return obj.active;
        });
        
        const removed = initialLength - this.pool.length;
        if (removed > 0) {
            this.overflowCount = Math.max(0, this.overflowCount - removed);
            this.totalCreated -= removed;
            console.log(`🗑️ Pool ${this.ObjectConstructor.name}: ${removed} objetos overflow eliminados`);
        }
    }
}

console.log("✅ ObjectPool.js cargado correctamente"); 