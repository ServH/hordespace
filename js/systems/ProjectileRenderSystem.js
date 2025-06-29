import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import WeaponComponent from '../components/WeaponComponent.js';

export default class ProjectileRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, spriteCache, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.spriteCache = spriteCache;
        this.camera = camera;
    }

    // Este sistema solo renderiza, por lo que su 'update' puede estar vacío.
    update(deltaTime) {}

    // --- FUNCIÓN PARA DIBUJAR CHAIN LIGHTNING ---
    drawChainLightning(ctx, transform, config) {
        const length = 20; // Longitud de cada segmento del rayo
        const segments = 5;
        const jag = 5; // Cantidad de "dientes" o irregularidad

        ctx.strokeStyle = config.COLOR;
        ctx.lineWidth = 3;
        ctx.shadowColor = config.COLOR;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(-length / 2, 0);

        // Dibujar una línea quebrada para simular un rayo
        for (let i = 0; i < segments; i++) {
            const x = (-length / 2) + (length * i / (segments - 1));
            const y = (Math.random() - 0.5) * jag;
            ctx.lineTo(x, y);
        }

        ctx.stroke();
        
        // Añadir un núcleo más brillante
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.stroke();
    }

    render() {
        // --- 1. LÓGICA PARA DIBUJAR EL RAYO DEL JUGADOR ---
        this.renderPlayerBeam();

        // --- 2. LÓGICA EXISTENTE PARA DIBUJAR PROYECTILES NORMALES ---
        const entities = this.entityManager.getEntitiesWith(ProjectileComponent, TransformComponent, RenderComponent);
        
        for (const entityId of entities) {
            const render = this.entityManager.getComponent(entityId, RenderComponent);

            // Si es un rayo (aunque ya no deberían crearse), este sistema lo ignora.
            if (render.visualType === 'beam') continue;

            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const screenX = transform.position.x - this.camera.x + (this.camera.width / 2);
            const screenY = transform.position.y - this.camera.y + (this.camera.height / 2);
            
            // Reutilizamos la lógica de dibujado de sprites que ya tenías
            const projectile = this.entityManager.getComponent(entityId, ProjectileComponent);
            const projectileConfig = CONFIG.PROJECTILE.PROJECTILE_TYPES[projectile.projectileTypeId];
            
            this.ctx.save();
            this.ctx.translate(screenX, screenY);
            this.ctx.rotate(transform.angle);

            // --- NUEVA LÓGICA DE RENDERIZADO ---
            if (projectileConfig && projectileConfig.VISUAL_TYPE === 'chain_lightning') {
                this.drawChainLightning(this.ctx, transform, projectileConfig);
            } else if (projectileConfig && projectileConfig.SIZE) { // Si tiene tamaño, es un rectángulo con brillo
                if (projectileConfig.GLOW_COLOR && projectileConfig.GLOW_BLUR) {
                    this.ctx.shadowColor = projectileConfig.GLOW_COLOR;
                    this.ctx.shadowBlur = projectileConfig.GLOW_BLUR;
                }
                this.ctx.fillStyle = projectileConfig.COLOR;
                const width = projectileConfig.SIZE.width;
                const height = projectileConfig.SIZE.height;
                this.ctx.fillRect(-width / 2, -height / 2, width, height);
            } else { // Si no, es un sprite normal
                const sprite = this.spriteCache.get(render.visualType);
                if (sprite) {
                    const drawSize = render.radius * render.glowRadiusMultiplier * 2;
                    const halfSize = drawSize / 2;
                    this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                }
            }
            
            this.ctx.restore();
        }
    }
    
    // --- NUEVO MÉTODO PARA RENDERIZAR EL RAYO ---
    renderPlayerBeam() {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent, TransformComponent);
        if (playerEntities.length === 0) return;

        const player = playerEntities[0];
        const weapon = this.entityManager.getComponent(player, WeaponComponent);
        const projectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[weapon.projectileTypeId];

        // Si el arma equipada no es un rayo, no hacemos nada.
        if (!projectileDef || projectileDef.VISUAL_TYPE !== 'beam') return;

        const transform = this.entityManager.getComponent(player, TransformComponent);
        
        // El jugador siempre se dibuja en el centro, así que el rayo también.
        const screenX = this.camera.width / 2;
        const screenY = this.camera.height / 2;
        
        this.ctx.save();
        this.ctx.translate(screenX, screenY);
        this.ctx.rotate(transform.angle);

        this.drawBeam(projectileDef); // Llamamos a la función de dibujo

        this.ctx.restore();
    }

    // --- FUNCIÓN DE DIBUJO DEL RAYO DESINTEGRADOR
    drawBeam(config) {
        const beamLength = config.LENGTH || 800;
        const segments = 20;
        const instability = 10;
    
        // --- Capa 0: El Emisor de Energía ---
        const emitterRadius = config.RADIUS * 2.5;
        this.ctx.save();
        const emitterGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, emitterRadius);
        emitterGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        emitterGradient.addColorStop(0.7, config.COLOR + 'AA');
        emitterGradient.addColorStop(1, config.COLOR + '00');
        this.ctx.fillStyle = emitterGradient;
        this.ctx.shadowColor = config.COLOR;
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, emitterRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    
        // --- Capa 1: El Glow Exterior ---
        this.ctx.beginPath();
        this.ctx.moveTo(0, -emitterRadius / 2);
        this.ctx.strokeStyle = config.COLOR;
        this.ctx.lineWidth = config.RADIUS * 2;
        this.ctx.globalAlpha = 0.5;
        this.ctx.shadowColor = config.COLOR;
        this.ctx.shadowBlur = 15;
        for (let i = 1; i <= segments; i++) {
            const x = 0;
            const y = -(i * (beamLength / segments));
            const controlX = (Math.random() - 0.5) * instability;
            const controlY = y + (beamLength / segments / 2);
            this.ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
        this.ctx.stroke();
    
        // --- Capa 2: El Núcleo del Rayo ---
        this.ctx.beginPath();
        this.ctx.moveTo(0, -emitterRadius / 2);
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = Math.max(1, config.RADIUS * 0.5);
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 5;
        for (let i = 1; i <= segments; i++) {
            const x = 0;
            const y = -(i * (beamLength / segments));
            const controlX = (Math.random() - 0.5) * instability;
            const controlY = y + (beamLength / segments / 2);
            this.ctx.quadraticCurveTo(controlX, controlY, x, y);
        }
        this.ctx.stroke();
    
        // --- Capa 3: Las Chispas ---
        this.ctx.fillStyle = 'white';
        this.ctx.shadowBlur = 0;
        const numSparks = 10;
        for (let i = 0; i < numSparks; i++) {
            const sparkProgress = Math.random();
            const sparkY = -sparkProgress * beamLength;
            const sparkX = (Math.random() - 0.5) * (instability * sparkProgress);
            const sparkSize = Math.random() * 2 + 1;
            this.ctx.fillRect(sparkX - sparkSize / 2, sparkY - sparkSize / 2, sparkSize, sparkSize);
        }
    }
}