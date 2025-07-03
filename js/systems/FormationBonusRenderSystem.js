import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import InFormationBonusActiveComponent from '../components/InFormationBonusActiveComponent.js';
import TransformComponent from '../components/TransformComponent.js';

/**
 * FormationBonusRenderSystem - Dibuja efectos visuales (auras) cuando los bonos de formación están activos.
 * Cada tipo de bono tiene su propio color y efecto visual distintivo.
 */
export default class FormationBonusRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        const playerEntities = this.entityManager.getEntitiesWith(
            PlayerControlledComponent, 
            InFormationBonusActiveComponent, 
            TransformComponent
        );
        if (playerEntities.length === 0) return;

        const playerId = playerEntities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);
        const bonusComponent = this.entityManager.getComponent(playerId, InFormationBonusActiveComponent);
        
        // El jugador siempre está en el centro de la pantalla
        const screenX = this.camera.width / 2;
        const screenY = this.camera.height / 2;
        const baseRadius = transform.radius * 2; // El aura base es el doble del tamaño de la nave

        this.ctx.save();
        this.ctx.translate(screenX, screenY);

        // Dibujamos un aura por cada bono activo, superponiéndolas
        let i = 0;
        for (const bonusId of bonusComponent.activeBonuses) {
            const bonusConfig = CONFIG.FORMATION.FORMATION_BONUSES[bonusId];
            if (!bonusConfig) continue;

            // Efecto de pulsación suave
            const time = Date.now() / 300; // Velocidad de pulsación
            const pulse = Math.sin(time + i * Math.PI) * 0.1 + 0.9; // Pulsa entre 0.8 y 1.0
            const radius = baseRadius * pulse + (i * 5); // Cada aura es ligeramente más grande
            
            // Opacidad que varía con el pulso
            const alpha = 0.3 + (Math.sin(time * 2) * 0.1); // Entre 0.2 y 0.4

            // Dibujamos el aura con gradiente radial para un efecto más bonito
            const gradient = this.ctx.createRadialGradient(0, 0, transform.radius, 0, 0, radius);
            gradient.addColorStop(0, bonusConfig.auraColor + '00'); // Transparente en el centro
            gradient.addColorStop(0.5, bonusConfig.auraColor + '40'); // Semi-transparente
            gradient.addColorStop(1, bonusConfig.auraColor + '80'); // Más opaco en el borde

            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();

            // Añadimos un borde brillante
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = bonusConfig.auraColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = alpha * 1.5; // El borde es más visible
            this.ctx.stroke();

            i++;
        }

        this.ctx.restore();
    }
} 