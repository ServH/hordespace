/**
 * Space Horde Survivor - Libro de Recetas de Evoluciones
 * Este archivo contiene el "Libro de Recetas" para todas las Sinergias y Evoluciones del juego.
 * Cada objeto define los "ingredientes" necesarios (prerrequisitos) y el "plato" resultante (el efecto).
 * 
 * Fase 1: Preparar los Datos para Sinergias y Evoluciones
 */

export const EVOLUTION_RECIPES = [
    // --- Ejemplo 1: Evolución de una Nave Aliada ---
    {
        id: 'evo_dreadnought', // ID único para esta evolución
        name: 'Evolucionar: Acorazado', // Nombre que verá el jugador
        description: 'La Cañonera evoluciona a una\nfortaleza móvil con un cañón\nde plasma de área.',
        type: 'Evolution',
        category: 'Special', // Las evoluciones aparecerán en la categoría "Especial"

        // Los "ingredientes" necesarios para que esta receta esté disponible
        prerequisites: {
            // Requiere que el jugador tenga al menos una de estas naves en su flota
            ships: ['gunship'], 
            // Y que haya adquirido previamente estos power-ups
            powerups: ['damage_boost', 'health_boost'] 
        },

        // El "resultado" al elegir esta evolución
        effect: {
            type: 'EVOLVE_ALLY', // Un tipo de efecto especial que procesaremos más adelante
            from: 'gunship',     // La nave que se transforma
            to: 'dreadnought'    // La nueva nave que la reemplaza (la crearemos en el futuro)
        }
    },

    // --- Ejemplo 2: Evolución/Sinergia de un Arma ---
    {
        id: 'evo_disintegrator_ray',
        name: 'Sinergia: Rayo Desintegrador',
        description: 'Combina el láser y los proyectiles\nde plasma en un rayo continuo\nque derrite a los enemigos.',
        type: 'Evolution',
        category: 'Special',

        // Ingredientes: solo necesita que el jugador haya adquirido estos dos power-ups
        prerequisites: {
            ships: [], // No requiere ninguna nave específica
            powerups: ['pierce_shot', 'fire_rate_boost']
        },

        // Resultado
        effect: {
            type: 'EVOLVE_WEAPON', // Otro tipo de efecto especial
            newProjectileTypeId: 'DISINTEGRATOR_RAY' // Reemplaza el proyectil del jugador por uno nuevo
        }
    }
];

// Exportar también una función helper para facilitar el acceso a las recetas
export function getEvolutionRecipes() {
    return EVOLUTION_RECIPES;
}

// Función helper para obtener recetas por categoría
export function getRecipesByCategory(category) {
    return EVOLUTION_RECIPES.filter(recipe => recipe.category === category);
}

// Función helper para obtener recetas por tipo
export function getRecipesByType(type) {
    return EVOLUTION_RECIPES.filter(recipe => recipe.type === type);
}

console.log("✅ Libro de Recetas de Evoluciones cargado:", EVOLUTION_RECIPES.length, "recetas disponibles"); 