export default class GeoPoint {
  /**
   * Create a new GeoPoint using a longitude and latitude coordinates
   * @param {number} latitude - the latitude coordinate
   * @param {number} longitude - the longitude coordinate
   */
  constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
  }

  /**
   * Get the distance between two GeoPoints in kilometers using the Haversine formula
   * @param {GeoPoint} other: A GeoPoint to find the distance to 
   */
  distanceTo(other) {
    const toRad = (n) => n*Math.PI/180.0;
    const R = 6371; // approx. radius of Earth in km 
    const dLat = toRad(other.latitude-this.latitude);
    const dLon = toRad(other.longitude-this.longitude);  
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(this.latitude)) * Math.cos(toRad(other.latitude)) * Math.sin(dLon/2) * Math.sin(dLon/2);  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

}