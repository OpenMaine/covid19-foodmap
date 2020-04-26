/**
 * Dependencies
 *  - mappingCore
 * 
  Summary data about a food resource
  @param resourceData: object to map to the FoodResource
    The mapping needs to be updated when the shape of the source data changes. 
    This could happen if you change a column header or switch source spreadsheets.
*/
class FoodResource {
    constructor(resourceData) {
        this._defaultMapping(resourceData);
        this._setIcon();
    }

    /**
     * Mapping for sheet ID 1H9utiRTBZrGreyqSB6oGL1BiVMi7UnM3JOx1HiMWEkc
     * Sheet Name: QueryData
     * Range: A:S
     */
    _defaultMapping(resourceData) {
        this.Category = resourceData.Category;
        this.Name = resourceData.Name;
        this.County = resourceData.County;
        this.Town = resourceData.Town;
        this.Address = resourceData.Address;
        this.Phone = resourceData.Phone;
        this.LastUpdated = resourceData.DateUpdated
        this.HoursOfOperation = resourceData.HoursOfOperationOldFromExistingData;
        this.OperationalNotes = resourceData.OperationalNotesFromWebExistingData;
        this.WebLink = resourceData.WebLink;
        this.WebLink2 = resourceData.AdditionalWebLink;
        this.Latitude = resourceData.Latitude;
        this.Longitude = resourceData.Longitude;
        
        this.SpecialHoursOfOperation = resourceData.Covid19DaysOfWeek;
        this.SpecialNotes = resourceData.Covid19PickupNotes;
    }

    _setIcon() {
        if (this.Category == "Meal Sites")  {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Restaurant);
        }
        else if (this.Category == "Food Pantry") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Grocery);
        }
        else {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Star);
        }
    }
}