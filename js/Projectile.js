/**
 * Space Horde Survivor - Clase Projectile
 * Proyectiles gestionados por Object Pooling
 * ¡CRÍTICO! Ya no hereda de Ship - Clase independiente
 */

import PlayerShip from './PlayerShip.js';
import AllyShip from './AllyShip.js';
import EnemyShip from './EnemyShip.js';

export default class Projectile {
    constructor(gameInstance) {
        // ¡CRÍTICO! Constructor simplificado - solo espera gameInstance
        this.game = gameInstance;
        
        // Propiedades básicas de estado
        this.active = false;
        this.isAlive = false;
        
        // Propiedades básicas de posición y movimiento
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        
        // Propiedades específicas del proyectil (se establecerán en activate())
        this.owner = '';
        this.projectileDef = null;
        this.damage = 0;
        this.maxSpeed = 0;
        this.radius = 0;
        this.color = '';
        this.lifeTime = 0;
        this.maxLifeTime = 0;
        
        // Propiedades visuales (se establecerán desde projectileDef)
        this.visualType = '';
        this.lineWidth = 0;
        this.glowRadiusMultiplier = 0;
        this.innerCoreRadiusMultiplier = 0;
    }
    
    /**
     * Activa el proyectil con parámetros específicos usando projectileDef
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {number} angle - Ángulo de disparo en radianes
     * @param {string} owner - Propietario ('player', 'ally', 'enemy')
     * @param {Object} projectileDef - Definición del proyectil desde CONFIG.PROJECTILE.PROJECTILE_TYPES
     */
    activate(x, y, angle, owner, projectileDef) {
        // Establecer posición inicial
        this.position.x = x;
        this.position.y = y;
        
        // Establecer propiedades básicas
        this.angle = angle;
        this.owner = owner;
        this.active = true;
        this.isAlive = true;
        this.lifeTime = 0;
        
        // ¡CRÍTICO! Asegurar que TODAS las propiedades se asignan desde projectileDef ANTES del cálculo de velocity
        this.projectileDef = projectileDef;
        this.damage = projectileDef.DAMAGE;
        this.maxSpeed = projectileDef.SPEED; // ¡ASIGNAR PRIMERO!
        this.radius = projectileDef.RADIUS;
        this.color = projectileDef.COLOR;
        this.maxLifeTime = projectileDef.LIFETIME;
        this.visualType = projectileDef.VISUAL_TYPE;
        this.lineWidth = projectileDef.LINE_WIDTH;
        this.glowRadiusMultiplier = projectileDef.GLOW_RADIUS_MULTIPLIER;
        this.innerCoreRadiusMultiplier = projectileDef.INNER_CORE_RADIUS_MULTIPLIER;
        
        // Calcular velocidad basada en ángulo (DESPUÉS de asignar maxSpeed)
        this.velocity.x = Math.sin(angle) * this.maxSpeed;
        this.velocity.y = -Math.cos(angle) * this.maxSpeed;
        
        console.log(`🚀 Proyectil ${this.visualType} activado: ${owner} en (${x.toFixed(1)}, ${y.toFixed(1)}) - Daño: ${this.damage}, Velocidad: ${this.maxSpeed}`);
    }
    
    /**
     * Desactiva el proyectil y lo prepara para reutilización
     */
    deactivate() {
        this.active = false;
        this.isAlive = false;
        this.damage = 0;
        this.owner = '';
        this.lifeTime = 0;
        this.projectileDef = null;
        
        // Mover fuera de pantalla
        this.position.x = -1000;
        this.position.y = -1000;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    
    /**
     * Método de limpieza para Object Pool
     */
    cleanup() {
        this.deactivate();
    }
    
    /**
     * Actualiza el proyectil
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Actualizar tiempo de vida
        this.lifeTime += deltaTime;
        
        // Desactivar si excede tiempo máximo de vida
        if (this.lifeTime > this.maxLifeTime) {
            this.deactivate();
            return;
        }
        
        // ¡CRÍTICO! Solo movimiento básico - sin fricción ni aceleración
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Verificar límites de pantalla
        this.checkBounds();
    }
    

    
    /**
     * Verifica si el proyectil está fuera de los límites y lo desactiva
     */
    checkBounds() {
        const margin = CONFIG.PROJECTILE.BOUNDS_MARGIN;
        
        if (this.position.x < -margin || 
            this.position.x > CONFIG.CANVAS.WIDTH + margin ||
            this.position.y < -margin || 
            this.position.y > CONFIG.CANVAS.HEIGHT + margin) {
            this.deactivate();
        }
    }
    
    /**
     * ¡CRÍTICO! Implementar colisión circular directamente (sin super.isColliding())
     * @param {Object} other - Otra entidad
     * @returns {boolean} - true si hay colisión
     */
    isColliding(other) {
        if (!this.active || !other.isAlive) return false;
        
        // No colisionar con entidades del mismo propietario
        if (this.owner === 'player' && other instanceof PlayerShip) return false;
        if (this.owner === 'ally' && other instanceof AllyShip) return false;
        if (this.owner === 'enemy' && other instanceof EnemyShip) return false;
        
        // Colisión circular directa
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius;
        
        return distance < minDistance;
    }
    

    
    /**
     * Información de debug del proyectil
     * @returns {Object} - Información de debug
     */
    getDebugInfo() {
        return {
            active: this.active,
            position: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            velocity: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            owner: this.owner,
            visualType: this.visualType,
            damage: this.damage,
            lifeTime: this.lifeTime.toFixed(2),
            maxLifeTime: this.maxLifeTime
        };
    }
}

console.log("✅ Projectile.js cargado correctamente"); 