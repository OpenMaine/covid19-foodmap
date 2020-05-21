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
     * Mapping for the currently available data sheet. 
     */
    _defaultMapping(resourceData) {
        this.Id = resourceData.Id;
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
        this.Latitude = parseFloat(resourceData.Latitude);
        this.Longitude = parseFloat(resourceData.Longitude);
        this.SpecialHoursOfOperation = resourceData.Covid19Hours;
        this.SpecialNotes = resourceData.Covid19PickupNotes;
        // Must explicitly be false to be inactive.
        this.IsActive = resourceData.IsActive == null || resourceData == undefined || resourceData.IsActive.trim().toLocaleLowerCase() == "true";
    }

    _setIcon() {
        if (this.Category == "Meal Sites")  {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Restaurant);
        } else if (this.Category == "Food Pantry") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Grocery);
        } else if (this.Category == "School Meal Pickup") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Utensils);
        } else {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Star);
        }
    }

    
}