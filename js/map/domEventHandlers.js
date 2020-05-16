/**
 * Dependencies
 *  - core/mappingCore
 *  - core/geocoder
 *  - core/deviceLocationProvider
 */
class DomEventHandlers {
    /**
     * @param mapController: PantryMapController 
     */
    constructor(mapController) {
        this.mapController = mapController;
        
        this._categorySelectId = "category-select";
        this._radiusSelectId = "radius-select";
        this._townZipId = "town-zip-input";
        this._lastWasMobile = null;
    }

    init() {
        this._prevWidth = window.innerHeight;
        this._setNavbar();
        this._resetInputHandlers();
        this._setResizeHandler();
        this._initMapController();
    }

    _initMapController() {
      //callback for after first data fetch completes
      this.mapController.start(() => {
        this.setFilterOptions();
        let filterApplied = false;
        
        const queryParams = Util.getQueryParams();
        
        if (queryParams.zipCode && queryParams.zipCode.length > 0) {
          if ($('#town-zip-input').find("option[value='" + queryParams.zipCode + "']").length) {
              $('#town-zip-input').val(queryParams.zipCode).trigger('change.select2');
          } else { 
              // Create a Option element and pre-select by default
              var newOption = new Option(queryParams.zipCode, queryParams.zipCode, true, true);
              // Trigger a change that won't reload the data.
              $('#town-zip-input').append(newOption).trigger('change.select2');
          } 

          if (queryParams.radius && queryParams.radius.length > 0) {
            $("#radius-select").val(queryParams.radius);
          } else {
            $("#radius-select").val(20);
          }
          $("#zip-search-form").submit();
          filterApplied = true;
        }    
        
        if (queryParams.category && queryParams.category.length > 0) {
          $("#category-select").val(queryParams.category).trigger('change');
          filterApplied = true;
        }
        
        if (!filterApplied) {
          $("#radius-select").val(20);
          $("#category-select").val(Settings.ActiveCategories).trigger('change');
          this.mapController.map.zoomDefault();
        }
      });
    }

    setSelectOptions(domId, optionSet) {
        $(`#${domId}`).empty();
        const blankOption = "<option selected value=''></option>";
        $(`#${domId}`).append(blankOption);
        optionSet.forEach(o => $(`#${domId}`).append(`<option value="${o}">${o}</option>`));
    }

    setFilterOptions() {
        const cityOptions = this.mapController.cityOptions.sort();
        this.setSelectOptions(this._townZipId, cityOptions);

        const categoryOptions = Settings.ActiveCategories.sort();
        this.setSelectOptions(this._categorySelectId, categoryOptions);
        this._resetSelected();
    }

    _setSelect2Inputs() {
        $('#town-zip-input').select2({
            placeholder: "Enter town or zip code", 
            allowClear: true, 
            tags: true,
            dropdownPosition: 'below'
        });

        $('#category-select').select2({placeholder: "Filter categories", minimumResultsForSearch: -1});
        $('#category-select').on('select2:opening select2:closing', function( event ) {
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
        
        setTimeout(()=> {
            //set filter callbacks
            $(`#${this._categorySelectId}`).change((e) => {
                // Use .val() to get the values of a multiselect field (returns array of strings).
                this.mapController.setCategoryFilter($(`#${this._categorySelectId}`).val());
            });

            $("#zip-search-form").submit(e => {
                e.preventDefault();
                let userSearch = $(`#${this._townZipId}`).val();
                const radius = $(`#${this._radiusSelectId}`).val();
                
                if (userSearch && radius && userSearch.length > 0 && radius.length > 0) {
                    let queryString = userSearch;
                    if (!userSearch.toString().trim().match(/^([0-9]{5})(-[0-9]{4})?$/))
                        queryString += ", ME";
                    new Geocoder().geocodeSingleLine(queryString).then(geopoint => {
                        this.mapController.setRadiusFilter(userSearch, geopoint, radius);
                        this._resetSelected();
                    }, () => {});
                }
            });
        }, 250);
        
        this.setFilterOptions();
        $(`#${clearId}`).empty();       
    }

    _resetSelected() {
        $(`#${this._categorySelectId}`).val(this.mapController.getCategoryFilter());
        $(`#${this._radiusSelectId}`).val(this.mapController.getRadiusFilter().radius);
        $(`#${this._townZipId}`).val(this.mapController.getRadiusFilter().zipCode);
    }
}