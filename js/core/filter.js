export default class Filter {
  /**
   * A data filter (likely from a from user form input)
   * @param {string} field: The object property name to which the filter is applied
   * @param {any} value: a string, array of strings, or {GeoPoint, radius} used to match against the field
   * @param {Filter.FilterType} filterType: The type of the filter value
   */
  constructor(field, value, filterType) {
      this.field = field;
      this.value = value;
      this.filterType = filterType;
  }

  /** 
   * Single {string}:  Single filter  
   * Multi {string[]}: Array of filters
   * GeoPoint {zipCode: string, geoPoint: GeoPoint, radius: number}: Object for filtering by radius from a GeoPoint 
   */
  static FilterType = {
      Single: 0,
      Multi: 1,
      GeoPoint: 2
  };
}