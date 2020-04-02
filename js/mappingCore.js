class GeoPoint {
    constructor(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
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
    Farm: 'farm-2.png'
};



const CountyCoordinates = {
	'Androscoggin': new GeoPoint(44.1966666,-70.5196205),
	'Aroostook': new GeoPoint(46.5106902,-69.0078266),
	'Cumberland': new GeoPoint(43.8186688,-70.9221653),
	'Franklin': new GeoPoint(45.062014,-70.9420492),
	'Hancock': new GeoPoint(44.6405031,-68.9518927),
	'Kennebec': new GeoPoint(44.4126864,-70.3130643),
	'Knox': new GeoPoint(44.0471118,-69.5270931),
	'Lincoln': new GeoPoint(44.0209911,-69.8034423),
	'Oxford': new GeoPoint(44.5647857,-71.2219684),
	'Penobscot': new GeoPoint(45.5143842,-69.7684287),
	'Piscataquis': new GeoPoint(45.786881,-70.425639),
	'Sagadahoc': new GeoPoint(43.9005136,-70.139785),
	'Somerset': new GeoPoint(45.5702489,-71.0307851),
	'Waldo': new GeoPoint(44.4783521,-69.4297386),
	'Washington': new GeoPoint(45.0015986,-68.0559589),
	'York': new GeoPoint(43.3642898,-71.1647918)
};