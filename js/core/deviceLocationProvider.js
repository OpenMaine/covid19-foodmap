export default class DeviceLocationProvider {
    /**
     * Return a promist that resolves to a [latitude, longitude] if the device location can be found
     * or null otherwise
     */
    getLocation() {
        const deferred = $.Deferred();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(x => deferred.resolve(x.coords), (err) => deferred.resolve(null)); 
        } else {
            deferred.resolve(null);
        }

        return deferred.promise();
    }
}