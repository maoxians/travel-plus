var waypts = [];

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {
            lat: 38.9072,
            lng: -77.0369
        },
        zoom: 13
    });

    new AutocompleteDirectionsHandler(map);
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var waypointsInput = document.getElementById('waypoints-input');
    var modeSelector = document.getElementById('mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id']);

    var destinationAutocomplete =
        new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id']);

    var waypointsAutocomplete = new google.maps.places.Autocomplete(waypointsInput);
    waypointsAutocomplete.setFields(['place_id']);

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
    this.setupPlaceChangedListener(waypointsAutocomplete, 'WAYPTS')

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);

}

// Sets a listener on a ADD button to add pois.
// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
    id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    var addButton = document.getElementById('add');

    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
    addButton.addEventListener('click', function () {
        //window.alert('ADD button');
        waypts.push({
            location: {
                'placeId': me.waypointsPlaceId
            },
            stopover: true
        })
    });

};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete, mode) {
    var me = this;
    var submitButton = document.getElementById('submit');
    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        if (!place.place_id) {
            window.alert('Please select an option from the dropdown list.');
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else if (mode === 'DEST') {
            me.destinationPlaceId = place.place_id;
        } else {
            me.waypointsPlaceId = place.place_id;
            /*
            window.alert(me.waypointsPlaceId);
            waypts.push({
            location:{'placeId':me.waypointsPlaceId},
            stopover:true
            */
            //window.alert(waypts);
        }
        submitButton.addEventListener('click', function () {
            me.route();
        });
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
            origin: {
                'placeId': this.originPlaceId
            },
            destination: {
                'placeId': this.destinationPlaceId
            },
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
                me.directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
};