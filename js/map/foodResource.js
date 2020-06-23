import MarkerIcon from '../core/markerIcon.js';
/**
  Summary data about a food resource
    The mappings need to be updated when the shape of the raw source data changes. 
    This could happen if you change a column header or switch source spreadsheets.
*/
export default class FoodResource {
    /**
     * @param {any[]} resourceData: An array of the raw data from an API call that will be mapped to this FoodResource 
     * @param {FoodResource.ResourceType} resourceType: The type of resource being mapped 
     */
    constructor(resourceData, resourceType) {
        if (resourceType === FoodResource.ResourceType.Pantry)
            this._pantryMapping(resourceData);
        else if (resourceType === FoodResource.ResourceType.School)
            this._schoolPickupMapping(resourceData);
        
        this._setIcon();
    }

    static ResourceType = {
        Pantry: 0,
        School: 1
    }

    /**
     * @param {any[]} resourceData : Raw data from the GSFB food pantry spreadsheet
     */
    _pantryMapping(resourceData) {
        this.Id = this._generateId();
        this.Category = resourceData.Category;
        this.Name = resourceData.Name;
        this.County = resourceData.County;
        this.Town = resourceData.Town;
        this.Address = resourceData.Address;
        this.Phone = resourceData.Phone;
        this.Email = null;
        this.LastUpdated = resourceData.DateUpdated
        this.HoursOfOperation = resourceData.HoursOfOperationOldFromExistingData;
        this.OperationalNotes = resourceData.OperationalNotesFromWebExistingData;
        this.WebLink = resourceData.WebLink;
        this.WebLink2 = resourceData.AdditionalWebLink;
        this.Latitude = parseFloat(resourceData.Latitude);
        this.Longitude = parseFloat(resourceData.Longitude);
        this.SpecialHoursOfOperation = null;
        this.SpecialNotes = null;
        this.IsActive = true;
    }

    /**
     * 
     * @param {any[]} resourceData: Raw data from the school meal pickup spreadsheet
     */
    _schoolPickupMapping(resourceData) {
        this.Id = this._generateId();
        this.Category = resourceData.Category;
        this.Name = resourceData.ProviderName;
        this.County = resourceData.County;
        this.Town = null;
        this.Address = resourceData.Address;
        this.Phone = resourceData.Phone;
        this.Email = resourceData.Email;
        this.LastUpdated = null;
        this.HoursOfOperation = resourceData.Hours;
        this.OperationalNotes = resourceData.OperationalNotes;
        this.WebLink = resourceData.Website1;
        this.WebLink2 = resourceData.Website2;
        this.Latitude = parseFloat(resourceData.Latitude);
        this.Longitude = parseFloat(resourceData.Longitude);
        this.SpecialHoursOfOperation = null;
        this.SpecialNotes = null;
        this.IsActive = true;
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

    /**
     * Generate a 'random' 12-digit hex string
     */
    _generateId() {
        return 'xxxxxxxxxxxx'.replace(/[x]/g, function(c) {
          const hexId = Math.random() * 16 | 0;
          return hexId.toString(16);
        });
    }
      

    
}