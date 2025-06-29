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
            if (projectileConfig.SIZE) { // Si tiene tamaño, es un rectángulo con brillo
                this.ctx.save();
                this.ctx.translate(screenX, screenY);
                this.ctx.rotate(transform.angle);
                if (projectileConfig.GLOW_COLOR && projectileConfig.GLOW_BLUR) {
                    this.ctx.shadowColor = projectileConfig.GLOW_COLOR;
                    this.ctx.shadowBlur = projectileConfig.GLOW_BLUR;
                }
                this.ctx.fillStyle = projectileConfig.COLOR;
                const width = projectileConfig.SIZE.width;
                const height = projectileConfig.SIZE.height;
                this.ctx.fillRect(-width / 2, -height / 2, width, height);
                this.ctx.restore();
            } else { // Si no, es un sprite normal
                const sprite = this.spriteCache.get(render.visualType);
                if (sprite) {
                    const drawSize = render.radius * render.glowRadiusMultiplier * 2;
                    const halfSize = drawSize / 2;
                    this.ctx.save();
                    this.ctx.translate(screenX, screenY);
                    this.ctx.rotate(transform.angle);
                    this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                    this.ctx.restore();
                }
            }
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

    // --- FUNCIÓN DE DIBUJO DEL RAYO (la que ya tenías) ---
    drawBeam(config) {
        const beamLength = 800; // Longitud del rayo
        const coreWidth = config.RADIUS / 2;

        // Glow exterior
        const gradient = this.ctx.createLinearGradient(0, 0, 0, -beamLength);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, config.COLOR + '80');
        gradient.addColorStop(1, config.COLOR);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-config.RADIUS, -beamLength, config.RADIUS * 2, beamLength);
        
        // Núcleo
        const coreGradient = this.ctx.createLinearGradient(0, 0, 0, -beamLength);
        coreGradient.addColorStop(0, 'white');
        coreGradient.addColorStop(0.8, 'white');
        coreGradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = coreGradient;
        this.ctx.fillRect(-coreWidth / 2, -beamLength, coreWidth, beamLength);
    }
} 