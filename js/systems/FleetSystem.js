import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';

export default class FleetSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        
        // Añadimos una propiedad para el modo actual
        this.currentFormationMode = CONFIG.FORMATION.DEFAULT_MODE;
        
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

        // Obtenemos la configuración de la formación actual
        const formationConfig = CONFIG.FORMATION.MODES[this.currentFormationMode];
        if (!formationConfig) return;

        // --- INICIO DE LA NUEVA LÓGICA DE ASIGNACIÓN ---

        // 1. Separamos las naves por su anillo preferido
        const shipsByRingPreference = {};
        for (const ring of formationConfig.RINGS) {
            shipsByRingPreference[ring.id] = [];
        }

        for (const allyId of allies) {
            const allyComp = this.entityManager.getComponent(allyId, AllyComponent);
            const allyConfig = CONFIG.ALLY[allyComp.type.toUpperCase()];
            const preferredRing = allyConfig.PREFERRED_RING || 'inner'; // 'inner' por defecto
            if (shipsByRingPreference[preferredRing]) {
                shipsByRingPreference[preferredRing].push(allyId);
            }
        }

        // 2. Asignamos posiciones anillo por anillo
        for (const ring of formationConfig.RINGS) {
            const shipsInThisRing = shipsByRingPreference[ring.id];
            if (shipsInThisRing.length === 0) continue;

            const angleStep = (2 * Math.PI) / shipsInThisRing.length;
            
            shipsInThisRing.forEach((allyId, index) => {
                const followerComp = this.entityManager.getComponent(allyId, FormationFollowerComponent);
                if (followerComp) {
                    const angle = index * angleStep;
                    // Usamos el radio de ESTE anillo
                    followerComp.targetOffset.x = ring.radius * Math.cos(angle - Math.PI / 2);
                    followerComp.targetOffset.y = ring.radius * Math.sin(angle - Math.PI / 2);
                }
            });
        }
        // --- FIN DE LA NUEVA LÓGICA ---

        console.log(`📐 Formación táctica recalculada: ${allies.length} aliados distribuidos por rol`);
    }

    // Método auxiliar para mostrar información de debug sobre la distribución
    getRingDistribution(totalShips) {
        const formationConfig = CONFIG.FORMATION.MODES[this.currentFormationMode];
        if (!formationConfig || !formationConfig.RINGS) return 0;
        
        const rings = formationConfig.RINGS;
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