class PantryDataService {
    constructor() {
        this.baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";
        this.dataSheetId = "1H9utiRTBZrGreyqSB6oGL1BiVMi7UnM3JOx1HiMWEkc";
        this.foodResourceSheetName = "QueryData";
        this.foodResourceSheetRange = "A:S";
        this.cityOptionsSheetName = "Cities";
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
            deferred.reject();
        });

        return deferred.promise();
    }
}