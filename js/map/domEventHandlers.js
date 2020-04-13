/**
 * Dependencies
 *  - core/mappingCore
 *  - core/geocoder
 *  - core/deviceLocationProvider
 */
class DomEventHandlers {
    
    
    /**
     * @param pantryMapper: PantryMapController 
     */
    constructor(pantryMapper) {
        this.pantryMapper = pantryMapper;
        
        this._categorySelectId = "category-select";
        this._countySelectId = "county-select";
        this._townSelectId = "town-select";
        this._radiusSelectId = "radius-select";
        this._zipCodeId = "zipcode-input";
        this._lastWasMobile = null;
    }

    init() {
        this._prevWidth = window.innerHeight;
        this._setNavbar();
        this._resetInputHandlers();
        this._setResizeHandler();
    }

    setSelectOptions(domId, optionSet) {
        $(`#${domId}`).empty();
        const blankOption = "<option selected value=''></option>";
        $(`#${domId}`).append(blankOption);
        optionSet.forEach(o => $(`#${domId}`).append(`<option value="${o}">${o}</option>`));
    }

    setFilterOptions() {
        const townOptions = [...new Set(this.pantryMapper.data.map(d => d.Town))].sort();
        const countyOptions = [...new Set(this.pantryMapper.data.map(d => d.County))].sort();
        const categoryOptions = [...new Set(this.pantryMapper.data.map(d => d.Category))].sort();
        this.setSelectOptions(this._townSelectId, townOptions);
        this.setSelectOptions(this._countySelectId, countyOptions);
        this.setSelectOptions(this._categorySelectId, categoryOptions);
        this._resetSelected();
    }


    _setSelect2Inputs() {
        if (window.innerWidth < 768) {
            $('#county-select').select2({placeholder: "Filter county", allowClear: true, minimumResultsForSearch: -1});
            $('#town-select').select2({placeholder: "Filter town", allowClear: true, minimumResultsForSearch: -1});
        } else {
            $('#county-select').select2({placeholder: "Filter county", allowClear: true});
            $('#town-select').select2({placeholder: "Filter town", allowClear: true});
        }

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

        this._lastWasMobile = isMobile;
    }

    _resetInputHandlers() {
        this._setHomeButtonHandler();
        this._setFilters();
        this._setSelect2Inputs();
        this._setLocateMeHandler();
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
        $("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
            e.stopPropagation();
        });
        // If mobile toggle when press outsite of side menu
        $("#page-content-wrapper").click(function(e) {
            if (window.innerWidth < 768 && !$("#wrapper").hasClass("toggled")) {
                $("#wrapper").toggleClass("toggled");
            }
        });

        $("#filters-toggle").click(function(e) {
            e.preventDefault();
            $("#filters-mobile").toggleClass("toggled");
            e.stopPropagation();
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
                this.pantryMapper.setCategoryFilter($(`#${this._categorySelectId}`).val());
            });
    
            $(`#${this._townSelectId}`).change((e) => {
                this.pantryMapper.clearRadiusFilter();
                this.pantryMapper.setTownFilter(e.target.value);
                this._resetSelected(); 
            });
    
            $(`#${this._countySelectId}`).change((e) => {
                this.pantryMapper.clearRadiusFilter();
                const selectedCounty = e.target.value;
                let townOptions = [];
                if (selectedCounty.length > 0) {
                    townOptions = [...new Set(this.pantryMapper.data.filter(d => d.County === selectedCounty).map(d => d.Town))].sort();
                    if (townOptions.indexOf(this.pantryMapper.townFilter) < 0) {
                        this.pantryMapper.clearTownFilter();
                    }
                } else {
                    townOptions = [...new Set(this.pantryMapper.data.map(d => d.Town))].sort();
                }
                
                this.setSelectOptions(this._townSelectId, townOptions);
                this.pantryMapper.setCountyFilter(selectedCounty);
                this._resetSelected();
            });

            $("#zip-search-form").submit(e => {
                e.preventDefault();
                const zip = $(`#${this._zipCodeId}`).val();
                const radius = $(`#${this._radiusSelectId}`).val();
                if (zip && radius && zip.length > 0 && radius.length > 0) {
                    new Geocoder().getZipcodeGeopoint(zip).then(geopoint => {
                        this.pantryMapper.setRadiusFilter(zip, geopoint, radius);
                        this._resetSelected();
                        $(`#${this._townSelectId}`).trigger('change.select2');
                        $(`#${this._countySelectId}`).trigger('change.select2');
                    }, () => {});
                }
            });
        }, 500);
        
        this.setFilterOptions();
        $(`#${clearId}`).empty();       
    }

    _resetSelected() {
        $(`#${this._categorySelectId}`).val(this.pantryMapper.getCategoryFilter());
        $(`#${this._townSelectId}`).val(this.pantryMapper.getTownFilter());
        $(`#${this._countySelectId}`).val(this.pantryMapper.getCountyFilter());
        $(`#${this._radiusSelectId}`).val(this.pantryMapper.getRadiusFilter().radius);
        $(`#${this._zipCodeId}`).val(this.pantryMapper.getRadiusFilter().zipCode);
    }

    _setLocateMeHandler() {
        $("#locate-me").click(() => {
            new DeviceLocationProvider().getLocation()
              .then(dl => {
                if (dl !== null) {
                    new Geocoder().reverseGeocode(new GeoPoint(dl.latitude, dl.longitude)).then(location => {
                        $(`#${this._zipCodeId}`).val(location[2]);
                    }, () => {});
                }
              }).catch((err) => {});
        });
    }
}