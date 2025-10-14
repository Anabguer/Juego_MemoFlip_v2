/**
 * Script para eliminar la mecánica 'peeked_card' (vista previa) de todos los niveles
 * La reemplaza con mecánicas alternativas según el contexto
 */

const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../src/data/levels.json');
const data = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
const levels = data.levels;

// Mecánicas alternativas disponibles (sin peeked_card)
const alternativeMechanics = [
    'basic',      // Sin mecánicas especiales
    'timer',      // Cronómetro
    'fog',        // Niebla
    'rotation',   // Rotación
    'bomb'        // Bomba
];

let cambiosRealizados = 0;
let nivelPrevioMecanica = null;

levels.forEach((level, index) => {
    if (level.mechanics && level.mechanics.includes('peeked_card')) {
        const oldMechanics = [...level.mechanics];
        
        // Seleccionar mecánica de reemplazo según el nivel
        let nuevaMecanica;
        
        if (level.timeSec === 0) {
            // Sin cronómetro -> usar 'basic' (sin mecánicas especiales)
            nuevaMecanica = 'basic';
        } else {
            // Con cronómetro -> alternar entre fog, rotation, bomb
            const opciones = ['fog', 'rotation', 'bomb'].filter(m => m !== nivelPrevioMecanica);
            nuevaMecanica = opciones[Math.floor(Math.random() * opciones.length)];
        }
        
        // Reemplazar peeked_card por la nueva mecánica
        level.mechanics = [nuevaMecanica];
        
        // Actualizar descripción si menciona "atisbo" o "vista previa"
        if (level.description) {
            level.description = level.description
                .replace(/atisbo:/i, getMechanicName(nuevaMecanica) + ':')
                .replace(/algunas cartas se muestran un instante/i, getMechanicDescription(nuevaMecanica));
        }
        
        cambiosRealizados++;
        nivelPrevioMecanica = nuevaMecanica;
        
        console.log(`✅ Nivel ${level.id}: ${oldMechanics.join(', ')} → ${level.mechanics.join(', ')}`);
    } else if (level.mechanics && level.mechanics.length > 0) {
        nivelPrevioMecanica = level.mechanics[0];
    }
});

// Guardar el archivo actualizado
fs.writeFileSync(levelsPath, JSON.stringify(data, null, 4), 'utf8');

console.log('\n' + '='.repeat(60));
console.log(`✅ COMPLETADO`);
console.log('='.repeat(60));
console.log(`Total de niveles modificados: ${cambiosRealizados}`);
console.log(`Archivo guardado: ${levelsPath}`);

// Funciones auxiliares
function getMechanicName(mechanic) {
    const names = {
        'basic': 'Nivel básico',
        'fog': 'Niebla',
        'rotation': 'Rotación',
        'bomb': 'Bomba',
        'timer': 'Cronómetro'
    };
    return names[mechanic] || 'Nivel';
}

function getMechanicDescription(mechanic) {
    const descriptions = {
        'basic': 'juega normalmente',
        'fog': 'las cartas están parcialmente ocultas',
        'rotation': 'las cartas pueden rotar',
        'bomb': 'algunas cartas explotan si fallas',
        'timer': 'juega contra el tiempo'
    };
    return descriptions[mechanic] || 'supera el nivel';
}

