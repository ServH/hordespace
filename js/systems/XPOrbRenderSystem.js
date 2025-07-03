import System from './System.js';
import XPOrbComponent from '../components/XPOrbComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';

/**
 * XPOrbRenderSystem - Sistema de renderizado para orbes de XP
 * Renderiza orbes brillantes con diferentes colores según su valor
 */
export default class XPOrbRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        // Obtenemos todas las entidades que son orbes de XP
        const entities = this.entityManager.getEntitiesWith(XPOrbComponent, TransformComponent, RenderComponent);
        if (entities.length === 0) return;

        this.ctx.save();
        const time = performance.now();

        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            const xpOrb = this.entityManager.getComponent(entityId, XPOrbComponent);

            // Convertimos la posición del mundo a coordenadas de pantalla
            const screenX = transform.position.x - this.camera.x + this.camera.width / 2;
            const screenY = transform.position.y - this.camera.y + this.camera.height / 2;
            
            // Solo renderizar si está visible en pantalla
            if (screenX < -50 || screenX > this.ctx.canvas.width + 50 || 
                screenY < -50 || screenY > this.ctx.canvas.height + 50) {
                continue;
            }
            
            // Llama al método de dibujado
            this._drawXPOrb(this.ctx, screenX, screenY, render.radius, time, render.visualType);
        }

        this.ctx.restore();
    }

    // Método privado para dibujar un orbe de XP
    _drawXPOrb(ctx, x, y, radius, time, visualType) {
        // --- INICIO DE LA CORRECCIÓN ---
        // Determina el color basado en el TIPO, no en el valor.
        const isElite = (visualType === 'xp_orb_elite');
        const baseColor = isElite ? '#9B59B6' : '#3498DB'; // Morado para élite, Azul para normal
        const glowColor = isElite ? '#F1C40F' : '#8E44AD'; // Dorado para élite, Morado oscuro para normal
        // --- FIN DE LA CORRECCIÓN ---

        ctx.save();
        
        // 1. Halo exterior pulsante
        const pulse = Math.sin(time / 200 + x) * 0.15 + 0.85; // Pulsa entre 0.85 y 1.0
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2 * pulse);
        gradient.addColorStop(0, `${baseColor}60`); // Semi-transparente en el centro
        gradient.addColorStop(1, `${baseColor}00`); // Totalmente transparente fuera

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 2. Núcleo brillante
        ctx.shadowBlur = 15;
        ctx.shadowColor = glowColor;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Brillo central
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
    
    update(deltaTime) {
        // Este sistema solo renderiza
    }
} 