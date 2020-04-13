/**
 * Dependencies
 *  - mappingCore
 * 
  Summary data about a food resource
  @param resourceData: object to map to the FoodResource
    The mapping needs to be updated when the shape of the source data changes. 
    This could happen if you change a column header or switch source spreadsheets.

    Remember that changing class field names will require changes elsewhere.
*/
class FoodResource {
    constructor(resourceData) {
        this.Category = resourceData.Category;
        this.Name = resourceData.Name;
        this.County = resourceData.County;
        this.Town = resourceData.Town;
        this.Address = resourceData.Address;
        this.Phone = resourceData.Phone;
        this.HoursOfOperation = resourceData.HoursOfOperation;
        this.OperationalNotes = resourceData.OperationalNotes;
        this.WebLink = resourceData.WebLink;
        this.AdditionalWebLink = resourceData.AdditionalWebLink;
        this.Latitude = resourceData.Latitude;
        this.Longitude = resourceData.Longitude;
        //to hold covid-19 info.
        this.SpecialHours = "";
        this.SpecialDays = "";
        this.SpecialNotes = "";
        this._setIcon();
    }

    _setIcon() {
        if (this.Category == "Meal Sites")  {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Restaurant);
        }
        else if (this.Category == "Food Pantry") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Grocery);
        }
        else if (this.Category == "Shelter") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Home);
        }
        else if (this.Category == "Youth Programs") {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.DayCare);
        }
        else {
            this.IconUrl = MarkerIcon.getPath(MarkerIcon.Star);
        }
    }
}