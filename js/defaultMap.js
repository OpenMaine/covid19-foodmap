class DefaultMap {
    constructor(mapId, center, zoom=8) {
        this.center = center
        this.markers = {};
        
        this.map = L.map(mapId).setView([center[0], center[1]], zoom);
        this.map.zoomControl.setPosition('topright');
        this.layerGroup = L.layerGroup().addTo(this.map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    setPosition(centerX, centerY, zoom) {
        map.setView([centerX, centerY], zoom);
    }
}