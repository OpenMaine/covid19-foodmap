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
        this.setCategoryFilter = this.setCategoryFilter.bind(this);
        this._setSidebarScrollListener();
        
        this.categoryFilter = "";
        this.townFilter = "";
        this.countyFilter = "";
    }

    start(loadCallback) {
        this._getData(loadCallback);
        this.refreshInterval = setInterval(() => this._getData(loadCallback), this.intervalDelay); 
    }

    stop() {
        if (this.refreshInterval !== null)
            clearInterval(this.refreshInterval);
    }

    setCategoryFilter(filter) {
        this._setFilter(filter, "categoryFilter");
    }

    setCountyFilter(filter) {
        this._setFilter(filter, "countyFilter");
    }

    setTownFilter(filter) {
        this._setFilter(filter, "townFilter");
    }


    //Begin private methods

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
        this.filteredData = this.data.filter(d => d.Category.indexOf(this.categoryFilter) >= 0 &&
                                                  d.Town.indexOf(this.townFilter) >= 0  &&
                                                  d.County.indexOf(this.countyFilter) >= 0);
        this._refreshMapAndSideBar();
    }

    _setFilter(filter, prop) {
        if (!this.isNullOrWhitespace(filter)) {
            this[prop] = filter;
        } else {
            this[prop] = "";
        }

        this._applyFilters();
        this.map.fitMarkerBounds();
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

    isNullOrWhitespace(str) {
        return str === null || str === undefined || str.trim().length === 0;
    }
}
