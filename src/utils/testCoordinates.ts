/**
 * Test de conversion de coordonnées GPS en coordonnées de carte
 */

import { testGPSConversion } from './gpsConverter';

// Coordonnées à tester
const testLatitude = 47.212560;
const testLongitude = -1.557369;

// Exécuter le test
console.log(testGPSConversion(testLatitude, testLongitude));

