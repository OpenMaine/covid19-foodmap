import GeoPoint from "./geoPoint.js";
import MarkerIcon from '../core/markerIcon.js';
import AppSettings from '../settings/appSettings.js';
import DeviceLocationProvider from '../core/deviceLocationProvider.js';

export default class DefaultMap {
    /**
     * @param {string} mapId : DOM element id for map mounting
     */
    constructor(mapId) {
        this._mapId = mapId;
        //Todo: Should programmatically cycle tokens.
        this._mapboxToken = AppSettings.MapBoxToken;
        this.markers = {};
    }
    
    init() {
        const deferred = $.Deferred();

        new DeviceLocationProvider().getLocation().then(defaultLocation => {
            this.defaultCenter = defaultLocation ? new GeoPoint(defaultLocation.latitude, defaultLocation.longitude) : new GeoPoint(45.1690993, -69.2568189);
            this.defaultZoom = defaultLocation ? 12 : 7;
            this.map = L.map(this._mapId, {center: [this.defaultCenter.latitude, this.defaultCenter.longitude], zoom: this.defaultZoom, layers: this._getBasemaps()});
            this.map.zoomControl.setPosition('topleft');
            this.layerGroup = L.layerGroup().addTo(this.map);
            L.control.layers(this._baseMaps,{}).addTo(this.map);
            deferred.resolve();
        });

        return deferred.promise();
    }

    /**
     * Set the map to a given center and zoom level
     * @param {GeoPoint} geoPoint: The GeoPoint center of the map view
     * @param {number} zoom: The map zoom level (positive integer) 
     */
    setPosition(geoPoint, zoom) {
        this.map.setView([geoPoint.latitude, geoPoint.longitude], zoom);
    }

    /**
     * Reset zoom to the default position
     */
    zoomDefault() {
        this.setPosition(this.defaultCenter, this.defaultZoom);
    }

    /**
     * Add a marker to the map
     * @param {GeoPoint} geoPoint: The location of the marker 
     * @param {string} key: A unique identifier for the marker 
     * @param {MarkerIcon} icon 
     */
    addMarker(geoPoint, key, icon = null) {
        let iconOption = icon ? {icon: icon} : {};
        let marker = L.marker([geoPoint.latitude, geoPoint.longitude], iconOption).addTo(this.layerGroup);
        this.markers[key] = marker;
    }

    /**
     * Add a popup to an existing marker
     * @param {string} key: The identifier for the existing marker
     * @param {string} html: The HTML content of the marker 
     */
    addMarkerPopup(key, html) {
        this.markers[key].bindPopup(html);
    }

    /**
     * Remove all markers from the map
     */
    clearMarkers() {
        this.layerGroup.clearLayers();
        this.markers = {};
    }

    /**
     * Add a legend to the map
     * @param {string} html: HTML content for the legent 
     * @param {string} position: The position of the marker. Values are topright, bottomright, topleft, and bottomleft 
     */
    addLegend(html, position='bottomright') {
        var legend = L.control({position: position});
        legend.onAdd = (map) => html;
        legend.addTo(this.map);
    }

    /**
     * Position and zoom the map to show all markers
     */
    fitMarkerBounds() {
        const nMarkers = Object.keys(this.markers).length;
        if (nMarkers > 1) {
            const group = new L.featureGroup(Object.values(this.markers));
            this.map.fitBounds(group.getBounds());
        } else if (nMarkers === 1) {
            var markerBounds = L.latLngBounds([Object.values(this.markers)[0].getLatLng()]);
            this.map.fitBounds(markerBounds);
        }
    }


    _getBasemaps() {
        this._baseMaps = {
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
                        {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),
            "Dark": L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+this._mapboxToken, 
                        {id: 'mapbox/dark-v10', attribution: "&copy; Mapbox", tileSize: 512, zoomOffset: -1}),
            "Light": L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+this._mapboxToken, 
                        {id: 'mapbox/light-v10', tileSize: 512, zoomOffset: -1}),
            "Default": L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token='+this._mapboxToken, 
                        {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1})
        };

        return Object.values(this._baseMaps);
    }
}