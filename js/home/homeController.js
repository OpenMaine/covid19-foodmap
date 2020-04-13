class HomeController {
    
    constructor() {
        this._baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";
        this.categoryOptions = [];  
        this._sheetId = "1besYmYvgpk6ZWrhw8k3ys8OlkDj4s3A1_Y3oromVQBE";
        this._homeSheetName="Home Content";
        this._homeSheetRange = "A:B";
        this._categoriesSheetName = "Categories";
        this._categoriesSheetRange = "A:B";
        this._categorySelectId = "category-select";
        this._getHomeData();
        this._getCategories();
        this._setMobileNavHandler();
        this._setFormSubmitHandler();
        this._setLocateMeHandler();
    }
    
    _getPosition() {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    _setLocateMeHandler() {
        $("#locate-me").click(() => {
            this._getPosition()
              .then(r => {
                new Geocoder().reverseGeocode(new GeoPoint(r.coords.latitude, r.coords.longitude)).then(location => {
                    $("#zip-code").val(location[2]);
                }, () => {});
              }).catch((err) => {});
        });
    }

    _setFormSubmitHandler() {
        $("#search-form").submit((e) => {
            e.preventDefault();
            window.location.href = `map.html${this._buildQueryFilter()}`;
        });
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

    // close the mobile expanded nav when option selected or click outside
    _setMobileNavHandler() {
      const navMain = $(".navbar-collapse");
      navMain.on("click", "a:not([data-toggle])", null, () => navMain.collapse('hide'));
      $("#page-content").click(() => navMain.collapse('hide') );
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

    _buildQueryFilter() {
        const selectedCategories = $(`#${this._categorySelectId}`).val();
        const zipCode = $("#zip-code").val();
        const radius = $("#radius-select").val();
        return "?" + selectedCategories.map(sc => `category=${sc}`).join("&") + `&radius=${radius}&zipCode=${zipCode}`;
    }

}