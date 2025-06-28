import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ProjectileRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, spriteCache, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.spriteCache = spriteCache;
        this.camera = camera;
    }

    // Este sistema solo renderiza, por lo que su 'update' puede estar vacío.
    update(deltaTime) {}

    drawBeam(ctx, transform, config) {
        const beamLength = 0.5 * ctx.canvas.height; // Longitud del rayo: mitad de la pantalla
        const coreWidth = config.RADIUS;

        ctx.save();
        ctx.rotate(transform.angle);

        // Glow exterior
        const gradient = ctx.createLinearGradient(0, 0, 0, -beamLength);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, config.COLOR + '80'); // Semitransparente
        gradient.addColorStop(1, config.COLOR);

        ctx.fillStyle = gradient;
        ctx.fillRect(-config.RADIUS, -beamLength, config.RADIUS * 2, beamLength);

        // Núcleo sólido
        ctx.fillStyle = 'white';
        ctx.fillRect(-coreWidth / 4, -beamLength, coreWidth / 2, beamLength);

        ctx.restore();
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(ProjectileComponent, TransformComponent, RenderComponent);
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);
            const projectile = this.entityManager.getComponent(entityId, ProjectileComponent);
            const worldX = transform.position.x;
            const worldY = transform.position.y;
            const screenX = worldX - this.camera.x + (this.camera.width / 2);
            const screenY = worldY - this.camera.y + (this.camera.height / 2);
            const projectileConfig = CONFIG.PROJECTILE.PROJECTILE_TYPES[projectile.projectileTypeId];
            if (projectileConfig) {
                if (projectileConfig.VISUAL_TYPE === 'beam') {
                    this.ctx.save();
                    this.ctx.translate(screenX, screenY);
                    this.drawBeam(this.ctx, transform, projectileConfig);
                    this.ctx.restore();
                } else {
                    this.ctx.save();
                    this.ctx.translate(screenX, screenY);
                    this.ctx.rotate(transform.angle);
                    if (projectileConfig.GLOW_COLOR && projectileConfig.GLOW_BLUR) {
                        this.ctx.shadowColor = projectileConfig.GLOW_COLOR;
                        this.ctx.shadowBlur = projectileConfig.GLOW_BLUR;
                    }
                    this.ctx.fillStyle = projectileConfig.COLOR;
                    if (projectileConfig.SIZE) {
                        const width = projectileConfig.SIZE.width;
                        const height = projectileConfig.SIZE.height;
                        this.ctx.fillRect(-width / 2, -height / 2, width, height);
                    } else {
                        const sprite = this.spriteCache.get(render.visualType);
                        if (sprite) {
                            const drawSize = render.radius * render.glowRadiusMultiplier * 2;
                            const halfSize = drawSize / 2;
                            this.ctx.drawImage(sprite, -halfSize, -halfSize, drawSize, drawSize);
                        }
                    }
                    if (projectileConfig.GLOW_COLOR && projectileConfig.GLOW_BLUR) {
                        this.ctx.shadowColor = 'transparent';
                        this.ctx.shadowBlur = 0;
                    }
                    this.ctx.restore();
                }
            }
        }
    }
} 