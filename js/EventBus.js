/**
 * EventBus - Sistema de Publicador/Suscriptor para comunicación desacoplada.
 */
export default class EventBus {
    constructor() {
        this.events = {};
        console.log("🚌 EventBus creado y listo.");
    }

    /**
     * Se suscribe a un evento.
     * @param {string} eventName - El nombre del evento al que suscribirse.
     * @param {Function} callback - La función que se ejecutará cuando el evento se publique.
     */
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * Publica un evento, notificando a todos los suscriptores.
     * @param {string} eventName - El nombre del evento a publicar.
     * @param {*} [data] - Datos opcionales para pasar a los suscriptores.
     */
    publish(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error en un suscriptor del evento "${eventName}":`, error);
                }
            });
        }
    }
} 