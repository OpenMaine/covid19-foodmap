/**
 * Dependencies
 *  - core/mappingCore
 *  - services/pantryDataService
 */
class HomeController {
    constructor() {
        this._townZipSelectId = "town-zip-input";
        this._dataService = new PantryDataService();
        this._categoryParams = [];

        this._setMobileNavHandler();
        this._setSelect2Inputs();
        this._initStepper();

        $("#radius-select").val(20); 
    }

    _initStepper() {
        const options = {
            linear: true,
            animation: true,
            selectors: {
                steps: '.step',
                trigger: '.step-trigger',
                stepper: '.bs-stepper'
            }
        };

        this.stepper = new Stepper($('.bs-stepper')[0], options);

        $("#step-1-button").on("click", () => {
            this._gotoNextStep(1);
        });

        $("#step-2-form").on("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this._gotoNextStep(2);

            const selectedCategory = $('input[name=category-radio]:checked', '#step-2-form').val();
            if (selectedCategory === "pantries") {
                $("#selected-category").text("food pantries and meal sites");
                this.categoryParams =  ["Food Pantry", "Meal Sites"];
            } else if (selectedCategory === "school-meals") {
                $("#selected-category").text("school meal pickup sites");
                this.categoryParams =  ["School Meal Pickup"];
            }
        });

        $("#step-3-form").on("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();

            window.location.href = `map.html${this._buildQueryFilter()}`;
        });
    }

    _gotoNextStep(currentStepNumber) {
        this.stepper.next();
        $(`#step-${currentStepNumber}-icon`).addClass("bg-green");
        $(`#step-${currentStepNumber}-icon`).html('<i class="fas fa-check"></i>');
    }
    
    _getPosition() {
        return new Promise(function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }


    // close the mobile expanded nav when option selected or click outside
    _setMobileNavHandler() {
      const navMain = $(".navbar-collapse");
      navMain.on("click", "a:not([data-toggle])", null, () => navMain.collapse('hide'));
      $("#page-content").click(() => navMain.collapse('hide') );
    }

    _buildQueryFilter() {
        const zipCode = $(`#${this._townZipSelectId}`).val();
        const radius = $("#radius-select").val();
        return "?" + this.categoryParams.map(c => `category=${c}`).join("&") + `&radius=${radius}&zipCode=${zipCode}`;
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