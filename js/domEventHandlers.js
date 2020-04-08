class DomEventHandlers {
    constructor(pantryMapper) {
        this._categorySelectId = "category-select";
        this._countySelectId = "county-select";
        this._townSelectId = "town-select";
        this.pantryMapper = pantryMapper;
    }

    init() {
        this._prevWidth = window.innerHeight;
        this._setNavbar();
        this._setFilters();
        this._setResizeHandler();
    }

    setSelectOptions(domId, optionSet) {
        $(`#${domId}`).empty();
        const blankOption = "<option selected value=''></option>";
        $(`#${domId}`).append(blankOption);
        optionSet.forEach(o => $(`#${domId}`).append(`<option value="${o}">${o}</option>`));
    }

    //Reset filters after switch to/from mobile 
    _setResizeHandler() {
        window.onresize = () =>  {
            if ((window.innerWidth < 768 && this._prevWidth >= 768) || 
                (window.innerWidth >= 768 && this._prevWidth < 768)) {
                this._setNavbar(); 
                this._setFilters();
            }
            this._prevWidth = window.innerWidth;
        };
    }

    _setNavbar() {
        const targetId = window.innerWidth < 768 ? 'nav-mobile' : 'nav-desktop';
        const clearId = targetId === 'nav-mobile' ? 'nav-desktop' : 'nav-mobile';
        const src = document.getElementById('navbar-template').innerHTML;
        const template = Handlebars.compile(src);
        const target = document.getElementById(targetId);
        target.innerHTML = template();
        this._setSidebarHandlers();
        $(`#${clearId}`).empty(); 
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

        //set filter callbacks
        $(`#${this._categorySelectId}`).change((e) => {
            // Use .val() to get the values of a multiselect field.
            this.pantryMapper.setCategoryFilter($(`#${this._categorySelectId}`).val());
        });

        $(`#${this._townSelectId}`).change((e) => {
            this.pantryMapper.setTownFilter(e.target.value) 
        });

        $(`#${this._countySelectId}`).change((e) => {
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

        $(`#${clearId}`).empty();       
        this.setFilterOptions();
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

    _resetSelected() {
        $(`#${this._categorySelectId} option`).removeAttr("selected");
        $(`#${this._townSelectId} option`).removeAttr("selected");
        $(`#${this._countySelectId} option`).removeAttr("selected");
        $(`#${this._categorySelectId} option[value='${this.pantryMapper.categoryFilter}']`).attr("selected","selected");
        $(`#${this._townSelectId} option[value='${this.pantryMapper.getTownFilter()}']`).attr("selected","selected");
        $(`#${this._countySelectId} option[value='${this.pantryMapper.countyFilter}']`).attr("selected","selected");
    }
}