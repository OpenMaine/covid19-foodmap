/**
 * A (longitude, latitude) pair
 */
class GeoPoint {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Get the distance between two GeoPoints in kilometers using the Haversine formula
     * @param other: A GeoPoint object to find the distance to 
     */
    distanceTo(other) {
        const toRad = (n) => n*Math.PI/180.0;
         var R = 6371; // approx. radius of Earth in km 
         var dLat = toRad(other.latitude-this.latitude);
         var dLon = toRad(other.longitude-this.longitude);  
         var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(this.latitude)) * Math.cos(toRad(other.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);  
         var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
         return R * c; 
    }
}


/* single: Filter value is a string
   multi: Filter value is an array of strings
*/
const FilterType = {
    single: 0,
    multi: 1,
    geoPoint: 2
};
/**
 * A data filter (likely from a from user form input)
 * @param field: The object property name to which the filter is applied
 * @param value: a string, array of strings, or {GeoPoint, radius} used to match against the field
 * @param filterType: FilterType.single, FilterType.multi, or FilterType.geoPoint
 */
class Filter {
    constructor(field, value, filterType) {
        this.field = field;
        this.value = value;
        this.filterType = filterType;
    }
}


// TODO: think about other ways to do this.
const MarkerIcon = {
    getPath: (markerIcon) => `map-markers/${markerIcon}`,
    AccessDenied: 'accessdenied.png',
    Aed: 'aed-2.png',
    Airport: 'airport.png',
    Ambulance: 'ambulance.png',
    Apple: 'apple.png',
    View: 'beautifulview.png',
    Binoculars: 'binoculars.png',
    Bread: 'bread.png',
    Burger: 'burger.png',
    Bus: 'bus.png',
    Bus2: 'bustour.png',
    Car: 'car.png',
    Caution: 'caution.png',
    Chart: 'chart-2.png',
    Cinema: 'cinema.png',
    Coffee: 'coffee.png',
    Computer: 'computers.png',
    Contract: 'contact.png',
    Cycling: 'cycling.png',
    Dancing: 'dancinghall.png',
    Wheelchair: 'disability.png',
    Drink: 'drink.png',
    Restaurant: 'restaurant.png',
    Farmstand: 'farmstand.png',
    Motel: 'motel-2.png',
    Home: 'home-2.png',
    Star: 'star-3.png',
    DayCare: 'daycare.png',
    FastFood: 'fastfood.png',
    Farm: 'farm-2.png',
    Grocery: 'grocery.png'
};