import FoodResource from '../map/foodResource.js';
import AppSettings from '../settings/appSettings.js';

export default class PantryDataService {
    constructor() {
        this.foodResourceUrl = `${AppSettings.PantryServiceBaseUri}?sheetId=${AppSettings.PantryDataQueryConfig.sheetId}&sheetName=${AppSettings.PantryDataQueryConfig.sheetName}&sheetRange=${AppSettings.PantryDataQueryConfig.sheetRange}`;
        this.schoolPickupUrl = `${AppSettings.PantryServiceBaseUri}?sheetId=${AppSettings.SchoolPickupQueryConfig.sheetId}&sheetName=${AppSettings.SchoolPickupQueryConfig.sheetName}&sheetRange=${AppSettings.SchoolPickupQueryConfig.sheetRange}`;
        this.cityOptionsUrl = `${AppSettings.PantryServiceBaseUri}?sheetId=${AppSettings.CityOptionsQueryConfig.sheetId}&sheetName=${AppSettings.CityOptionsQueryConfig.sheetName}&sheetRange=${AppSettings.CityOptionsQueryConfig.sheetRange}`;
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