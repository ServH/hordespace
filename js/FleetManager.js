/**
 * Space Horde Survivor - Clase FleetManager
 * Gestiona la flota aliada y su formación circular dinámica
 */

class FleetManager {
    /**
     * Constructor del gestor de flota
     * @param {Game} gameInstance - Referencia al objeto Game principal
     */
    constructor(gameInstance) {
        // Referencia al juego principal
        this.game = gameInstance;
        
        // Array de naves aliadas
        this.alliedShips = [];
        
        // Configuración de formación
        this.formationType = 'circle';
        this.formationRadius = CONFIG.FORMATION.RADIUS;
        this.formationFollowStrength = CONFIG.FORMATION.FOLLOW_STRENGTH;
        this.formationMaxCorrectionForce = CONFIG.FORMATION.MAX_CORRECTION_FORCE;
        this.formationCorrectionThreshold = CONFIG.FORMATION.CORRECTION_THRESHOLD;
        
        // Referencias a pools (se asignan después de la inicialización)
        this.projectilePool = null;
        this.explosionPool = null;
        
        console.log("🚁 FleetManager inicializado - Tipo de formación:", this.formationType);
    }
    
    /**
     * Inicializa el gestor de flota
     */
    init() {
        this.alliedShips = [];
        console.log("✅ FleetManager inicializado correctamente");
    }
    
    /**
     * Actualiza toda la flota aliada
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Si el comandante no está vivo, no hacer nada
        if (!this.game.player || !this.game.player.isAlive) {
            return;
        }
        
        // Calcular y asignar formationOffset a las naves
        this.recalculateFormation();
        
        // Asignar offset de formación a cada nave
        for (let i = 0; i < this.alliedShips.length; i++) {
            const allyShip = this.alliedShips[i];
            if (allyShip.isAlive) {
                // El offset ya fue calculado en recalculateFormation
                allyShip.update(deltaTime);
            }
        }
        
        // Limpieza: filtrar naves muertas
        this.alliedShips = this.alliedShips.filter(ship => ship.isAlive);
    }
    
    /**
     * Renderiza toda la flota aliada
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        for (const allyShip of this.alliedShips) {
            if (allyShip.isAlive) {
                allyShip.render(ctx);
            }
        }
    }
    
    /**
     * Añade una nave aliada a la flota
     * @param {string|AllyShip} shipTypeOrInstance - Tipo de nave ('scout', 'gunship') o instancia ya creada
     */
    addShip(shipTypeOrInstance) {
        let allyShipInstance;
        
        // Si es un string, crear la instancia del tipo correspondiente
        if (typeof shipTypeOrInstance === 'string') {
            const shipType = shipTypeOrInstance.toLowerCase();
            const commanderPos = this.game.player.position;
            
            switch (shipType) {
                case 'scout':
                    allyShipInstance = new ScoutShip(commanderPos.x, commanderPos.y, this.game);
                    break;
                case 'gunship':
                    allyShipInstance = new GunshipShip(commanderPos.x, commanderPos.y, this.game);
                    break;
                default:
                    console.error(`❌ Tipo de nave desconocido: ${shipType}`);
                    return;
            }
        } else {
            // Si es una instancia, usarla directamente (compatibilidad hacia atrás)
            allyShipInstance = shipTypeOrInstance;
        }
        
        // Añadir la instancia al array
        this.alliedShips.push(allyShipInstance);
        
        // Configurar propiedades de formación en la nave
        allyShipInstance.followStrength = this.formationFollowStrength;
        allyShipInstance.maxCorrectionForce = this.formationMaxCorrectionForce;
        allyShipInstance.correctionThreshold = this.formationCorrectionThreshold;
        
        // Asignar pools si están disponibles
        if (this.projectilePool) {
            allyShipInstance.setProjectilePool(this.projectilePool);
        }
        
        // Recalcular formación para incluir la nueva nave
        this.recalculateFormation();
        
        console.log(`🚁 Nave aliada añadida a la flota (${allyShipInstance.type}). Total: ${this.alliedShips.length}`);
    }
    
    /**
     * Recalcula las posiciones de formación circular para todas las naves
     */
    recalculateFormation() {
        if (this.alliedShips.length === 0) return;
        
        // Calcular el ángulo entre cada nave en la formación circular
        const angleStep = (2 * Math.PI) / this.alliedShips.length;
        let angle = 0;
        
        // Asignar posición de formación a cada nave
        for (let i = 0; i < this.alliedShips.length; i++) {
            const allyShip = this.alliedShips[i];
            
            // Calcular posición relativa en el círculo
            // El -Math.PI/2 hace que el 0 radianes apunte "arriba" (como el comandante)
            const offsetX = this.formationRadius * Math.cos(angle - Math.PI / 2);
            const offsetY = this.formationRadius * Math.sin(angle - Math.PI / 2);
            
            // Crear el objeto offset
            const offset = { x: offsetX, y: offsetY };
            
            // Asignar el offset a la nave
            allyShip.setFormationOffset(offset);
            
            // Incrementar ángulo para la siguiente nave
            angle += angleStep;
        }
    }
    
    /**
     * Establece el pool de proyectiles para las naves aliadas
     * @param {ObjectPool} pool - Pool de proyectiles
     */
    setProjectilePool(pool) {
        this.projectilePool = pool;
        
        // Asignar el pool a todas las naves existentes
        for (const allyShip of this.alliedShips) {
            allyShip.setProjectilePool(pool);
        }
    }
    
    /**
     * Establece el pool de explosiones para las naves aliadas
     * @param {ObjectPool} pool - Pool de explosiones
     */
    setExplosionPool(pool) {
        this.explosionPool = pool;
    }
    
    /**
     * Obtiene el número de naves aliadas activas
     * @returns {number} Número de naves vivas
     */
    getActiveShipCount() {
        return this.alliedShips.filter(ship => ship.isAlive).length;
    }
    
    /**
     * Obtiene todas las naves aliadas activas
     * @returns {AllyShip[]} Array de naves vivas
     */
    getActiveShips() {
        return this.alliedShips.filter(ship => ship.isAlive);
    }
}

console.log("✅ FleetManager.js cargado correctamente"); 