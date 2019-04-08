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
    //var infowindow = new google.maps.InfoWindow();
    //var service = new google.maps.places.PlacesService(map);

    /* info box 
        TODO
    service.getDetails(request, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
                    'Place ID: ' + place.place_id + '<br>' +
                    place.formatted_address + '</div>');
                infowindow.open(map, this);
            });
        }
    });
*/
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
    var me = this;

    var addButton = document.getElementById('add');
    var Pois = document.getElementById('POIs');

    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var waypointsInput = document.getElementById('waypoints-input');
    var modeSelector = document.getElementById('mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id', 'name']);

    var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id', 'name'], );

    var waypointsAutocomplete = new google.maps.places.Autocomplete(waypointsInput);
    waypointsAutocomplete.setFields(['place_id', 'name']);

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


    addButton.addEventListener('click', function () {
        window.alert('ADD button');
        //window.alert(me.waypointsName);
        Pois.innerHTML = me.waypointsName;

        waypts.push({
            location: {
                'placeId': me.waypointsPlaceId
            },
            stopover: true
        })
    });

}

// Sets a listener on a ADD button to add pois.
// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
AutocompleteDirectionsHandler.prototype.setupClickListener = function (
    id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;

    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
    });
};


AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (
    autocomplete, mode) {
    var me = this;
    var submitButton = document.getElementById('submit');
    var originP = document.getElementById('SP');
    var destinationP = document.getElementById('EP');

    autocomplete.bindTo('bounds', this.map);

    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();

        if (!place.place_id) {
            window.alert('Please select an option from the dropdown list.');
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
            originP.innerHTML = place.name;

        } else if (mode === 'DEST') {
            me.destinationPlaceId = place.place_id;
            destinationP.innerHTML = place.name;
        } else {
            me.waypointsPlaceId = place.place_id;
            me.waypointsName = place.name;
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
                var route = response.routes[0];
                var summaryPanel = document.getElementById('directions-panel');
                summaryPanel.innerHTML = '';
                // For each route, display summary information.
                for (var i = 0; i < route.legs.length; i++) {
                    var routeSegment = i + 1;
                    summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                        '</b><br>';
                    summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
                    summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
                    summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
                }
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });

};