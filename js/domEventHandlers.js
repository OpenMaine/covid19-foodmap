class DomEventHandlers {
    constructor(pantryMapper) {
        this.pantryMapper = pantryMapper;
    }

    init() {
        this._setNavbar();
        this._setFilters();
        this._prevWidth = window.innerHeight;
        this._setResizeHandler();
    }

    setSelectOptions(domId, optionSet) {
        $(`#${domId}`).empty();
        const blankOption = "<option selected value=''>All</option>";
        $(`#${domId}`).append(blankOption);
        optionSet.forEach(o => $(`#${domId}`).append(`<option value="${o}">${o}</option>`));
    }

    _setResizeHandler() {
        window.onresize = () =>  {
            if (Math.abs(window.innerWidth - this._prevWidth) > 20) {
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
        const targetId = window.innerWidth < 768 ? 'filters-mobile' : 'filters-desktop';
        const clearId = targetId === 'filters-mobile' ? 'filters-desktop' : 'filters-mobile';
        const src = document.getElementById('filters-template').innerHTML;
        const template = Handlebars.compile(src);
        const target = document.getElementById(targetId);
        target.innerHTML = template();

        //filter callbacks
        $("#category-select").change((e) => this.pantryMapper.setCategoryFilter(e.target.value) );
        $("#town-select").change((e) => this.pantryMapper.setTownFilter(e.target.value) );
        $("#county-select").change((e) => {
            const selectedCounty = e.target.value;
            let townOptions = [];
            if (selectedCounty.length > 0) {
                townOptions = [...new Set(this.pantryMapper.data.filter(d => d.County === selectedCounty).map(d => d.Town))].sort();
                if (townOptions.indexOf(this.pantryMapper.townFilter) < 0) {
                    this.pantryMapper.townFilter = "";
                }
            } else {
                townOptions = [...new Set(this.pantryMapper.data.map(d => d.Town))].sort();
            }
        
            this.setSelectOptions("town-select", townOptions);
            this.pantryMapper.setCountyFilter(selectedCounty);
        });

        this.setFilterOptions();
        $(`#${clearId}`).empty();       
    }

    setFilterOptions() {
        const townOptions = [...new Set(this.pantryMapper.data.map(d => d.Town))].sort();
        const countyOptions = [...new Set(this.pantryMapper.data.map(d => d.County))].sort();
        const categoryOptions = [...new Set(this.pantryMapper.data.map(d => d.Category))].sort();
        this.setSelectOptions("town-select", townOptions);
        this.setSelectOptions("county-select", countyOptions);
        this.setSelectOptions("category-select", categoryOptions);
    }
}