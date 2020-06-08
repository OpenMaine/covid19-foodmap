import Filter from '../core/filter.js';
import PantryDataService from '../services/pantryDataService.js';
import GeoPoint from '../core/geoPoint.js';
import DefaultMap from '../core/defaultMap.js';
import PantryInputHandler from './pantryInputHandler.js';
import Util from '../core/util.js';
import MarkerIcon from '../core/markerIcon.js';

export default class PantryMapController {
    /**
     * @param {DefaultMap} map : a DefaultMap instance
     */
    constructor(map) {
        $("#alert-bar").alert();

        this.cityOptions = []; //TODO: move cityOptions to PantryInputHandler
        this.map = map;
        
        this._data = [];
        this._sideBarData =  [];      // Sidebar shows only a portion of results, updated on scroll
        this._filteredData = [];
        this._filters = [];           // Type mappingCore.Filter
        this._dataService = new PantryDataService();
        
        this._setLegend();
        this._setSidebarScrollListener();

        (new PantryInputHandler(this)).init();
    }

    start(loadCallback) {
        // get data for filters
        this._dataService.getCities().then((cities) => {
            this.cityOptions = cities;
            this._getData().then(() => {
                loadCallback();
            });
        });
    }

    /**
     *  Set filter value for a field. Any existing filters for the field are removed first
     *  @param {Filter} filter: Filter to apply
    */ 
   setFilter(filter) {
        if (!Util.isNullOrEmpty(filter)) {
            this._filters = this._filters.filter(f => f.field !== filter.field);
            this._filters.push(filter);
            this.refresh();
        }
    }

    /**
     *   Apply filters (must be valid FilterTypes) and refresh map and list  
     */
    refresh() {
        this._filteredData = this._data;
        this._filters.filter(f => !Util.isNullOrEmpty(f.value)).forEach(f => {
            if (f.filterType == Filter.FilterType.Single) {
                this._filteredData = this._filteredData.filter(d => d[f.field].indexOf(f.value) >= 0);
            } else if (f.filterType == Filter.FilterType.Multi) {
                this._filteredData = this._filteredData.filter(d => f.value.indexOf(d[f.field]) >= 0);
            } else if (f.filterType == Filter.FilterType.GeoPoint) {
                const radiusInKM = parseInt(f.value.radius)*1.6093;
                this._filteredData = this._filteredData.filter(d => new GeoPoint(d.Latitude, d.Longitude).distanceTo(f.value.geoPoint) <= radiusInKM);
            } else {
                console.error("Invalid filter: ", f);
            }
        });

        this._refreshMarkersAndSidebar();
    }


    _refreshMarkersAndSidebar() {
        this.map.clearMarkers();
        this._buildMapMarkers(this._filteredData);
        this._sideBarData = this._filteredData.slice(0, 20);
        this._buildSidebarListing(this._sideBarData);
        this._setResultCount();
        this.map.fitMarkerBounds();
    }


    _getData() {
        const deferred = $.Deferred();

        this._dataService.getPantries().then((foodResources) => {
            this._data = foodResources.filter(fr => fr.IsActive);
            this._dataService.getSchoolPickups().then((schoolPickups) => {
                this._data = [...this._data, ...schoolPickups];
                deferred.resolve();
            }, (err) => deferred.reject());
        }, (err) => deferred.reject());

        return deferred.promise();
    }

    _setLegend() {
        let div = L.DomUtil.create('div', 'legend');
        div.innerHTML += '<div style="background-color:white;>';
        div.innerHTML += `<img src=${MarkerIcon.getPath(MarkerIcon.Grocery)} width="24" height="24" alt="Food Pantry"/> &ndash; Food Pantry <br>`;
        div.innerHTML += `<img src=${MarkerIcon.getPath(MarkerIcon.Restaurant)} width="24" height="24" alt="Meal Site"/> &ndash; Meal Site <br>`;
        div.innerHTML += `<img src=${MarkerIcon.getPath(MarkerIcon.Utensils)} width="24" height="24" alt="School Meal Pickup Site"/> &ndash; School Meal Pickup<br>`;
        div.innerHTML += '</div>'; 
        this.map.addLegend(div);
    }

    _setResultCount() {
        if (this._filteredData.length > 0) {
            $(".zero-results").addClass("hidden");
            $(".result-count-container").removeClass("hidden");
            $(".result-count").html(this._filteredData.length);
        } else {
            $(".result-count-container").addClass("hidden");
            $(".zero-results").removeClass("hidden");
        }
    }

    _setSidebarScrollListener() {
        document.getElementById('map-results-list').onscroll = (e) =>  {;
            const minPassed =  parseInt(e.target.scrollTop/150);
            let end = Math.min(this._filteredData.length, minPassed + 20);
            this._sideBarData = this._filteredData.slice(0, end);
            this._buildSidebarListing(this._sideBarData);
        };
    }

    _buildMapMarkers(foodResourceArray) {
        for (let foodResource of foodResourceArray) {
            if (foodResource.Latitude && foodResource.Longitude) {
                if (this.map.markers[foodResource.Id]) { // If marker already known by map, don't add it again.
                    this.map.addMarkerPopup(foodResource.Id, this._getMarkerPopupHtml(foodResource));
                } else {
                    this.map.addMarker(new GeoPoint(foodResource.Latitude, foodResource.Longitude), foodResource.Id, this._getIcon(foodResource));
                    this.map.addMarkerPopup(foodResource.Id, this._getMarkerPopupHtml(foodResource));
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

        //Zoom to corresponding map pin on list item click
        $(".result-list-item-container").on("click", (e) => {
            if (window.innerWidth > 768) {
                let itemId = '';
                try {
                    const domId = e.currentTarget.getAttribute('id');
                    itemId = domId.split('-')[1];
                    let foodResource = this._filteredData.find(fd => fd.Id === itemId);
                    if (foodResource) {
                        $(".result-list-item-container").removeClass('background-selected');
                        $(`#${domId}`).addClass('background-selected');
                        this.map.setPosition(new GeoPoint(foodResource.Latitude, foodResource.Longitude), 14);
                        this.map.markers[foodResource.Id].openPopup();
                    }
                } catch (err) {
                    console.error("Could not find resource Id on target element.", err)
                }
            }  
        });
    }

    _setSidebarHeader() {
        const filterBadges = ['<div class="small"><strong>Current filters</strong></div>'];
        if (this._appliedFilterCount() > 0) {
            for (let filter of this._filters) {
                if (filter.filterType == Filter.FilterType.Single && !Util.isNullOrEmpty(filter.value)) {
                    filterBadges.push(`<span class="badge badge-info filter-badge">${filter.field}: ${filter.value} <span class="remove-badge material-icons" title="remove filter" value="${filter.field}:${filter.value}">clear</span></span>`);
                } else if (filter.filterType == Filter.FilterType.Multi && !Util.isNullOrEmpty(filter.value)) {
                    filter.value.forEach(value => filterBadges.push(`<span class="badge badge-info filter-badge">${filter.field}: ${value} <span class="remove-badge material-icons" title="remove filter" value="${filter.field}:${value}">clear</span></span>`));
                } else if (filter.filterType == Filter.FilterType.GeoPoint) {
                    filterBadges.push(`<span class="badge badge-info filter-badge">${filter.value.zipCode} (${filter.value.radius}mi) <span class="remove-badge material-icons" title="remove filter" value="Radius">clear</span></span>`);
                }
            }
        } else {
            filterBadges.push("<span class='color-dark'><small>No filters selected.</small></span>");
        } 
        
        $("#sidebar-heading").html(filterBadges.join(''));
        
        $(".remove-badge").on("click", (e) => {
            const value = e.target.getAttribute("value").split(":");
            if (value[0] === "Category") {
                const categoryName = value[1]
                const categoryFilter = this._filters.find(f => f.field === "Category");
                if (categoryFilter) {
                    categoryFilter.value = categoryFilter.value.filter(fv => fv !== categoryName);
                    $('#category-select').val(categoryFilter.value).trigger('change.select2');
                    this.refresh();
                }
            } else if (value[0] === "Radius") {
                const radiusFilter = this._filters.find(f => f.field === "Radius");
                if (radiusFilter) {
                    this._filters = this._filters.filter(f => f.field !== "Radius");
                    $('#town-zip-input').val(null).trigger('change.select2');
                    this.refresh();
                }
            }
        });
    }
    
    _getMarkerPopupHtml(foodResource) {
        let components = [
            `<span style="font-size:1.1rem">${foodResource.Name}</span><br>`,
            `<hr style="margin-top: 0; margin-bottom: 4px;">`,
            `<span><b>Category: </b>${foodResource.Category}</span><br>`
        ];
        
        if (!Util.isNullOrEmpty(foodResource.Phone)) {
            components.push(`<span><b>Phone: </b><a href="tel:${Util.telFormat(foodResource.Phone)}">${foodResource.Phone}</a></span><br>`);
        }

        if (!Util.isNullOrEmpty(foodResource.Email)) {
            components.push(`<span><b>Email: </b><a href="mailto:${foodResource.Email}">${foodResource.Email}</a></span><br>`);
        }
        
        if (!Util.isNullOrEmpty(foodResource.Address)) {
            components.push(`<span><b>Address: </b>${foodResource.Address}</span><br>`);
        }
        
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

        if (!Util.isNullOrEmpty(foodResource.WebLink)) {
            components.push(`<span><b>Website: </b><a href='${foodResource.WebLink}' target='_blank'>${foodResource.WebLink}</a></span><br>`);
        }
        
        if (!Util.isNullOrEmpty(foodResource.WebLink2)) {
            components.push(`<span><b>Website 2: </b><a href='${foodResource.WebLink2}' target='_blank'>${foodResource.WebLink2}</a></span><br>`);
        }
        
        return components.join('');
    }

    _appliedFilterCount() {
        let count = 0;
        for (let filter of this._filters) {
            if (filter.field == "Category") {
                count += filter.value.length
            } else {
                count += 1;
            }
        }
        
        return count;
    }
}