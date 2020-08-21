class SheetQueryConfig {
  constructor(sheetId, sheetName, sheetRange) {
    this.sheetId = sheetId;
    this.sheetName = sheetName;
    this.sheetRange = sheetRange;
  }
}


export default class AppSettings {
  static ActiveCategories = ["Food Pantry", "Meal Sites", "School Meal Pickup"];
  static GeocodingServiceUri =  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
  static MapBoxToken = "pk.eyJ1Ijoiam9uamFuZWxsZSIsImEiOiJjazhxbXg0YmswNW5kM2RvNGNjb2hiN2poIn0.LiFKVlPQe_vqyqjjIw0DIw";

  static PantryServiceBaseUri = "https://sheets-api.azurewebsites.net/api/ReadSheet.php";

  //Good Shepherd Food Bank pantry data
  //https://docs.google.com/spreadsheets/d/1wwdNhR7lXu-LnIPb0wl30Vydx0ql_Kp_MGBy5frsVfg/edit?usp=sharing
  static PantryDataQueryConfig = new SheetQueryConfig("1wwdNhR7lXu-LnIPb0wl30Vydx0ql_Kp_MGBy5frsVfg","Agency Data","A:M");

  // School pickup and city options sourced from
  // https://docs.google.com/spreadsheets/d/135l8GGHQ2DSqvTI28_Pgu3HjA2u8fZNqsbPX3_xWbbk/edit#gid=0
  static SchoolPickupQueryConfig = new SheetQueryConfig("135l8GGHQ2DSqvTI28_Pgu3HjA2u8fZNqsbPX3_xWbbk","School Pickup","A:S");

  static CityOptionsQueryConfig = new SheetQueryConfig("135l8GGHQ2DSqvTI28_Pgu3HjA2u8fZNqsbPX3_xWbbk","FormOptions","A:A");

}