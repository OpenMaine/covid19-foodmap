class HomeController {
    _baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";

    _sheetId = "1besYmYvgpk6ZWrhw8k3ys8OlkDj4s3A1_Y3oromVQBE";
    _homeSheetName="Home Content";
    _homeSheetRange = "A:B";
    _categoriesSheetName = "Categories";
    _categoriesSheetRange = "A:B";
    categoryOptions = [];

    constructor() {
      this._getHomeData();
      this._getCategories();
    }

    _getHomeData() {
        const homeDataUri = `${this._baseUri}?sheetId=${this._sheetId}&sheetName=${this._homeSheetName}&sheetRange=${this._homeSheetRange}`;
        $.get(homeDataUri).done((response, status) => {
            this.pageData = JSON.parse(response);
            this.pageData.forEach(r => {
                if (r.Field.indexOf("-url") < 0) {
                    $(`#${r.Field}`).html(r.Value);
                } else {

                }
            });           
        });
    }

    _getCategories() {
        const categoriesUri = `${this._baseUri}?sheetId=${this._sheetId}&sheetName=${this._categoriesSheetName}&sheetRange=${this._categoriesSheetRange}`;
        $.get(categoriesUri).done((response, status) => {
            this.categoryOptions = JSON.parse(response).forEach(c => c.Category);
            
        });
    }

}