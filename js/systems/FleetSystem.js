import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';

export default class FleetSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        
        // Suscribirse a eventos relevantes
        this.eventBus.subscribe('fleet:ship_added', () => this.recalculateFormation());
        this.eventBus.subscribe('entity:destroyed', (data) => {
            // Si la entidad destruida era un aliado, recalcular formación
            if (this.entityManager.hasComponent(data.entityId, AllyComponent)) {
                this.recalculateFormation();
                console.log("🚁 Aliado destruido, recalculando formación");
            }
        });
    }

    recalculateFormation() {
        const allies = this.entityManager.getEntitiesWith(AllyComponent, FormationFollowerComponent);
        if (allies.length === 0) return;

        // Calcular radio dinámico para evitar superposición
        const baseRadius = CONFIG.FORMATION.RADIUS;
        const shipSpacing = CONFIG.FORMATION.SHIP_SPACING || 30; // Espacio mínimo entre naves
        const dynamicRadius = Math.max(baseRadius, allies.length * shipSpacing);
        
        // Calcular el ángulo entre cada nave en la formación circular
        const angleStep = (2 * Math.PI) / allies.length;
        
        // Separación angular para evitar solapamiento de disparos
        const angularSeparation = CONFIG.FORMATION.ANGULAR_SEPARATION;

        for (let i = 0; i < allies.length; i++) {
            const followerComp = this.entityManager.getComponent(allies[i], FormationFollowerComponent);
            if (followerComp) {
                // Aplicar separación angular alternada
                const separationOffset = (i % 2 === 0) ? -angularSeparation : angularSeparation;
                const angle = (i * angleStep) + separationOffset;
                
                // Calcular posición relativa en el círculo
                // El -Math.PI/2 hace que el 0 radianes apunte "arriba"
                followerComp.targetOffset.x = dynamicRadius * Math.cos(angle - Math.PI / 2);
                followerComp.targetOffset.y = dynamicRadius * Math.sin(angle - Math.PI / 2);
            }
        }
        
        console.log(`📐 Formación recalculada para ${allies.length} aliados`);
    }

    getFleetData() {
        const allies = this.entityManager.getEntitiesWith(AllyComponent);
        return allies.map(id => {
            const allyComp = this.entityManager.getComponent(id, AllyComponent);
            return { id, type: allyComp.type };
        });
    }

    update(deltaTime) {
        // Este sistema es reactivo a eventos, no necesita update periódico
    }
} 