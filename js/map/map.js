import DefaultMap from '../core/defaultMap.js';
import PantryMapController from './pantryMapController.js';

$(() => {
  const map = new DefaultMap('main-map');
  map.init().then(() => new PantryMapController(map));
});