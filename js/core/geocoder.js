import AppSettings from '../settings/appSettings.js';
import GeoPoint from './geoPoint.js';
/**
 * Perform geocoding and reverse geocoding operations
 */
export default class Geocoder {
    constructor() {
        this._geocodingService = AppSettings.GeocodingServiceUri;
    }

    /**
     * Find a GeoPoint for an address search string
     * @param {string} singleLineAddress: An address search string (i.e. 5 Main St. Townville ME) 
     */
    geocodeSingleLine(singleLineAddress) {
        const deferred = $.Deferred();

        if (singleLineAddress && singleLineAddress.length > 0){
            const requestUri = `${this._geocodingService}/findAddressCandidates?f=json&SingleLine=${singleLineAddress}`;
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


    /**
     * Find [city, county, zip code] for a Geopoint
     * @param {GeoPoint} geoPoint: The GeoPoint to reverse geocode
     */
    reverseGeocode(geoPoint) {
        const deferred = $.Deferred();

        if (geoPoint.latitude && geoPoint.longitude) {
            const requestUri = `${this._geocodingService}/reverseGeocode?location=${geoPoint.longitude},${geoPoint.latitude}&forStorage=false&f=json&featureTypes=PointAddress`;
            $.get((requestUri)).done((response, status) => {
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