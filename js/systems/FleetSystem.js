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
        this.eventBus.subscribe('command:cycle_formation', () => this.cycleFormationMode());
    }

    cycleFormationMode() {
        const modes = Object.keys(CONFIG.FORMATION.MODES);
        const currentIndex = modes.indexOf(this.currentFormationMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.currentFormationMode = modes[nextIndex];
        console.log(`▶️ Formación cambiada a: ${this.currentFormationMode}`);
        this.recalculateFormation();
    }

    recalculateFormation() {
        const allies = this.entityManager.getEntitiesWith(AllyComponent, FormationFollowerComponent);
        if (allies.length === 0) return;

        // Obtenemos la configuración de la formación actual
        const formationConfig = CONFIG.FORMATION.MODES[this.currentFormationMode];
        if (!formationConfig) return;

        // --- INICIO DE LA MODIFICACIÓN ---
        switch(formationConfig.TYPE) {
            case 'CIRCLE':
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
                break;
                
            case 'V_SHAPE':
                let shipsPlaced = 0;
                allies.forEach((allyId, index) => {
                    const followerComp = this.entityManager.getComponent(allyId, FormationFollowerComponent);
                    if (followerComp) {
                        const side = (shipsPlaced % 2 === 0) ? -1 : 1; // -1 para izquierda, 1 para derecha
                        const rank = Math.floor(shipsPlaced / 2); // 0 para la primera pareja, 1 para la segunda, etc.
                        
                        const angle = formationConfig.SPREAD_ANGLE * side;
                        const distance = (rank + 1) * formationConfig.DISTANCE_STEP;

                        followerComp.targetOffset.x = Math.sin(angle) * distance;
                        followerComp.targetOffset.y = -Math.cos(angle) * distance;
                        shipsPlaced++;
                    }
                });
                break;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        console.log(`📐 Formación táctica recalculada: ${allies.length} aliados en modo ${this.currentFormationMode}`);
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
        const fleetComposition = {};

        for (const id of allies) {
            const allyComp = this.entityManager.getComponent(id, AllyComponent);
            if (fleetComposition[allyComp.type]) {
                fleetComposition[allyComp.type]++;
            } else {
                fleetComposition[allyComp.type] = 1;
            }
        }
        // Devolverá un objeto como: { scout: 2, gunship: 4 }
        return fleetComposition;
    }

    /**
     * Devuelve una lista simple de los tipos de todas las naves en la flota.
     * Diseñado para ser usado por el SynergyManager.
     * @returns {string[]} Un array como ['scout', 'gunship', 'gunship']
     */
    getFleetManifest() {
        const allies = this.entityManager.getEntitiesWith(AllyComponent);
        if (!allies) return [];

        return allies.map(id => {
            const allyComp = this.entityManager.getComponent(id, AllyComponent);
            return allyComp ? allyComp.type : '';
        }).filter(type => type !== ''); // Filtrar tipos vacíos por seguridad
    }

    update(deltaTime) {
        // Este sistema es reactivo a eventos, no necesita update periódico
    }
} 