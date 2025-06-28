import Component from './Component.js';

export default class ParticleComponent extends Component {
    constructor(parentId) {
        super();
        // ID de la entidad (nave) que emitió esta partícula
        this.parentId = parentId;
        // Este componente ahora almacena la relación con su nave madre
    }
} 