/**
 * Una rejilla espacial para optimizar la detección de colisiones y búsquedas de proximidad.
 * Divide el mundo en celdas y almacena entidades en cada una.
 */
export default class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map(); // Usamos un Map para un mundo "infinito"
        console.log(`🌐 Spatial Grid creada con celdas de ${cellSize}x${cellSize} píxeles.`);
    }

    // Genera una clave única para una celda a partir de sus coordenadas
    _getKey(cellX, cellY) {
        return `${cellX},${cellY}`;
    }

    // Añade una entidad a la rejilla
    add(entityId, x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const key = this._getKey(cellX, cellY);

        if (!this.grid.has(key)) {
            this.grid.set(key, new Set());
        }
        this.grid.get(key).add(entityId);
    }

    // Elimina una entidad de la rejilla
    remove(entityId, x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const key = this._getKey(cellX, cellY);

        if (this.grid.has(key)) {
            this.grid.get(key).delete(entityId);
        }
    }

    // Actualiza la posición de una entidad en la rejilla
    update(entityId, oldX, oldY, newX, newY) {
        const oldCellX = Math.floor(oldX / this.cellSize);
        const oldCellY = Math.floor(oldY / this.cellSize);
        const newCellX = Math.floor(newX / this.cellSize);
        const newCellY = Math.floor(newY / this.cellSize);

        if (oldCellX !== newCellX || oldCellY !== newCellY) {
            this.remove(entityId, oldX, oldY);
            this.add(entityId, newX, newY);
        }
    }

    // Obtiene todas las entidades que están en un área rectangular (y sus celdas vecinas)
    query(x, y, width, height) {
        const results = new Set();
        const startCellX = Math.floor(x / this.cellSize) - 1;
        const endCellX = Math.floor((x + width) / this.cellSize) + 1;
        const startCellY = Math.floor(y / this.cellSize) - 1;
        const endCellY = Math.floor((y + height) / this.cellSize) + 1;

        for (let cx = startCellX; cx <= endCellX; cx++) {
            for (let cy = startCellY; cy <= endCellY; cy++) {
                const key = this._getKey(cx, cy);
                if (this.grid.has(key)) {
                    for (const entityId of this.grid.get(key)) {
                        results.add(entityId);
                    }
                }
            }
        }
        return Array.from(results);
    }
} 