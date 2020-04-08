//mappingCore must be imported before this class.
class PantryMapper {
    constructor(apiEndpoint, map) {
        this.apiEndpoint = apiEndpoint;
        this.map = map;
        this.refreshInterval = null;
        this.intervalDelay = 1200000; //Refresh data every x ms
        this.data = [];
        this.filteredData = [];
        this.sideBarData =  []; //Sidebar shows only a portion of results, updated on scroll
        this._getData = this._getData.bind(this);
        //this.setCategoryFilter = this.setCategoryFilter.bind(this);
        this._setSidebarScrollListener();
        
        // Filters are type mappingCore.Filter
        this.filters = [];
    }

    start(loadCallback) {
        this._getData(loadCallback);
        this.refreshInterval = setInterval(() => this._getData(loadCallback), this.intervalDelay); 
    }

    stop() {
        if (this.refreshInterval !== null)
            clearInterval(this.refreshInterval);
    }


    setCategoryFilter(filterArray) {
        this._setFilter(new Filter("Category", filterArray, FilterType.multi));
    }
    getTownFilter() {
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
        return filter ? filter.value : "";
    }
    clearCountyFilter(){
        this.filters = this.filters.filter(f => f.field !== "County")
    }

    setTownFilter(filterString) {
        this._setFilter(new Filter("Town", filterString, FilterType.single));
    }
    getTownFilter() {
        const filter = this.filters.find(f => f.field === "Town");
        return filter ? filter.value : "";
    }
    clearTownFilter(){
        this.filters = this.filters.filter(f => f.field !== "Town")
    }

    //Begin private methods

    /*
        Get all food pantry data from spreadsheet
        - Sets this.data to an array of objects with fields:
            Category, Name, County, Town, Address, Phone, HoursOfOperation, OperationalNotes, 
            WebLink, AdditionalWebLink, Latitude, Longitude
    */
    _getData(successCallback) {
        $.get(this.apiEndpoint).done((response, status) => {
            const markerInfoData = JSON.parse(response);
            for (let markerInfo of markerInfoData) {
                if (markerInfo.Category == "Meal Sites")  {
                    markerInfo.Icon = "fastfood";
                    markerInfo.MarkerIcon = MarkerIcon.Restaurant;
                }
                else if (markerInfo.Category == "Food Pantry") {
                    markerInfo.Icon = "store";
                    markerInfo.MarkerIcon = MarkerIcon.Grocery;
                }
                else if (markerInfo.Category == "Shelter") {
                    markerInfo.Icon = "home";
                    markerInfo.MarkerIcon = MarkerIcon.Home;
                }
                else if (markerInfo.Category == "Youth Programs") {
                    markerInfo.Icon = "child_care";
                    markerInfo.MarkerIcon = MarkerIcon.DayCare;
                }
                else {
                    markerInfo.Icon = "category";
                    markerInfo.MarkerIcon = MarkerIcon.Star;
                }
            }      

            this.data = markerInfoData;
            this._applyFilters();
            successCallback();
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
            const minPassed =  parseInt(e.target.scrollTop/90);
            let end = Math.min(this.filteredData.length, minPassed + 20);
            this.sideBarData = this.filteredData.slice(0, end);
            this._buildSidebarListing(this.sideBarData);
        };
    }

    _applyFilters() {
        this.filteredData = this.data;
        this.filters.filter(f => !this.isNullOrEmpty(f.value)).forEach(f => {
            if (f.filterType == FilterType.single) {
                this.filteredData = this.filteredData.filter(d => d[f.field].indexOf(f.value) >= 0);
            } else if (f.filterType == FilterType.multi) {
                this.filteredData = this.filteredData.filter(d => f.value.indexOf(d[f.field]) >= 0);
            } else {
                console.error("Invalid filter: ", f);
            }
        });

        this._refreshMapAndSideBar();
    }

    /*
        Set filter value(s) for a field. Removes any existing filters for the field first.
        @param filter: Oject of type mappingCore.Filter
    */ 
    _setFilter(filter) {
        if (!this.isNullOrEmpty(filter)) {
            this.filters = this.filters.filter(f => f.field !== filter.field);
            this.filters.push(filter);
            this._applyFilters();
            this.map.fitMarkerBounds();
        }
    }
    

    _buildMapMarkers(pantryInfoArray) {
        for (let entry of pantryInfoArray) {
            if (entry.Latitude && entry.Longitude) {
                if (this.map.markers[entry.Address]) {
                    this.map.addMarkerPopup(entry.Address, this._getMarkerPopupHtml(entry));
                } else {
                    this.map.addMarker(new GeoPoint(entry.Latitude, entry.Longitude), entry.Address, this._getIcon(entry));
                    this.map.addMarkerPopup(entry.Address, this._getMarkerPopupHtml(entry));
                }
            }
        }
    }

    _getIcon(pantryInfo) {
        if (pantryInfo.MarkerIcon) {
            return L.icon({
                iconUrl: MarkerIcon.getPath(pantryInfo.MarkerIcon),
                iconSize:     [32, 37], // size of the icon
                iconAnchor:   [22, 36], // point of the icon which will correspond to marker's location
                popupAnchor:  [-3, -36] // point from which the popup should open relative to the iconAnchor
            });
        }

        return null;
    }

    _buildSidebarListing(pantryInfoArray) {
        let target = document.getElementById('map-results-list');
        let src = document.getElementById('pin-list-template').innerHTML;
        let template = Handlebars.compile(src);
        target.innerHTML = template(pantryInfoArray);
    }
    
    _getMarkerPopupHtml(pantryInfo) {
        return `<span style="font-size:1.1rem">${pantryInfo.Name}</span><br>
        <hr style="margin-top: 0; margin-bottom: 4px;">
        <small><b>Category: </b>${pantryInfo.Category}</small><br>
        <small><b>Phone: </b>${pantryInfo.Phone}</small><br>
        <small><b>Website: </b><a href='${pantryInfo.WebLink}' target='_blank'>${pantryInfo.WebLink}</a></small><br>
        <small><b>Address: </b>${pantryInfo.Address}</small><br>
        <small><b>Hours: </b>${pantryInfo.HoursOfOperation}</small>`;
    }

    isNullOrEmpty(value) {
        if (value === null || value === undefined)
            return true;
        if (value.constructor.name === "String")
            return value.trim().length === 0;
        if (value.constructor.name === "Array")
            return value.length === 0;
        return false;
    }
}
