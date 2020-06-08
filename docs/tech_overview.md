This page provides an overview of the tech stack, patterns, and coding coventions used by the Maine Food Map

You can report errors, omissions, and other suggestions for how to improve this document to our [#p-covid19](https://openmaine.slack.com/archives/CVAJG3S8M) Slack channel. 

**Need an invite to the Open Maine Slack?** 
You can [join here](https://join.slack.com/t/openmaine/shared_invite/zt-57d28mv4-j~WPnaNxVq43GDX~3Te4Hg). 

#### Contents
1. [Tech stack and libraries](#tech-stack)
1. [Guiding principles](#guiding-principles)
1. [JavaScript guidelines](#javascript-guidelines)
1. [CSS guidelines](#css-guidelines)
1. [Python scripting guidelines](#python-scripting-guidelines)
1. [Map page design](#map-page-design)
    1. [Map.html](#maphtml)
    1. [PantryMapController](#pantrymapcontroller)
    1. [PantryDataService](#pantrydataservice)
    1. [PantryInputHandler](#pantryinputhandler)
    1. [DefaultMap](#defaultmap)

#### Disclaimer
The current codebase does not yet strictly adhere to these guidelines, but we are working to change this! Also keep in mind that while style and pattern guidelines should be followed to the greatest extent possible there may be specific situations in which exceptions are warranted. If you think you've found an exception, please post to our Slack channel to start a discussion. 

## Tech Stack
* [JQuery3](https://blog.jquery.com/) manages HTML DOM interactions 
* [Leaflet](https://leafletjs.com/) is used for mapping
* [MapBox](https://www.mapbox.com/) and [OpenStreetMap](https://www.openstreetmap.org) are the preferred basemap layer providers
* [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/introduction/) is the primary UI library. Additional UI libraries are used only if equivalent functionality does not exist within Bootstrap.
* [HandlebarsJS](https://handlebarsjs.com/) is used for HTML templating. All helper methods for Handlebars must be placed in extensions/handlebarsHelpers
* [Select2](https://select2.org/) adds autocompletion and improved styling to selection inputs.
* Asynchronous network operations use [JQuery's Deferred API](https://api.jquery.com/jQuery.Deferred/). Conceptually this API is rooted in the pattern of [Promises](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
* [Python 3](https://www.python.org/downloads/) is preferred for general scripting needs. Current uses include data scraping and one-time address geocoding 

## Guiding Principles
1. Use an object-oriented design
1. Simple is better. Don't worry about optimization unless there is an obvious problem
1. Don't repeat yourself. If you're about to copy-and-paste, then you likely need a new function
1. Remember that other people need to read your work
1. Be consistent about style, naming, organizational, and formatting conventions

## JavaScript guidelines
* Variable and file names are camelCased
```javascript
// Correct variable name style
const goodStyle = 1; 

// Incorrect naming styles
const badstyle = 2; 
const bad_style = 3;
const BadStyle2 = 4;
```

* Classes should use PascalCase naming and be declared in a dedicated file in which they are default exported
```javascript
export default class MyClass {
  // class definition goes here.
}
```

* Always use the [ES6 syntax for class declarations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

* Use [JSDoc](https://jsdoc.app/about-getting-started.html) to describe the purpose and parameters of all functions.
```javascript
export default class GeoPoint {
  /**
   * Create a new GeoPoint using a longitude and latitude coordinates
   * @param {number} latitude - the latitude of the geopoint
   * @param {number} longitude - the longitude of the geopoint
   */
  constructor(latitude, longitude) {
      this.latitude = latitude;
      this.longitude = longitude;
  }
}
```
* Use descriptive variable names. An array containing food pantry data would be better named 'foodPantryData' than 'data'. Don't worry about long names - capturing the intent of a variable is the focus.

* Class methods and variables that begin with an underscore (i.e. _setLegend, _dataService) are private and should only be used within their declaring class. Always mark variables and methods as private unless they actually need to be accessed outside of the class. 

* Generally follow the [W3C JavaScript best practices](https://www.w3.org/wiki/JavaScript_best_practices)

## CSS guidelines
* Do not use inline styles. All styles must be in a dedicated stylesheet.
* Each HTML page should have its own stylesheet. The shared stylesheet is only used for styles actively used by multiple HTML pages. 
* CSS values that are applied to multiple selectors should be defined by [custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties). Custom properties are defined in the :root pseudo-element of the stylesheet.
* Classes and identifiers should use lowercase alphanumeric characters. Multi-word names are hyphen-separated.

## Python scripting guidelines
* Python 3 is strongly encouraged
* [Requests](https://requests.readthedocs.io/en/master/) is the preferred HTTP library
* [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) is recommended for basic HTML parsing needs during web scraping. If speed is a concern, or if you'd rather not use BeautifulSoup4, then [lxml](https://lxml.de/) is a powerful html/xml parsing alternative. 
* [Selenium](https://selenium-python.readthedocs.io/) can be used for more complex DOM manipulation needs
* Put all scripts in the project's 'scripts' directory

## Map page design
The following diagram is a high-level overview of the map page. A brief discussion of each component follows
![Map design overview](https://github.com/OpenMaine/covid19-foodmap/blob/master/images/MapHighLevelOverview.PNG)

### Map.html
**Responsibilities:**
1. The page HTML and HandleBars templates
1. Importing CSS and JavaScript files
1. Instantiating a PantryMapController
1. Google tracking initialization

**Things to avoid:**
1. JavaScript beyond instantiating its controller and Google tracking
1. Inline CSS styles  

### PantryMapController
A PantryMapController is the entry point to the program logic.

**Responsibilities:** 
1. Initializing a PantryDataService, PantryInputController, and DefaultMap
1. Providing content for its DefaultMap's legend and map markers
1. Using the PantryDataService to fetch API data
1. Responding to requests from the PantryInputHandler to refresh results after user input
1. Applying filters to the data 

**Things to avoid:**
1. Reacting to DOM events - his is handled by a PantryInputHandler
1. Direct API calls - all HTTP calls should be performed via a PantryDataService

### PantryDataService
**Responsibilities:**
1. Making API calls to retrieve city selection options, food pantry data, and school meal site data
1. Instantiating [FoodResource](https://github.com/OpenMaine/covid19-foodmap/blob/master/js/map/foodResource.js) objects using the results of API calls. 

**Things to avoid:** 
1. Public functions that don't return JQuery Deferred objects
1. Everything except fetching data, mapping it to the desired format, and returning the result

### PantryInputHandler 
**Responsibilities:**
1. Starting the PantryMapController
1. Responding to filter changes and communicating them to its PantryMapController
1. Detecting window resizing and handling the transition between desktop and mobile views
1. Handlers for the buttons on the navigation bar

**Things to avoid:**
1. Data filtering. A PantryInputHandler recieves filter change events, but filter application should happen in the PantryMapController
1. Direct map interactions. The PantryMapController is responsible for this

### DefaultMap
**Responsibilities:**
1. Controlling the behavior of a Leaflet map using a default configuration
1. Adding and removing map markers
1. Adding a legend
1. Controlling the zoom position and magnitude
1. Setting base map options

**Things to avoid:** 
1. Anything that isn't directly related to initializing or updating the state of the map 
1. Application-specific logic. This is intended to be a generic component
 