import AppSettings from '../settings/appSettings.js';
import Filter from '../core/filter.js';
import Geocoder from '../core/geocoder.js';
import PantryMapController from './pantryMapController.js';
import Util from '../core/util.js';
//  extensions/select2Extensions is required 

export default class PantryInputHandler {
    /**
     * @param {PantryMapController} mapController: A PantryMapController instance 
     */
    constructor(mapController) {
        this.mapController = mapController;
        
        this._categorySelectId = "category-select";
        this._radiusSelectId = "radius-select";
        this._townZipId = "town-zip-input";
        
        this._lastWasMobile = null;
        this._prevWidth = null;
    }

    init() {
        this._prevWidth = window.innerHeight;
        this._setNavbar();
        this._resetInputHandlers();
        this._setResizeHandler();
        this._initMapController();
    }

    //Begin initialization callbacks -> called after first data load
    /////////////////////
    _initMapController() {
      $('#loadingModal').modal('show');
      this.mapController.start(() => {
        this.setFilterOptions();

        const queryParams = Util.getQueryParams();
        
        if (queryParams.zipCode && queryParams.zipCode.length > 0) {
          if ($(`#${this._townZipId}`).find("option[value='" + queryParams.zipCode + "']").length) {
              $(`#${this._townZipId}`).val(queryParams.zipCode).trigger('change.select2');
          } else { 
              // Create a Option element and pre-select by default
              var newOption = new Option(queryParams.zipCode, queryParams.zipCode, true, true);
              // Update select without triggering change callback.
              $(`#${this._townZipId}`).append(newOption).trigger('change.select2');
          } 

          if (queryParams.radius && queryParams.radius.length > 0) {
            $(`#${this._radiusSelectId}`).val(queryParams.radius);
          } else {
            $(`#${this._radiusSelectId}`).val(10);
          }

          this._setRadiusFilter().always(() => this._initCategoryFilter(queryParams, true));
        } else {
          this._initCategoryFilter(queryParams, false);
        } 
      });
    }

    _initCategoryFilter(queryParams, filterApplied) {
        if (queryParams.category && queryParams.category.length > 0) {
            $(`#${this._categorySelectId}`).val(queryParams.category).trigger('change.select2');
            filterApplied = true;
        }
          
        if (!filterApplied) {
            $(`#${this._radiusSelectId}`).val(10);
            $(`#${this._categorySelectId}`).val(AppSettings.ActiveCategories).trigger('change.select2');
        }

        this.setCategoryFilter($(`#${this._categorySelectId}`).val());
        this.setFilterOptions();
        setTimeout(() => $('#loadingModal').modal('hide'), 500);  
    }
    /////////////////////
    // End init callbacks

    
    setFilterOptions() {
        const cityOptions = this.mapController.cityOptions.sort();
        this._setSelectOptions(this._townZipId, cityOptions);
        
        const categoryOptions = AppSettings.ActiveCategories.sort();
        this._setSelectOptions(this._categorySelectId, categoryOptions);
        this._resetSelected();
    }


    // Filter access methods
    setCategoryFilter(filterArray) {
        this.mapController.setFilter(new Filter("Category", filterArray, Filter.FilterType.Multi));
    }
    getCategoryFilter() {
        const filter = this.mapController._filters.find(f => f.field === "Category");
        return filter ? filter.value : [];
    }
    clearCategoryFiltertegoryFilter(categoryName) {
        const categoryFilter = this.mapController._filters.find(f => f.field === "Category");
        if (categoryFilter) {
            categoryFilter.value = categoryFilter.value.filter(fv => fv !== categoryName);
            $(`#${this._categorySelectId}`).val(categoryFilter.value).trigger('change.select2');
            this.mapController.refresh();
        }
    }
    
    setRadiusFilter(zipCode, geopointCenter, radius) {
        this.mapController.setFilter(new Filter("Radius", {zipCode: zipCode, geoPoint: geopointCenter, radius: radius}, Filter.FilterType.GeoPoint));
    }
    getRadiusFilter() {
        const filter = this.mapController._filters.find(f => f.field === "Radius");
        return filter ? filter.value : {zipCode: null, geoPoint: null, radius: 10};
    }
    clearRadiusFilter() {
        const radiusFilter = this.mapController._filters.find(f => f.field === "Radius");
        if (radiusFilter) {
            this.mapController._filters = this.mapController._filters.filter(f => f.field !== "Radius");
            $(`#${this._townZipId}`).val(null).trigger('change.select2');
            this.mapController.refresh();
        }
    }
    //end filter access methods
    
    _setSelectOptions(domId, optionSet) {
        $(`#${domId}`).empty();
        const blankOption = "<option selected value=''></option>";
        $(`#${domId}`).append(blankOption);
        optionSet.forEach(o => $(`#${domId}`).append(`<option value="${o}">${o}</option>`));
    }

    _setSelect2Inputs() {
        $(`#${this._townZipId}`).select2({
            placeholder: "Enter town or zip code", 
            allowClear: true, 
            tags: true,
            dropdownPosition: 'below'
        });

        $(`#${this._categorySelectId}`).select2({placeholder: "Filter categories", minimumResultsForSearch: -1});
        $(`#${this._categorySelectId}`).on('select2:opening select2:closing', function( event ) {
            var $searchfield = $( '#'+event.target.id ).parent().find('.select2-search__field');
            $searchfield.prop('disabled', true);
        });
    }

    //Reset filters after switch to/from mobile 
    _setResizeHandler() {
        window.onresize = () =>  {
            if (Math.abs(window.innerWidth - this._prevWidth) > 15) {
                this._setNavbar(); 
                this._resetInputHandlers();
            }
            this._prevWidth = window.innerWidth;
        };
    }

    _setNavbar() {
        const isMobile = window.innerWidth < 768;

        if (this._lastWasMobile === null || isMobile !== this._lastWasMobile) {
            const targetId = isMobile ? 'nav-mobile' : 'nav-desktop';
            const clearId = targetId === 'nav-mobile' ? 'nav-desktop' : 'nav-mobile';
            const src = document.getElementById('navbar-template').innerHTML;
            const template = Handlebars.compile(src);
            const target = document.getElementById(targetId);
            target.innerHTML = template();
            $(`#${clearId}`).empty(); 
            this._setSidebarHandlers();
        }

        setTimeout(() => {
            if (isMobile) {
                let topHeight = $("#top-card").height();
                let navHeight = $('#nav-mobile').height();
                $("#main-map").css("min-height", `${window.innerHeight-topHeight-navHeight-20}px`);
            } else {
                $("#main-map").css("min-height", "70vh");
            }
        }, 300);
            
        this._lastWasMobile = isMobile;
    }

    _resetInputHandlers() {
        this._setHomeButtonHandler();
        this._setFilters();
        this._setSelect2Inputs();
    }

    _setHomeButtonHandler() {
        $("#home-button").click((e) => {
            e.preventDefault();
            let userChoice = confirm("Return to homepage?");
            if (userChoice)
                window.location.href='index.html'
        });
    }

    _setSidebarHandlers() {
        $("#list-toggle").click(function(e) {
            e.preventDefault();
            $(".sidebar-toggleable").toggleClass("toggled");
            e.stopPropagation();
        });

        $("#filters-toggle").click(function(e) {
            e.preventDefault();
            $("#filters-mobile").toggleClass("toggled");
            e.stopPropagation();
        });
        
        $(".main-content, #sidebar-wrapper").click(function(e) {
            if (window.innerWidth < 768 && !$("#filters-mobile").hasClass("toggled")) {
                $("#filters-mobile").toggleClass("toggled");
            }
        });
    }

    _setFilters() {
        //build filters html from handlebars template
        const targetId = window.innerWidth < 768 ? 'filters-mobile' : 'filters-desktop';
        const clearId = targetId === 'filters-mobile' ? 'filters-desktop' : 'filters-mobile';
        const src = document.getElementById('filters-template').innerHTML;
        const template = Handlebars.compile(src);
        const target = document.getElementById(targetId);
        target.innerHTML = template();
         
        //set filter callbacks
        $(`#${this._categorySelectId}`).change((e) => {
            // Use .val() to get the values of a multiselect field (returns array of strings).
            this.setCategoryFilter($(`#${this._categorySelectId}`).val());
        });

        $("#zip-search-form").submit(e => {
            e.preventDefault();
            this._setRadiusFilter();
        });
    
        this.setFilterOptions();
        $(`#${clearId}`).empty();       
    }

    _setRadiusFilter() {
        const deferred = $.Deferred();

        let townZipSearch = $(`#${this._townZipId}`).val();
        const radius = $(`#${this._radiusSelectId}`).val();
        
        if (townZipSearch && radius && townZipSearch.length > 0 && radius.length > 0) {
            let queryString = townZipSearch;
            if (!townZipSearch.toString().trim().match(/^([0-9]{5})(-[0-9]{4})?$/))
                queryString += ", ME";
            
            new Geocoder().geocodeSingleLine(queryString).then(geopoint => {
                this.setRadiusFilter(townZipSearch, geopoint, radius);
                this._resetSelected();
                deferred.resolve();
            }, (err) => deferred.reject());
        } else {
            deferred.resolve();
        }

        return deferred.promise();
    }

    _resetSelected() {
        $(`#${this._categorySelectId}`).val(this.getCategoryFilter());
        $(`#${this._radiusSelectId}`).val(this.getRadiusFilter().radius);
        $(`#${this._townZipId}`).val(this.getRadiusFilter().zipCode);
    }
}