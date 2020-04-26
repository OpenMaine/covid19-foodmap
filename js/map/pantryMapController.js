/**
 * PantryMapControllers handle data fetching and filter processing for food resources.
 *  
 * Dependent on:
 *  - core/mappingCore 
 *  - core/util
 *  - core/geocoder
 *  - core/pantryDataService
*/
class PantryMapController {
    
    constructor(map) {
        /** service settings */
        const baseUri = "https://sheetsapi.azurewebsites.net/Sheets.php";
        const dataSheetId = "1H9utiRTBZrGreyqSB6oGL1BiVMi7UnM3JOx1HiMWEkc";
        const foodResourceSheetName = "QueryData";
        const foodResourceSheetRange = "A:S";
        const cityOptionsSheetName = "Cities";
        const cityOptionsSheetRange = "A:A";
        
        this.foodResourceUrl = `${baseUri}?sheetId=${dataSheetId}&sheetName=${foodResourceSheetName}&sheetRange=${foodResourceSheetRange}`;
        this.cityOptionsUrl = `${baseUri}?sheetId=${dataSheetId}&sheetName=${cityOptionsSheetName}&sheetRange=${cityOptionsSheetRange}`;
        /** End service settings */
        

        this.data = [];
        this.cityOptions = [];
        this.filteredData = [];
        this.sideBarData =  [];      // Sidebar shows only a portion of results, updated on scroll
        this.filters = [];           // Type mappingCore.Filter
        this.map = map;
        this.dataLoaded = false;
        this._dataService = new PantryDataService();
        this._getData = this._getData.bind(this);
        this._setSidebarScrollListener();
        this._setLegend();
    }

    start(loadCallback) {
        this._dataService.getCities().then((cities) => {
            this.cityOptions = cities;
        }).always(() => {
            this._getData(loadCallback);
        });
    }

    // Filter access methods
    setCategoryFilter(filterArray) {
        this._setFilter(new Filter("Category", filterArray, FilterType.multi));
    }
    getCategoryFilter() {
        const filter = this.filters.find(f => f.field === "Category");
        return filter ? filter.value : [];
    }
    clearCategoryFilter(){
        this.filters = this.filters.filter(f => f.field !== "Category")
    }
    
    setRadiusFilter(zipCode, geopointCenter, radius) {
        this._setFilter(new Filter("Radius", {zipCode: zipCode, geoPoint: geopointCenter, radius: radius}, FilterType.geoPoint));
    }
    getRadiusFilter() {
        const filter = this.filters.find(f => f.field === "Radius");
        return filter ? filter.value : {zipCode: null, geoPoint: null, radius: 10};
    }
    clearRadiusFilter(){
        this.filters = this.filters.filter(f => f.field !== "Radius")
    }



    _getData(successCallback) {
        this._dataService.getFoodResources().then((foodResources) => {
            this.data = foodResources;
            if (this.dataLoaded)
                this._applyFilters();
            else 
                successCallback();     
            
            this.dataLoaded = true;
        });
    }

    _setLegend() {
        let div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<div style="background-color:white;>';
        div.innerHTML += `<img src=${MarkerIcon.getPath(MarkerIcon.Grocery)} alt="Food Pantry"/> &ndash; Food Pantry <br>`;
        div.innerHTML += `<img src=${MarkerIcon.getPath(MarkerIcon.Restaurant)} alt="Meal Site"/> &ndash; Meal Site <br>`;
        div.innerHTML += '</div>'; 
        this.map.addLegend(div);
    }

    _refreshMapAndSideBar() {
        this.map.clearMarkers();
        this._buildMapMarkers(this.filteredData);
        this.sideBarData = this.filteredData.slice(0, 20);
        this._buildSidebarListing(this.sideBarData);
    }

    _setSidebarScrollListener() {
        document.getElementById('map-results-list').onscroll = (e) =>  {;
            const minPassed =  parseInt(e.target.scrollTop/150);
            let end = Math.min(this.filteredData.length, minPassed + 20);
            this.sideBarData = this.filteredData.slice(0, end);
            this._buildSidebarListing(this.sideBarData);
        };
    }

    _applyFilters() {
        this.filteredData = this.data;
        this.filters.filter(f => !Util.isNullOrEmpty(f.value)).forEach(f => {
            if (f.filterType == FilterType.single) {
                this.filteredData = this.filteredData.filter(d => d[f.field].indexOf(f.value) >= 0);
            } else if (f.filterType == FilterType.multi) {
                this.filteredData = this.filteredData.filter(d => f.value.indexOf(d[f.field]) >= 0);
            } else if (f.filterType == FilterType.geoPoint) {
                const radiusInKM = parseInt(f.value.radius)*1.6093;
                this.filteredData = this.filteredData.filter(d => new GeoPoint(d.Latitude, d.Longitude).distanceTo(f.value.geoPoint) <= radiusInKM);
            } else {
                console.error("Invalid filter: ", f);
            }
        });

        this._refreshMapAndSideBar();
    }

    /**
        Set filter value(s) for a field. Removes any existing filters for the field first.
        @param filter: Filter of type mappingCore.Filter to apply
    */ 
    _setFilter(filter) {
        if (!Util.isNullOrEmpty(filter)) {
            this.filters = this.filters.filter(f => f.field !== filter.field);
            this.filters.push(filter);
            this._applyFilters();
            this.map.fitMarkerBounds();
        }
    }

    _buildMapMarkers(foodResourceArray) {
        for (let foodResource of foodResourceArray) {
            if (foodResource.Latitude && foodResource.Longitude) {
                if (this.map.markers[foodResource.Address]) {
                    this.map.addMarkerPopup(foodResource.Address, this._getMarkerPopupHtml(foodResource));
                } else {
                    this.map.addMarker(new GeoPoint(foodResource.Latitude, foodResource.Longitude), foodResource.Address, this._getIcon(foodResource));
                    this.map.addMarkerPopup(foodResource.Address, this._getMarkerPopupHtml(foodResource));
                }
            }
        }
    }

    _getIcon(foodResource) {
        if (foodResource.IconUrl) {
            return L.icon({
                iconUrl: foodResource.IconUrl,
                iconSize:     [32, 37], // size of the icon
                iconAnchor:   [22, 36], // point of the icon which will correspond to marker's location
                popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
            });
        }

        return null;
    }

    _buildSidebarListing(foodResourceArray) {
        let target = document.getElementById('map-results-list');
        let src = document.getElementById('list-result-template').innerHTML;
        let template = Handlebars.compile(src);
        target.innerHTML = template(foodResourceArray);

        this._setSidebarHeader();
        const sidebarHeadingHeight = $("#sidebar-heading").height()+8;
        $("#map-result-spacer").css("height", sidebarHeadingHeight+"px");
        $("#map-results-list").css("height", ($("#map-list-wrapper").height()-sidebarHeadingHeight-12)+"px");
    }

    _setSidebarHeader() {
        const filterBadges = ['<div class="small"><strong>Current filters</strong></div>'];
        for (let filter of this.filters) {
            if (filter.filterType == FilterType.single && !Util.isNullOrEmpty(filter.value)) {
                filterBadges.push(`<span class="badge badge-info">${filter.field}: ${filter.value}</span>`);
            }
            if (filter.filterType == FilterType.multi && !Util.isNullOrEmpty(filter.value)) {
                filter.value.forEach(value => filterBadges.push(`<span class="badge badge-info">${filter.field}: ${value}</span>`));
            }
            if (filter.filterType == FilterType.geoPoint) {
                filterBadges.push(`<span class="badge badge-info">${filter.value.zipCode} (${filter.value.radius}mi)</span>`);
            }
        }

        $("#sidebar-heading").html(filterBadges.join(' '));
    }
    
    _getMarkerPopupHtml(foodResource) {
        let components = [
            `<span style="font-size:1.1rem">${foodResource.Name}</span><br>`,
            `<hr style="margin-top: 0; margin-bottom: 4px;">`,
            `<span><b>Category: </b>${foodResource.Category}</span><br>`,
            `<span><b>Phone: </b><a href="tel:${Util.telFormat(foodResource.Phone)}">${foodResource.Phone}</a></span><br>`,
        ];

        if (!Util.isNullOrEmpty(foodResource.WebLink)) {
            components.push(`<span><b>Website: </b><a href='${foodResource.WebLink}' target='_blank'>${foodResource.WebLink}</a></span><br>`);
        }
        
        if (!Util.isNullOrEmpty(foodResource.WebLink2)) {
            components.push(`<span><b>Website 2: </b><a href='${foodResource.WebLink}' target='_blank'>${foodResource.WebLink}</a></span><br>`);
        }
        
        components.push(`<span><b>Address: </b>${foodResource.Address}</span><br>`);
        
        if (!Util.isNullOrEmpty(foodResource.SpecialHoursOfOperation)) {
            components.push(`<span><b>Covid-19 Hours: </b>${foodResource.SpecialHoursOfOperation}</span><br>`);   
        } else if (!Util.isNullOrEmpty(foodResource.HoursOfOperation)) {
            components.push(`<span><b>Hours: </b>${foodResource.HoursOfOperation}</span><br>`);
        }

        if (!Util.isNullOrEmpty(foodResource.SpecialNotes)) {
            components.push(`<span><b>Covid-19 Notes: </b>${foodResource.SpecialNotes}</span><br>`);   
        }
        
        if (!Util.isNullOrEmpty(foodResource.OperationalNotes)) {
            components.push(`<span><b>Notes: </b>${foodResource.OperationalNotes}</span><br>`);
        }
        
        return components.join("");
    }
}