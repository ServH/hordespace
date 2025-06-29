import Component from './Component.js';

export default class TrailComponent extends Component {
    constructor(config = {}) {
        super();
        // Array que almacenará los puntos {x, y} de la estela
        this.points = [];
        // Configuración de apariencia
        this.config = {
            color: config.color || '#ffffff',
            glowColor: config.glowColor || '#ffffff',
            width: config.width || 3,
            maxLength: config.maxLength || 30, // Máximo de puntos en el array
            fadeType: config.fadeType || 'linear' // Tipo de desvanecimiento
        };
    }
} 