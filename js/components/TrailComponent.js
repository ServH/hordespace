import Component from './Component.js';

export default class TrailComponent extends Component {
    constructor(config = {}, numTrails = 1) { // AÑADIDO: número de estelas
        super();
        // MODIFICACIÓN: this.points ahora es this.trails, un array que contendrá otros arrays
        this.trails = Array.from({ length: numTrails }, () => []);
        // Configuración de apariencia
        this.config = {
            color: config.color || '#ffffff',
            glowColor: config.glowColor || '#ffffff',
            width: config.width || 3,
            maxLength: config.maxLength || 30, // Máximo de puntos en el array
            fadeType: config.fadeType || 'linear', // Tipo de desvanecimiento
            emitterSize: config.emitterSize || 5 // Tamaño del emisor
        };
    }
} 