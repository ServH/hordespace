/**
 * SpriteCache - Crea y almacena imágenes pre-renderizadas en canvases
 * fuera de pantalla para una optimización masiva del renderizado.
 */
export default class SpriteCache {
    constructor() {
        this.cache = {};
        console.log("🎨 SpriteCache creado.");
    }

    /**
     * Pre-renderiza un sprite usando una función de dibujado y lo guarda en cache.
     * @param {string} key - La clave única para este sprite (ej. 'projectile_laser').
     * @param {number} width - El ancho del canvas para el sprite.
     * @param {number} height - El alto del canvas para el sprite.
     * @param {Function} renderFunction - La función que hará el dibujado. Recibe (ctx, width, height).
     */
    preRender(key, width, height, renderFunction) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        renderFunction(ctx, width, height);

        this.cache[key] = canvas;
        console.log(`🎨 Sprite pre-renderizado y cacheado: ${key}`);
    }

    /**
     * Obtiene un sprite pre-renderizado de la cache.
     * @param {string} key - La clave del sprite a obtener.
     * @returns {HTMLCanvasElement|null} - El canvas con el sprite o null si no existe.
     */
    get(key) {
        return this.cache[key] || null;
    }
} 