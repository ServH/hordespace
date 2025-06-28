import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import HealthComponent from '../components/HealthComponent.js';

export default class AllyRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    update(deltaTime) {
        // Este sistema solo renderiza, no necesita update
    }

    render() {
        const allies = this.entityManager.getEntitiesWith(
            AllyComponent, 
            TransformComponent, 
            RenderComponent
        );
        
        for (const entityId of allies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const renderComp = this.entityManager.getComponent(entityId, RenderComponent);
            const health = this.entityManager.getComponent(entityId, HealthComponent);
            
            // Posición de la entidad en el mundo infinito
            const worldX = transform.position.x;
            const worldY = transform.position.y;
            
            // Traducimos a coordenadas relativas a la esquina superior izquierda del canvas
            const screenX = worldX - this.camera.x + (this.camera.width / 2);
            const screenY = worldY - this.camera.y + (this.camera.height / 2);
            
            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(transform.angle);
            
            // Renderizar según el tipo visual
            if (renderComp.visualType === 'scout') {
                this.drawScout(renderComp.radius);
            } else if (renderComp.visualType === 'gunship') {
                this.drawGunship(renderComp.radius);
            }
            
            // Dibujar barra de vida si está dañado
            if (health && health.hp < health.maxHp && health.hp > 0) {
                this.ctx.rotate(-transform.angle); // Desrotar para que la barra esté horizontal
                this.drawHealthBar(health, renderComp.radius);
            }
            
            this.ctx.restore();
        }
    }

    drawScout(radius) {
        const ctx = this.ctx;
        
        // Cuerpo principal (más estilizado)
        ctx.fillStyle = '#4488FF';
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(-radius * 0.6, radius * 0.8);
        ctx.lineTo(0, radius * 0.5);
        ctx.lineTo(radius * 0.6, radius * 0.8);
        ctx.closePath();
        ctx.fill();
        
        // Detalles del casco
        ctx.strokeStyle = '#66AAFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cabina
        ctx.fillStyle = '#88CCFF';
        ctx.beginPath();
        ctx.arc(0, -radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Motores
        ctx.fillStyle = '#FF8844';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, radius * 0.6, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(radius * 0.3, radius * 0.6, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGunship(radius) {
        const ctx = this.ctx;
        
        // Cuerpo principal (más robusto)
        ctx.fillStyle = '#FF6644';
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(-radius * 0.8, radius * 0.6);
        ctx.lineTo(-radius * 0.5, radius);
        ctx.lineTo(radius * 0.5, radius);
        ctx.lineTo(radius * 0.8, radius * 0.6);
        ctx.closePath();
        ctx.fill();
        
        // Detalles del casco
        ctx.strokeStyle = '#FF8866';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Cabina blindada
        ctx.fillStyle = '#FFAA88';
        ctx.fillRect(-radius * 0.3, -radius * 0.6, radius * 0.6, radius * 0.5);
        
        // Cañones laterales
        ctx.strokeStyle = '#CC4422';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        // Cañón izquierdo
        ctx.beginPath();
        ctx.moveTo(-radius * 0.7, -radius * 0.2);
        ctx.lineTo(-radius * 0.7, -radius * 0.8);
        ctx.stroke();
        
        // Cañón derecho
        ctx.beginPath();
        ctx.moveTo(radius * 0.7, -radius * 0.2);
        ctx.lineTo(radius * 0.7, -radius * 0.8);
        ctx.stroke();
        
        // Motor central grande
        ctx.fillStyle = '#FF4422';
        ctx.beginPath();
        ctx.arc(0, radius * 0.8, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHealthBar(health, radius) {
        const barWidth = radius * 2;
        const barHeight = 4;
        const barY = radius + 10;
        const healthPercent = health.hp / health.maxHp;
        
        // Fondo de la barra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthColor = healthPercent > 0.5 ? '#44FF44' : 
                           healthPercent > 0.25 ? '#FFAA44' : '#FF4444';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Borde
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
    }
} 