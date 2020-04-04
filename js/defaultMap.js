class DefaultMap {
    constructor(mapId, center, zoom=8) {
        this._geocodingService = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=pjson&SingleLine=";
        this.center = center
        this.markers = {};
        this.map = L.map(mapId).setView([center.latitude, center.longitude], zoom);
        this.map.zoomControl.setPosition('topright');
        this.layerGroup = L.layerGroup().addTo(this.map);
        this._setMapAttribution();
    }
    
    _setMapAttribution() {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    setPosition(geoPoint, zoom) {
        this.map.setView([geoPoint.latitude, geoPoint.longitude], zoom);
    }

    addMarker(geoPoint, key, icon = null) {
        let iconOption = icon ? {icon: icon} : {};
        let marker = L.marker([geoPoint.latitude, geoPoint.longitude], iconOption).addTo(this.layerGroup);
        this.markers[key] = marker;
    }

    addMarkerPopup(key, html) {
        this.markers[key].bindPopup(html);
    }

    clearMarkers() {
        this.layerGroup.clearLayers();
        this.markers = {};
    }

    fitMarkerBounds() {
        const group = new L.featureGroup(Object.values(this.markers));
        this.map.fitBounds(group.getBounds());
    }


    getZipcodeGeopoint(zipCode) {
        const zipCodeRegex = /^([0-9]{5})(-[0-9]{4})?$/;
        const match = zipCode.toString().trim().match(zipCodeRegex);
        if (match){
            const zipCode = match[1];
            $.get(this._geocodingService+zipCode).done((response, status) => {
                if (response.candidates && response.candidates.length > 0) {
                    return new GeoPoint(response.candidates[0].location.y, response.candidates[0].location.x);
                }

                return null;
            });
        } else {
            return null;
        }
    }
}