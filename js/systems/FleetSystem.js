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

        const formationRings = CONFIG.FORMATION.RINGS;
        let shipsToPlace = [...allies];
        let totalShipsPlaced = 0;

        // 1. Iteramos a través de cada anillo definido en la configuración
        for (const ring of formationRings) {
            // Determinamos cuántas naves podemos colocar en este anillo
            const shipsInThisRing = Math.min(ring.maxShips, shipsToPlace.length);

            if (shipsInThisRing <= 0) break; // No hay más naves que colocar

            const angleStep = (2 * Math.PI) / shipsInThisRing;

            // 2. Colocamos el número correspondiente de naves en este anillo
            for (let i = 0; i < shipsInThisRing; i++) {
                const allyId = shipsToPlace.shift(); // Tomamos la siguiente nave de la lista
                const followerComp = this.entityManager.getComponent(allyId, FormationFollowerComponent);
                
                if (followerComp) {
                    const angle = i * angleStep;
                    
                    // 3. Asignamos su posición usando el radio de ESTE anillo
                    followerComp.targetOffset.x = ring.radius * Math.cos(angle - Math.PI / 2);
                    followerComp.targetOffset.y = ring.radius * Math.sin(angle - Math.PI / 2);
                }
            }
            
            totalShipsPlaced += shipsInThisRing;
            if (shipsToPlace.length === 0) break; // Todas las naves han sido colocadas
        }

        console.log(`📐 Formación de anillos recalculada para ${allies.length} aliados en ${this.getRingDistribution(allies.length)} anillos.`);
    }

    // Método auxiliar para mostrar información de debug sobre la distribución
    getRingDistribution(totalShips) {
        const rings = CONFIG.FORMATION.RINGS;
        let remaining = totalShips;
        let ringCount = 0;
        
        for (const ring of rings) {
            if (remaining <= 0) break;
            const shipsInRing = Math.min(ring.maxShips, remaining);
            remaining -= shipsInRing;
            ringCount++;
        }
        
        return ringCount;
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