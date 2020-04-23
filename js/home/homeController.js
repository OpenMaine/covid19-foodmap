class HomeController {
    
    constructor() {
        this._baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";
        this.categoryOptions = [];  
        this._sheetId = "1H9utiRTBZrGreyqSB6oGL1BiVMi7UnM3JOx1HiMWEkc";
        this._categoriesSheetName = "Categories";
        this._categoriesSheetRange = "A:A";
        this._categorySelectId = "category-select";
        this._getCategories();
        this._setMobileNavHandler();
        this._setFormSubmitHandler();
    }
    
    _getPosition() {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    _setFormSubmitHandler() {
        $("#search-form").submit((e) => {
            e.preventDefault();
            window.location.href = `map.html${this._buildQueryFilter()}`;
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
        
        //Turn off the autocomplete text field.
        $(`#${this._categorySelectId}`).on('select2:opening select2:closing', function( event ) {
          var $searchfield = $( '#'+event.target.id ).parent().find('.select2-search__field');
          $searchfield.prop('disabled', true);
        });

        $(`#${this._categorySelectId}`).val(["Food Pantry", "Meal Sites"]);
        $(`#${this._categorySelectId}`).trigger('change');
    }

    _buildQueryFilter() {
        const selectedCategories = $(`#${this._categorySelectId}`).val();
        const zipCode = $("#zip-code").val();
        const radius = $("#radius-select").val();
        return "?" + selectedCategories.map(sc => `category=${sc}`).join("&") + `&radius=${radius}&zipCode=${zipCode}`;
    }

}