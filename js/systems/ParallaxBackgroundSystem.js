import System from './System.js';
import ParallaxLayerComponent from '../components/ParallaxLayerComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ParallaxBackgroundSystem extends System {
    constructor(entityManager, eventBus, ctx, camera, spriteCache) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
        this.spriteCache = spriteCache;
    }

    update(deltaTime) {} // No necesita lógica de update

    render() {
        const entities = this.entityManager.getEntitiesWith(ParallaxLayerComponent, TransformComponent, RenderComponent);

        this.ctx.save();
        for (const entityId of entities) {
            const parallax = this.entityManager.getComponent(entityId, ParallaxLayerComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);

            const sprite = this.spriteCache.get(render.visualType);
            if (!sprite || sprite.width === 0 || sprite.height === 0) continue;

            // 1. Cálculo del offset (mantenemos la fórmula corregida)
            const parallaxX = this.camera.x * parallax.depth;
            const parallaxY = this.camera.y * parallax.depth;
            const offsetX = ((parallaxX % sprite.width) + sprite.width) % sprite.width;
            const offsetY = ((parallaxY % sprite.height) + sprite.height) % sprite.height;

            // --- NUEVA LÓGICA DE TILING DINÁMICO ---
            // 2. Bucle dinámico que rellena toda la pantalla
            // Empezamos dibujando desde la posición del offset negativo
            const startX = -offsetX;
            const startY = -offsetY;

            // Dibujamos baldosas hasta que hayamos cubierto el ancho completo del canvas
            for (let y = startY; y < this.camera.height; y += sprite.height) {
                for (let x = startX; x < this.camera.width; x += sprite.width) {
                    this.ctx.drawImage(sprite, x, y);
                }
            }
            // --- FIN DE LA NUEVA LÓGICA ---
        }
        this.ctx.restore();
    }
} 