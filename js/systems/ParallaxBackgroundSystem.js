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
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const parallax = this.entityManager.getComponent(entityId, ParallaxLayerComponent);
            const render = this.entityManager.getComponent(entityId, RenderComponent);

            const sprite = this.spriteCache.get(render.visualType);
            if (!sprite) continue;

            // 1. Calcular la posición del "mundo" desplazada por el paralaje
            const parallaxX = this.camera.x * parallax.depth;
            const parallaxY = this.camera.y * parallax.depth;

            // 2. Calcular el offset para que la repetición sea infinita (wrapping)
            // Fórmula corregida para manejar correctamente números negativos
            const offsetX = ((parallaxX % sprite.width) + sprite.width) % sprite.width;
            const offsetY = ((parallaxY % sprite.height) + sprite.height) % sprite.height;
            
            // 3. Dibujar un mosaico de 3x3 para cubrir siempre la pantalla y sus bordes
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    this.ctx.drawImage(
                        sprite,
                        x * sprite.width - offsetX,
                        y * sprite.height - offsetY
                    );
                }
            }
        }
        this.ctx.restore();
    }
} 