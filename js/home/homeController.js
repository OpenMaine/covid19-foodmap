class HomeController {
    _baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";

    _sheetId = "1besYmYvgpk6ZWrhw8k3ys8OlkDj4s3A1_Y3oromVQBE";
    _homeSheetName="Home Content";
    _homeSheetRange = "A:B";
    _categoriesSheetName = "Categories";
    _categoriesSheetRange = "A:B";
    categoryOptions = [];

    constructor(categorySelectId) {
      this._categorySelectId = categorySelectId;
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
                    //TODO: Set href attr of field with value
                }
            });           
        });
    }

    _getCategories() {
        const categoriesUri = `${this._baseUri}?sheetId=${this._sheetId}&sheetName=${this._categoriesSheetName}&sheetRange=${this._categoriesSheetRange}`;
        $.get(categoriesUri).done((response, status) => {
            const categoryOptions = JSON.parse(response).map(c => c.Category);
            this._setCategorySelectOptions(categoryOptions);
        });
    }

    _setCategorySelectOptions(optionSet) {
        $(`#${this._categorySelectId}`).empty();
        optionSet.forEach(o => $(`#${this._categorySelectId}`).append(`<option value="${o}">${o}</option>`));
        $(`#${this._categorySelectId}`).select2({placeholder: "Select categories", minimumResultsForSearch: -1});
        $(`#${this._categorySelectId}`).on('select2:opening select2:closing', function( event ) {
          var $searchfield = $( '#'+event.target.id ).parent().find('.select2-search__field');
          $searchfield.prop('disabled', true);
        });
        $(`#${this._categorySelectId}`).val(optionSet);
        $(`#${this._categorySelectId}`).trigger('change');
    }

}