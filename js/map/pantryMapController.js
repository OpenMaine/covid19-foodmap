/**
 * PantryMapController is dependent on:
 *  - core/mappingCore 
 *  - core/util
 *  - core/geocoder
*/

class PantryMapController {
    
    constructor(apiEndpoint, map) {
        this.data = [];
        this.filteredData = [];
        this.sideBarData =  [];      // Sidebar shows only a portion of results, updated on scroll
        this.refreshInterval = null; // Store interval created by start()
        this.filters = [];           // Filters are type mappingCore.Filter
        this.apiEndpoint = apiEndpoint;
        this.map = map;
        this.intervalDelay = 100000000; //Auto refresh data every x ms
        this.dataLoaded = false;
        this._getData = this._getData.bind(this);
        this._setSidebarScrollListener();
    }

    start(loadCallback) {
        this._getData(loadCallback);
        this.refreshInterval = setInterval(() => this._getData(loadCallback), this.intervalDelay); 
    }

    stop() {
        if (this.refreshInterval !== null)
            clearInterval(this.refreshInterval);
    }

    // TODO: Abstract this when the next filter is added.
    setCategoryFilter(filterArray) {
        this._setFilter(new Filter("Category", filterArray, FilterType.multi));
    }
    getCategoryFilter() {
        const filter = this.filters.find(f => f.field === "Category");
        return filter ? filter.value : [];
    }
    clearCountyFilter(){
        this.filters = this.filters.filter(f => f.field !== "Category")
    }

    setCountyFilter(filterString) {
        this._setFilter(new Filter("County", filterString, FilterType.single));
    }
    getCountyFilter() {
        const filter = this.filters.find(f => f.field === "County");
        return filter ? filter.value : null;
    }
    clearCountyFilter(){
        this.filters = this.filters.filter(f => f.field !== "County")
    }
    
    setTownFilter(filterString) {
        this._setFilter(new Filter("Town", filterString, FilterType.single));
    }
    getTownFilter() {
        const filter = this.filters.find(f => f.field === "Town");
        return filter ? filter.value : null;
    }
    clearTownFilter(){
        this.filters = this.filters.filter(f => f.field !== "Town")
    }
    
    setRadiusFilter(zipCode, geopointCenter, radius) {
        this.clearTownFilter();
        this.clearCountyFilter();
        this._setFilter(new Filter("Radius", {zipCode: zipCode, geoPoint: geopointCenter, radius: radius}, FilterType.geoPoint));
    }
    getRadiusFilter() {
        const filter = this.filters.find(f => f.field === "Radius");
        return filter ? filter.value : {zipCode: null, geoPoint: null, radius: 10};
    }
    clearRadiusFilter(){
        this.filters = this.filters.filter(f => f.field !== "Radius")
    }

    //Begin private methods

    /*
        Get all food pantry data from spreadsheet
        - Response items projected onto FoodResource objects
    */
    _getData(successCallback) {
        $.get(this.apiEndpoint).done((response, status) => {
            this.data = JSON.parse(response).map(data => new FoodResource(data));
            
            if (this.dataLoaded)
                this._applyFilters();
            else 
                successCallback();     
            
            this.dataLoaded = true;
        });
    }

    _refreshMapAndSideBar() {
        this.map.clearMarkers();
        this._buildMapMarkers(this.filteredData);
        this.sideBarData = this.filteredData.slice(0, 20);
        this._buildSidebarListing(this.sideBarData);
    }

    _setSidebarScrollListener() {
        document.getElementById('map-results-list').onscroll = (e) =>  {;
            const minPassed =  parseInt(e.target.scrollTop/250);
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

    }

    _setSidebarHeader() {
        const filterBadges = ['<div class="small"><strong>Current filters</strong></div>'];
        for (let filter of this.filters) {
            if (filter.filterType == FilterType.single) {
                filterBadges.push(`<span class="badge badge-info">${filter.field}: ${filter.value}</span>`);
            }
            if (filter.filterType == FilterType.multi) {
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
            `<small><b>Category: </b>${foodResource.Category}</small><br>`,
            `<small><b>Phone: </b>${foodResource.Phone}</small><br>`,
        ];

        if (!Util.isNullOrEmpty(foodResource.WebLink)) {
            components.push(`<small><b>Website: </b><a href='${foodResource.WebLink}' target='_blank'>${foodResource.WebLink}</a></small><br>`);
        }
        
        if (!Util.isNullOrEmpty(foodResource.WebLink2)) {
            components.push(`<small><b>Website 2: </b><a href='${foodResource.WebLink}' target='_blank'>${foodResource.WebLink}</a></small><br>`);
        }
        
        components.push(`<small><b>Address: </b>${foodResource.Address}</small><br>`);
        
        if (!Util.isNullOrEmpty(foodResource.SpecialHoursOfOperation)) {
            components.push(`<small><b>Covid-19 Hours: </b>${foodResource.SpecialHoursOfOperation}</small><br>`);   
        } else if (!Util.isNullOrEmpty(foodResource.HoursOfOperation)) {
            components.push(`<small><b>Hours: </b>${foodResource.HoursOfOperation}</small><br>`);
        }

        if (!Util.isNullOrEmpty(foodResource.SpecialNotes)) {
            components.push(`<small><b>Covid-19 Notes: </b>${foodResource.SpecialNotes}</small><br>`);   
        }
        
        if (!Util.isNullOrEmpty(foodResource.OperationalNotes)) {
            components.push(`<small><b>Notes: </b>${foodResource.OperationalNotes}</small><br>`);
        }
        
        return components.join("");
    }
}