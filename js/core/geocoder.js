/**
 * Perform geocoding and reverse geocoding operations
 * Dependencies
 *  - mappingCore
 */
class Geocoder {
    _geocodingService = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    getZipcodeGeopoint(zipCode) {
        const deferred = $.Deferred();

        const match = zipCode.toString().trim().match(/^([0-9]{5})(-[0-9]{4})?$/);
        if (match){
            const requestUri = `${this._geocodingService}/findAddressCandidates?f=json&SingleLine=${match[1]}`;
            $.get(requestUri).done((response, status) => {
                if (response.candidates && response.candidates.length > 0)
                    deferred.resolve(new GeoPoint(response.candidates[0].location.y, response.candidates[0].location.x));
                else
                    deferred.reject();
            });
        } else {
            deferred.reject();
        }

        return deferred.promise();
    }

    // Find [city, county, zip code] for a Geopoint
    reverseGeocode(geoPoint) {
        const deferred = $.Deferred();

        if (geoPoint.latitude && geoPoint.longitude) {
            const requestUri = `${this._geocodingService}/reverseGeocode?location=${geoPoint.longitude},${geoPoint.latitude}&forStorage=false&f=json&featureTypes=PointAddress`;
            $.get((requestUri)).done((response, status) => {
                console.log(response);
                if (response.address && response.address.City && response.address.Subregion)
                    deferred.resolve([response.address.City, response.address.Subregion.split(" ")[0], response.address.Postal]);
                else 
                    deferred.reject();
            });
        } else {
            deferred.reject();
        }

        return deferred.promise();
    }
}