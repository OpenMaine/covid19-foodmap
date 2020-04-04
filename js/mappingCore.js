class GeoPoint {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Calculate the distance between 2 GeoPoints in kilometers
    // using the Haversine formula
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