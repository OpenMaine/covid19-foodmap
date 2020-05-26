/**
 * Dependencies
 *  - core/mappingCore
 */
class HomeController {
    constructor() {
        this._townZipSelectId = "town-zip-input"
        this._categorySelectId = "category-select";
        this._setCategorySelectOptions(Settings.ActiveCategories);
        this._setMobileNavHandler();
        this._setFormSubmitHandler();
        this._dataService = new PantryDataService();
        this._setSelect2Inputs();
        $("#radius-select").val(10); 
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

        $(`#${this._categorySelectId}`).val(optionSet);
        $(`#${this._categorySelectId}`).trigger('change');
    }

    _buildQueryFilter() {
        const selectedCategories = $(`#${this._categorySelectId}`).val();
        const zipCode = $(`#${this._townZipSelectId}`).val();
        const radius = $("#radius-select").val();
        return "?" + selectedCategories.map(sc => `category=${sc}`).join("&") + `&radius=${radius}&zipCode=${zipCode}`;
    }


    _setSelect2Inputs() {
        $(`#${this._townZipSelectId}`).select2({
            placeholder: "Enter town or zip code", 
            allowClear: true, 
            tags: true,
            dropdownPosition: 'below'
        });

        this._dataService.getCities().then((cities) => {
            $(`#${this._townZipSelectId}`).empty();
            $(`#${this._townZipSelectId}`).append("<option selected value=''></option>");
            cities.forEach(o => $(`#${this._townZipSelectId}`).append(`<option value="${o}">${o}</option>`));
        });
    }
}