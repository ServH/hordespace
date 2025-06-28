import TransformComponent from '../components/TransformComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import WeaponComponent from '../components/WeaponComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import AIComponent from '../components/AIComponent.js';
import AllyComponent from '../components/AllyComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import ThrusterComponent from '../components/ThrusterComponent.js';

export default class AllyFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        
        // Suscribirse al evento de añadir nave
        this.eventBus.subscribe('fleet:add_ship', (data) => {
            this.createAlly(data.shipType);
        });
    }
    
    createAlly(shipType) {
        // Obtener la posición del jugador
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) {
            console.error("❌ No se puede crear aliado: no se encuentra el jugador");
            return null;
        }
        
        const playerId = playerEntities[0];
        const playerTransform = this.entityManager.getComponent(playerId, TransformComponent);
        
        // Crear la entidad aliada
        const allyId = this.entityManager.createEntity();
        
        // Obtener configuración de formación para física unificada
        const formationConfig = CONFIG.FORMATION;
        
        // Obtener configuración según el tipo
        let config;
        let visualType;
        let projectileTypeId;
        
        switch (shipType) {
            case 'scout':
                config = CONFIG.ALLY.SCOUT;
                visualType = 'scout';
                projectileTypeId = 'ALLY_SCOUT_SHOT';
                break;
            case 'gunship':
                config = CONFIG.ALLY.GUNSHIP;
                visualType = 'gunship';
                projectileTypeId = 'ALLY_GUNSHIP_CANNON';
                break;
            default:
                console.error(`❌ Tipo de nave aliada desconocido: ${shipType}`);
                this.entityManager.destroyEntity(allyId);
                return null;
        }
        
        // Ensamblar componentes
        this.entityManager.addComponent(allyId, new TransformComponent(
            playerTransform.position.x,
            playerTransform.position.y,
            0,
            config.RADIUS
        ));
        
        this.entityManager.addComponent(allyId, new HealthComponent(config.HP));
        this.entityManager.addComponent(allyId, new CollisionComponent(config.RADIUS, 'ally'));
        this.entityManager.addComponent(allyId, new RenderComponent(visualType, config.RADIUS));
        this.entityManager.addComponent(allyId, new WeaponComponent(config.FIRE_RATE, projectileTypeId));
        // ¡CAMBIO CLAVE! Usamos el DAMPING de la formación como la FRICCION de la nave.
        // Esto asegura que la nave tiene el "freno" correcto para la fuerza que se le aplica.
        this.entityManager.addComponent(allyId, new PhysicsComponent(config.SPEED, formationConfig.DAMPING));
        
        // Componente de IA con configuración específica
        const aiComponent = new AIComponent();
        aiComponent.targetingRange = config.AI_TARGETING_RANGE;
        aiComponent.rotationSpeed = config.ROTATION_SPEED_COMBAT;
        this.entityManager.addComponent(allyId, aiComponent);
        
        // Componentes específicos de aliados
        this.entityManager.addComponent(allyId, new AllyComponent());
        this.entityManager.addComponent(allyId, new FormationFollowerComponent(playerId));
        
        // === AÑADIR PROPULSORES PARA ESTELAS ===
        const thrusterColor = (shipType === 'scout') ? '#44DDFF' : '#FF8800'; // Colores distintivos
        this.entityManager.addComponent(allyId, new ThrusterComponent({
            particleColor: thrusterColor,
            emitRate: 45,
            particleLifetime: 1.2,
            offset: { x: 0, y: config.RADIUS * 0.8 } // Sale de la cola
        }));
        
        console.log(`🚁 Nave aliada ${shipType} creada con ID: ${allyId}`);
        
        // Publicar evento para que el FleetSystem recalcule la formación
        this.eventBus.publish('fleet:ship_added', { entityId: allyId, shipType });
        
        return allyId;
    }
} 