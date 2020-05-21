class PantryDataService {
    constructor() {
        this.baseUri = "https://sheetsapi.azurewebsites.net/api/ReadSheet.php";
        //this.baseUri = "http://localhost:80/api/ReadSheet.php";
        
        this.dataSheetId = "135l8GGHQ2DSqvTI28_Pgu3HjA2u8fZNqsbPX3_xWbbk";
        this.foodResourceSheetName = "Pantries";
        this.foodResourceSheetRange = "A:T";
        this.cityOptionsSheetName = "FormOptions";
        this.cityOptionsSheetRange = "A:A";

        this.foodResourceUrl = `${this.baseUri}?sheetId=${this.dataSheetId}&sheetName=${this.foodResourceSheetName}&sheetRange=${this.foodResourceSheetRange}`;
        this.cityOptionsUrl = `${this.baseUri}?sheetId=${this.dataSheetId}&sheetName=${this.cityOptionsSheetName}&sheetRange=${this.cityOptionsSheetRange}`;
    }

    getCities() {
        const deferred = $.Deferred();
        
        $.get(this.cityOptionsUrl).done((response, status) => {
            let cityOptions = JSON.parse(response).map(data => data.City);
            deferred.resolve(cityOptions);
        }).fail((e) => {
            console.error(e);
            deferred.reject();
        });
        
        return deferred.promise();
    }

    getFoodResources() {
        const deferred = $.Deferred();

        $.get(this.foodResourceUrl).done((response, status) => {
            let foodResources = JSON.parse(response).map(data => new FoodResource(data));
            deferred.resolve(foodResources);
        }).fail((e) => {
            console.error(e);
            deferred.reject();
        });

        return deferred.promise();
    }
}