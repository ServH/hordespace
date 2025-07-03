import Component from './Component.js';

export default class ParallaxLayerComponent extends Component {
    /**
     * @param {number} depth - Factor de profundidad. 1 = se mueve con la cámara. 0 = estático. 0.1 = muy lejano.
     */
    constructor(depth) {
        super();
        this.depth = depth;
    }
} 