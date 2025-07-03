import System from './System.js';
import TrailComponent from '../components/TrailComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class TrailRenderSystem extends System {
    constructor(entityManager, eventBus, ctx, camera) {
        super(entityManager, eventBus);
        this.ctx = ctx;
        this.camera = camera;
    }

    render() {
        const entities = this.entityManager.getEntitiesWith(TrailComponent, TransformComponent);

        for (const entityId of entities) {
            const trail = this.entityManager.getComponent(entityId, TrailComponent);
            const config = trail.config;

            // MODIFICACIÓN: Iteramos sobre cada array de puntos (cada estela) en el TrailComponent
            for (const points of trail.trails) {
                if (points.length < 2) continue;

                // Convertir puntos del mundo a coordenadas de pantalla
                const screenPoints = points.map(point => ({
                    x: point.x - this.camera.x + (this.camera.width / 2),
                    y: point.y - this.camera.y + (this.camera.height / 2)
                }));

                // --- RENDERIZADO SELECTIVO BASADO EN JERARQUÍA VISUAL ---
                if (config.useAdvancedGlow) {
                    // RUTA DE ALTA CALIDAD (Jugador y Aliados)
                    this.renderTrailWithGlow(screenPoints, config);
                    this.drawEmitter(screenPoints[0], config);
                } else {
                    // RUTA OPTIMIZADA (Enemigos)
                    this._drawSimpleTrail(screenPoints, config);
                }
            }
        }
    }

    renderTrailWithGlow(screenPoints, config) {
        // Múltiples pasadas para crear el efecto de brillo
        const passes = [
            { width: config.width * 4, alpha: 0.1, blur: 20 },    // Halo exterior
            { width: config.width * 2.5, alpha: 0.2, blur: 10 }, // Halo medio
            { width: config.width * 1.5, alpha: 0.4, blur: 5 },  // Halo interior
            { width: config.width, alpha: 1.0, blur: 0 }         // Núcleo
        ];

        for (const pass of passes) {
            this.ctx.save();
            
            // Configurar el estilo de línea
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.lineWidth = pass.width;
            this.ctx.globalAlpha = pass.alpha;
            
            // Configurar el brillo
            if (pass.blur > 0) {
                this.ctx.shadowBlur = pass.blur;
                this.ctx.shadowColor = config.glowColor;
            }

            // Crear el gradiente de desvanecimiento
            const gradient = this.createFadeGradient(screenPoints, config, pass.alpha);
            this.ctx.strokeStyle = gradient;

            // Dibujar la curva suave
            this.drawSmoothCurve(screenPoints);
            
            this.ctx.restore();
        }
    }

    drawSmoothCurve(points) {
        if (points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        if (points.length === 2) {
            // Solo dos puntos, dibujar línea recta
            this.ctx.lineTo(points[1].x, points[1].y);
        } else {
            // Múltiples puntos, usar curvas cuadráticas para suavidad
            for (let i = 1; i < points.length - 1; i++) {
                const currentPoint = points[i];
                const nextPoint = points[i + 1];
                
                // Punto de control a mitad de camino
                const controlX = (currentPoint.x + nextPoint.x) / 2;
                const controlY = (currentPoint.y + nextPoint.y) / 2;
                
                this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
            }
            
            // Último segmento hasta el punto final
            const lastPoint = points[points.length - 1];
            this.ctx.lineTo(lastPoint.x, lastPoint.y);
        }

        this.ctx.stroke();
    }

    createFadeGradient(points, config, baseAlpha) {
        if (points.length < 2) return config.color;

        const startPoint = points[0];
        const endPoint = points[points.length - 1];
        
        const gradient = this.ctx.createLinearGradient(
            startPoint.x, startPoint.y,
            endPoint.x, endPoint.y
        );

        // Crear el desvanecimiento según el tipo configurado
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
            const position = i / steps;
            let alpha = baseAlpha;

            // Aplicar el tipo de desvanecimiento
            switch (config.fadeType) {
                case 'exponential':
                    alpha *= Math.pow(1 - position, 2);
                    break;
                case 'smooth':
                    alpha *= 0.5 + 0.5 * Math.cos(position * Math.PI);
                    break;
                default: // 'linear'
                    alpha *= (1 - position);
                    break;
            }

            // Convertir color hex a rgba
            const color = this.hexToRgba(config.color, alpha);
            gradient.addColorStop(position, color);
        }

        return gradient;
    }

    hexToRgba(hex, alpha) {
        // Convertir color hexadecimal a rgba
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    drawEmitter(screenPoint, config) {
        const size = config.emitterSize;
        if (!size) return; // Si no hay tamaño, no dibujamos nada

        this.ctx.save();

        // 1. Resplandor exterior (Glow)
        // Usamos el glowColor y una intensidad aumentada para el emisor
        this.ctx.shadowBlur = (size * 2);
        this.ctx.shadowColor = config.glowColor;

        // Creamos un gradiente radial que va del color sólido a transparente
        const gradient = this.ctx.createRadialGradient(
            screenPoint.x, screenPoint.y, 0, 
            screenPoint.x, screenPoint.y, size * 2
        );
        gradient.addColorStop(0, config.color + 'AA'); // Un poco transparente en el centro
        gradient.addColorStop(0.7, config.glowColor + '80');
        gradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(screenPoint.x, screenPoint.y, size * 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Núcleo interior brillante
        this.ctx.shadowBlur = size;
        this.ctx.fillStyle = config.color;
        this.ctx.beginPath();
        this.ctx.arc(screenPoint.x, screenPoint.y, size, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Método de renderizado optimizado para estelas enemigas
     * Sin efectos de brillo, sin emisor, una sola pasada de dibujado
     */
    _drawSimpleTrail(screenPoints, config) {
        if (screenPoints.length < 2) return;

        this.ctx.save();

        // Crear el gradiente para el desvanecimiento
        const gradient = this.ctx.createLinearGradient(
            screenPoints[0].x, screenPoints[0].y,
            screenPoints[screenPoints.length - 1].x, screenPoints[screenPoints.length - 1].y
        );
        gradient.addColorStop(0, config.color);
        gradient.addColorStop(1, 'transparent');

        // DIBUJADO EN UNA SOLA PASADA - Sin brillo, sin múltiples capas
        this.ctx.beginPath();
        this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

        // Usar curvas cuadráticas para suavidad (pero sin el costo del brillo)
        if (screenPoints.length === 2) {
            this.ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
        } else {
            for (let i = 1; i < screenPoints.length - 1; i++) {
                const currentPoint = screenPoints[i];
                const nextPoint = screenPoints[i + 1];
                const controlX = (currentPoint.x + nextPoint.x) / 2;
                const controlY = (currentPoint.y + nextPoint.y) / 2;
                this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
            }
            // Último segmento
            const lastPoint = screenPoints[screenPoints.length - 1];
            this.ctx.lineTo(lastPoint.x, lastPoint.y);
        }
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = config.width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalAlpha = 0.6; // Opacidad general baja para mantenerlas subordinadas
        this.ctx.stroke();

        this.ctx.restore();
    }
} 