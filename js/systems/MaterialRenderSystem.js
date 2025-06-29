import System from './System.js';
import RenderComponent from '../components/RenderComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';

export default class MaterialRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
        this.time = 0;
    }
    
    render() {
        const entities = this.entityManager.getEntitiesWith(RenderComponent, TransformComponent);
        
        this.time += 0.016; // Aproximadamente 60 FPS
        
        this.ctx.save();
        
        for (const entityId of entities) {
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const collectible = this.entityManager.getComponent(entityId, CollectibleComponent);
            
            // Solo renderizar materiales
            if (render.visualType !== 'material_crystal') continue;
            
            // Convertir coordenadas del mundo a pantalla
            const screenX = transform.position.x - this.camera.x + this.camera.width / 2;
            const screenY = transform.position.y - this.camera.y + this.camera.height / 2;
            
            // Calcular efectos visuales
            const spinAngle = this.time * 2 + entityId * 0.5; // Rotación única por entidad
            const pulseIntensity = (Math.sin(this.time * 3 + entityId) + 1) * 0.5; // Pulso único
            const attractionIntensity = collectible ? collectible.getAttractionIntensity(this.time) : 0;
            
            // Renderizar el cristal de energía
            this.renderEnergyCrystal(screenX, screenY, render.radius, spinAngle, pulseIntensity, attractionIntensity);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Renderiza un cristal de energía inestable
     * @param {number} x - Posición X en pantalla
     * @param {number} y - Posición Y en pantalla
     * @param {number} radius - Radio del cristal
     * @param {number} spinAngle - Ángulo de rotación
     * @param {number} pulseIntensity - Intensidad del pulso (0-1)
     * @param {number} attractionIntensity - Intensidad de atracción (0-1)
     */
    renderEnergyCrystal(x, y, radius, spinAngle, pulseIntensity, attractionIntensity) {
        this.ctx.save();
        
        // Trasladar al centro del cristal
        this.ctx.translate(x, y);
        this.ctx.rotate(spinAngle);
        
        // Calcular colores basados en la atracción
        const baseColor = '#FFD700'; // Dorado base
        const attractionColor = '#00FFFF'; // Cian cuando está siendo atraído
        const currentColor = this.interpolateColor(baseColor, attractionColor, attractionIntensity);
        
        // Efecto de brillo exterior (pulso + atracción)
        const glowRadius = radius + (pulseIntensity * 8) + (attractionIntensity * 12);
        const gradient = this.ctx.createRadialGradient(0, 0, radius, 0, 0, glowRadius);
        gradient.addColorStop(0, currentColor);
        gradient.addColorStop(0.6, currentColor + '80'); // Semi-transparente
        gradient.addColorStop(1, currentColor + '00');   // Totalmente transparente
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cristal principal (forma de diamante multifacético)
        this.ctx.fillStyle = currentColor;
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1.5;
        
        // Dibujar diamante principal
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius);      // Arriba
        this.ctx.lineTo(radius * 0.7, 0); // Derecha
        this.ctx.lineTo(0, radius);       // Abajo
        this.ctx.lineTo(-radius * 0.7, 0); // Izquierda
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Facetas internas para efecto de cristal
        this.ctx.fillStyle = '#FFFF80';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -radius * 0.6);
        this.ctx.lineTo(radius * 0.4, -radius * 0.2);
        this.ctx.lineTo(0, radius * 0.3);
        this.ctx.lineTo(-radius * 0.4, -radius * 0.2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Efecto de energía interna (pulso)
        if (pulseIntensity > 0.5) {
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.globalAlpha = (pulseIntensity - 0.5) * 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Efecto de atracción (ondas concéntricas cuando está siendo atraído)
        if (attractionIntensity > 0) {
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = attractionIntensity * 0.6;
            
            for (let i = 1; i <= 3; i++) {
                const waveRadius = radius + (i * 8) + (attractionIntensity * 10);
                this.ctx.beginPath();
                this.ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    /**
     * Interpola entre dos colores
     * @param {string} color1 - Color inicial
     * @param {string} color2 - Color final
     * @param {number} factor - Factor de interpolación (0-1)
     * @returns {string} - Color interpolado
     */
    interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);

        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        // Función auxiliar para asegurar que el valor hexadecimal tenga 2 dígitos.
        const toHex = (c) => ('0' + c.toString(16)).slice(-2);

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
} 