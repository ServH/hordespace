import Component from './Component.js';

/**
 * XPOrbComponent - Componente para orbes de experiencia
 * Almacena el valor de XP que otorga al ser recolectado
 */
export default class XPOrbComponent extends Component {
    constructor(xpValue = 1) {
        super();
        this.xpValue = xpValue;
    }
} 