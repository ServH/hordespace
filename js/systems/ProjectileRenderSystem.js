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

    // --- FUNCIÓN PARA RENDERIZAR PROYECTILES POR TIPO (ALTA CALIDAD) ---
    renderProjectileByType(def) {
        switch (def.VISUAL_TYPE) {
            case 'laser':
                // El láser se puede mejorar con un núcleo y un halo
                this.ctx.shadowColor = def.GLOW_COLOR || def.COLOR;
                this.ctx.shadowBlur = def.GLOW_BLUR || 15;
                // Halo exterior
                this.ctx.fillStyle = def.GLOW_COLOR || def.COLOR;
                this.ctx.globalAlpha = 0.5;
                this.ctx.fillRect(-def.SIZE.width, -def.SIZE.height / 2, def.SIZE.width * 2, def.SIZE.height);
                // Núcleo brillante
                this.ctx.globalAlpha = 1.0;
                this.ctx.fillStyle = def.COLOR;
                this.ctx.fillRect(-def.SIZE.width / 2, -def.SIZE.height / 2, def.SIZE.width, def.SIZE.height);
                break;

            case 'orb':
                // La técnica del gradiente con núcleo sólido interior
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, def.RADIUS * def.GLOW_RADIUS_MULTIPLIER);
                gradient.addColorStop(0, 'rgba(255,255,255,1)');
                gradient.addColorStop(0.6, def.COLOR);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, def.RADIUS * def.GLOW_RADIUS_MULTIPLIER, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Núcleo sólido interior
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, def.RADIUS * def.INNER_CORE_RADIUS_MULTIPLIER, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'needle':
                // Renderizado de aguja: proyectil delgado y alargado para el Scout
                this.ctx.shadowColor = def.GLOW_COLOR;
                this.ctx.shadowBlur = def.GLOW_BLUR;
                
                // Halo exterior sutil
                this.ctx.fillStyle = def.GLOW_COLOR;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillRect(
                    -def.SIZE.width, 
                    -def.SIZE.height / 2 - 1, 
                    def.SIZE.width * 2, 
                    def.SIZE.height + 2
                );
                
                // Cuerpo principal de la aguja
                this.ctx.globalAlpha = 1.0;
                this.ctx.fillStyle = def.COLOR;
                this.ctx.fillRect(
                    -def.SIZE.width / 2, 
                    -def.SIZE.height / 2, 
                    def.SIZE.width, 
                    def.SIZE.height
                );
                
                // Núcleo brillante central
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.fillRect(
                    -def.SIZE.width / 4, 
                    -def.SIZE.height / 2 + 1, 
                    def.SIZE.width / 2, 
                    def.SIZE.height - 2
                );
                break;

            case 'chain_lightning':
                this.drawChainLightning(this.ctx, null, def);
                break;

            case 'bullet':
            default:
                // Renderizado multicapa para las balas
                // 1. Halo exterior (grande y muy transparente)
                this.ctx.fillStyle = def.GLOW_COLOR || def.COLOR;
                this.ctx.globalAlpha = 0.25;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, def.RADIUS * 1.5, 0, Math.PI * 2);
                this.ctx.fill();

                // 2. Cuerpo principal (tamaño normal, color sólido)
                this.ctx.globalAlpha = 1.0;
                this.ctx.fillStyle = def.COLOR;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, def.RADIUS, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 3. Núcleo brillante (pequeño y blanco)
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, def.RADIUS * 0.4, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
        
        // Restaurar la transparencia global
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

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

            // --- NUEVA LÓGICA DE RENDERIZADO MULTICAPA ---
            if (projectileConfig) {
                this.renderProjectileByType(projectileConfig);
            } else {
                // Fallback para sprites normales
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