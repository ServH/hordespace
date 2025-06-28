import System from './System.js';
import ParticleComponent from '../components/ParticleComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import ThrusterComponent from '../components/ThrusterComponent.js';

export default class TrailRenderSystem extends System {
    constructor(entityManager, eventBus, ctx) {
        super(entityManager, eventBus);
        this.ctx = ctx;
    }

    update(deltaTime) {} // No necesita lógica de update

    render() {
        // 1. Obtener todas las partículas del juego
        const allParticles = this.entityManager.getEntitiesWith(ParticleComponent, TransformComponent, LifetimeComponent);
        
        // 2. Agrupar las partículas por su nave "padre" usando un Map
        const trails = new Map();
        for (const particleId of allParticles) {
            const particle = this.entityManager.getComponent(particleId, ParticleComponent);
            if (!trails.has(particle.parentId)) {
                trails.set(particle.parentId, []); // Si es la primera partícula de esta nave, crear un array para su estela
            }
            trails.get(particle.parentId).push(particleId); // Añadir la partícula a la estela de su nave
        }

        // Guardamos el estado del canvas para no afectar a otros sistemas de renderizado
        this.ctx.save();
        this.ctx.lineCap = 'round'; // Extremos de línea redondeados, más suave
        this.ctx.lineJoin = 'round'; // Uniones de línea redondeadas

        // 3. Iterar sobre cada estela (cada grupo de partículas) y dibujarla
        for (const [parentId, particleIds] of trails.entries()) {
            // Para dibujar una línea continua, necesitamos al menos 2 puntos
            if (particleIds.length < 2) continue;

            // Ordenar las partículas por edad para que la línea se dibuje en el orden correcto
            particleIds.sort((a, b) => {
                const lifeA = this.entityManager.getComponent(a, LifetimeComponent).timer;
                const lifeB = this.entityManager.getComponent(b, LifetimeComponent).timer;
                return lifeA - lifeB;
            });

            // Tomamos el color del Thruster de la nave madre
            const parentThruster = this.entityManager.getComponent(parentId, ThrusterComponent);
            if (!parentThruster) continue; // Si la nave ya no existe, no dibujar su estela
            
            // Empezamos a definir la ruta de la línea
            this.ctx.beginPath();
            const firstParticleTransform = this.entityManager.getComponent(particleIds[0], TransformComponent);
            this.ctx.moveTo(firstParticleTransform.position.x, firstParticleTransform.position.y);

            // Conectamos todos los puntos de la estela
            let lastTransform = firstParticleTransform;
            for (let i = 1; i < particleIds.length; i++) {
                const particleId = particleIds[i];
                const transform = this.entityManager.getComponent(particleId, TransformComponent);
                this.ctx.lineTo(transform.position.x, transform.position.y);
                lastTransform = transform;
            }
            
            // Crear gradiente que se desvanece a lo largo de la línea
            const gradient = this.ctx.createLinearGradient(
                firstParticleTransform.position.x, firstParticleTransform.position.y,
                lastTransform.position.x, lastTransform.position.y
            );
            
            // El gradiente va desde el color de la estela con opacidad...
            gradient.addColorStop(0, parentThruster.particleColor || '#FFFFFF'); 
            // ...hasta ser completamente transparente al final.
            gradient.addColorStop(1, 'transparent'); 

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1.5; // Grosor del hilo. ¡Puedes ajustar esto!
            this.ctx.globalAlpha = 0.8; // Opacidad general de la estela
            this.ctx.stroke(); // ¡Dibujar la línea!
        }

        // Restauramos el estado del canvas
        this.ctx.restore();
    }
} 