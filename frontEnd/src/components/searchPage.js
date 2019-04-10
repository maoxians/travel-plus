var waypts = [];

function initMap() {

  var myStyles =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: {
            lat: 38.9072,
            lng: -77.0369
        },
        zoom: 13,
        //styles: myStyles


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
    this.bounds = new google.maps.LatLngBounds();

    this.originPlace = null;
    this.destinationPlace = null;
    this.waypointPlace = null;
    this.startMarker = null;
    this.endMarker = null;
    this.waypointMarker = null;
    this.waypointMarkerList = [];
    this.waypointMarkerBounceListener = null;
    this.WaypointMarkerSearchHistory = [];

    this.travelMode = 'WALKING';
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);
    this.placeDetailsService = new google.maps.places.PlacesService(map);

    var me = this;

    // console.log(map.getCenter().toString())

    // me.waypointPlace(map.getCenter());

    var addButton = document.getElementById('add');
    var Pois = document.getElementById('POIs');

    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var waypointsInput = document.getElementById('waypoints-input');
    var modeSelector = document.getElementById('mode-selector');

    var originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(['place_id', 'name', 'geometry', 'icon']);

    var destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput);
    // Specify just the place data fields that you need.
    destinationAutocomplete.setFields(['place_id', 'name', 'geometry', 'icon']);

    var waypointsAutocomplete = new google.maps.places.Autocomplete(waypointsInput);
    waypointsAutocomplete.setFields(['place_id', 'name', 'geometry', 'icon']);

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
        // window.alert('ADD button');
        //window.alert(me.waypointsName);
        var li = document.createElement('li');
        li.textContent = me.waypointPlace.name
        // Pois.innerHTML = me.waypointsName;
        li.setAttribute("id", "wp" + me.waypointPlace.place_id);
        Pois.appendChild(li);
        // save waypts information
        waypts.push({
            location: me.waypointPlace.geometry.location,
            stopover: true
        });
        //
        // if (me.waypointMarker !== null) {
        //   me.waypointMarker.setMap(null);
        //   me.waypointMarker = null;
        // }
        let map = me.map;
        // let image = {
        //   url: "https://www.flaticon.com/authors/prettycons",
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25)
        // }

        me.waypointMarker.setAnimation(null);

        me.waypointMarker = new google.maps.Marker({
          map: map,
          position: me.waypointPlace.geometry.location,
          title: me.waypointPlace.name,
          // icon: image
          label: 'WP',
          placeId: me.waypointPlace.place_id
        });
        me.waypointMarkerList.push(me.waypointMarker);

        me.waypointMarker = null;
        // me.waypointMarker
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
            me.originPlace = place;
            originP.innerHTML = place.name;
            if (me.startMarker !== null) {
              me.startMarker.setMap(null);
            }
            let map = me.map;
            // let image = {
            //   url: "https://www.flaticon.com/authors/prettycons",
            //   size: new google.maps.Size(71, 71),
            //   origin: new google.maps.Point(0, 0),
            //   anchor: new google.maps.Point(17, 34),
            //   scaledSize: new google.maps.Size(25, 25)
            // }


            me.startMarker = new google.maps.Marker({
              map: map,
              position: place.geometry.location,
              title: place.name,
              animation: google.maps.Animation.DROP,
              // icon: image
              label: 'Start',
              placeId: place.place_id
            });
            me.startMarker.addListener('mouseover', function (event) {
              // test for event content
              console.log(event)
              if (me.startMarker.getAnimation() !== null) {
                me.startMarker.setAnimation(null);
              } else {
                me.startMarker.setAnimation(google.maps.Animation.BOUNCE);
              }
            });

        } else if (mode === 'DEST') {
            me.destinationPlace = place
            destinationP.innerHTML = place.name;


            if (me.endMarker !== null) {
              me.endMarker.setMap(null);
            }
            let map = me.map;
            // let image = {
            //   url: "https://www.flaticon.com/authors/prettycons",
            //   size: new google.maps.Size(71, 71),
            //   origin: new google.maps.Point(0, 0),
            //   anchor: new google.maps.Point(17, 34),
            //   scaledSize: new google.maps.Size(25, 25)
            // }


            me.endMarker = new google.maps.Marker({
              map: map,
              position: place.geometry.location,
              title: place.name,
              animation: google.maps.Animation.BOUNCE,
              // icon: image
              label: 'DEST',
              placeId: place.place_id
            });

            me.endMarker.addListener('mouseover', function (event) {
              // test for event content
              // console.log(event)
              if (me.endMarker.getAnimation() !== null) {
                me.endMarker.setAnimation(null);
              } else {
                me.endMarker.setAnimation(google.maps.Animation.BOUNCE);
              }

            });


        } else { // show current selected POI
            // if (me.waypointPlace !== null) { // current way point
            //
            // }
            //me.waypointMarker.setAnimation(null);
            me.waypointPlace = place;
            me.addSingleMarker(me.waypointPlace);


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
    if (!this.originPlace || !this.destinationPlace) {
        window.alert('start or destination not specified ' + status);
        return;
    }
    var me = this;

    this.directionsService.route({
            origin: {'placeId': me.originPlace.place_id},
            destination: {'placeId': me.destinationPlace.place_id},
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
              // remote previous Marker
              me.startMarker.setMap(null);
              me.startMarker = null;
              me.endMarker.setMap(null);
              me.endMarker = null;

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

AutocompleteDirectionsHandler.prototype.addSingleMarker = function (place) {
  let me = this;
  let map = me.map;
  let image = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  }

  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    animation: google.maps.Animation.BOUNCE,
    icon: image,
    placeId: place.place_id
  });



  marker.addListener('click', function() {
      let infowindow = new google.maps.InfoWindow();
      infowindow.setContent(place.name + '\n' + marker.position);
      // current_selected = marker.position;

      infowindow.open(map, this);
  });
  me.WaypointMarkerSearchHistory.push(marker);
  me.waypointMarker = marker;

  marker.addListener('mouseover', function() {
    // test for event content
    // console.log(event)
    marker.setAnimation(null);
  });

  marker.addListener('mouseout', function() {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  });

  marker.addListener('rightclick', function() {
    confirm("Press a button");
  });



  me.bounds.extend(place.geometry.location);
  // map.fitBounds(bounds);
}
