import FoodResource from '../map/foodResource.js';

export default class PantryDataService {
    constructor() {
        this.baseUri = "https://sheetsapi.azurewebsites.net/api/ReadSheet.php";
        
        this.gsfbSheetId = "1wwdNhR7lXu-LnIPb0wl30Vydx0ql_Kp_MGBy5frsVfg";
        this.gsfbSheetName = "Sheet1";
        this.gsfbSheetRange = "A:I";

        this.dataSheetId = "135l8GGHQ2DSqvTI28_Pgu3HjA2u8fZNqsbPX3_xWbbk";
        this.foodResourceSheetName = "Pantries";
        this.foodResourceSheetRange = "A:T";
        this.schoolPickupSheetName = "School Pickup";
        this.schoolPickupSheetRange = "A:S";
        this.cityOptionsSheetName = "FormOptions";
        this.cityOptionsSheetRange = "A:A";

        this.foodResourceUrl = `${this.baseUri}?sheetId=${this.dataSheetId}&sheetName=${this.foodResourceSheetName}&sheetRange=${this.foodResourceSheetRange}`;
        this.schoolPickupUrl = `${this.baseUri}?sheetId=${this.dataSheetId}&sheetName=${this.schoolPickupSheetName}&sheetRange=${this.schoolPickupSheetRange}`;
        this.cityOptionsUrl = `${this.baseUri}?sheetId=${this.dataSheetId}&sheetName=${this.cityOptionsSheetName}&sheetRange=${this.cityOptionsSheetRange}`;
    
        this.gsfbUrl = `${this.baseUri}?sheetId=${this.gsfbSheetId}&sheetName=${this.gsfbSheetName}&sheetRange=${this.gsfbSheetRange}`;
    }

    getCities() {
        const deferred = $.Deferred();
        
        $.get(this.cityOptionsUrl).done((response, status) => {
            const cityOptions = JSON.parse(response).map(data => data.City);
            deferred.resolve(cityOptions);
        }).fail((e) => {
            console.error(e);
            deferred.reject();
        });
        
        return deferred.promise();
    }


    getPantries() {
        const deferred = $.Deferred();

        $.get(this.foodResourceUrl).done((response, status) => {
            const foodResources = JSON.parse(response).map(data => new FoodResource(data, FoodResource.ResourceType.Pantry));
            deferred.resolve(foodResources);
        }).fail((e) => {
            console.error(e);
            deferred.reject();
        });

        return deferred.promise();
    }


    getSchoolPickups() {
        const deferred = $.Deferred();

        $.get(this.schoolPickupUrl).done((response, status) => {
            const foodResources = JSON.parse(response).map(data => new FoodResource(data, FoodResource.ResourceType.School));
            deferred.resolve(foodResources);
        }).fail((e) => {
            console.error(e);
            deferred.reject();
        });

        return deferred.promise();
    }
}