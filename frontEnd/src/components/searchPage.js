var waypts = [];
var map;
var nearbyList = [];
var waypointMarkerList = [];

var searchedMarkerList = [];
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

     map = new google.maps.Map(document.getElementById('map'), {
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
    var marker = new google.maps.Marker({
      map: map,
      center: map.getCenter()
    });

    marker.addEventListener
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
    this.waypointPlace = null; // currently selected place
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
    this.geocoder = new google.maps.Geocoder();

    var me = this;

    // console.log(map.getCenter().toString())

    // me.waypointPlace(map.getCenter());

    var addButton = document.getElementById('add');
    var Pois = document.getElementById('POIs');

    Pois.addEventListener("click", function(i){
        if (i.target.className == "btns") {
          if(confirm("are you sure!") === true){
            const li = i.target.parentElement;
            // console.log(i.target.parentElement);
             Pois.removeChild(li);
          }
        }
    });

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
        const li   = document.createElement("li");
        const name   = document.createElement("span");
        const btn   = document.createElement("span");
        name.textContent = me.waypointPlace.name;
        btn.textContent = "Delete";
        // add class name
        name.classList.add("text") ;
        btn.classList.add("btns") ;
        // appends to  dom
        li.appendChild(name);
        li.appendChild(btn);
        // li.textContent = me.waypointPlace.name
        // Pois.innerHTML = me.waypointsName;
        li.setAttribute("id", me.waypointPlace.place_id);
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

        let currentMarker = new google.maps.Marker({
          map: map,
          position: me.waypointPlace.geometry.location,
          title: me.waypointPlace.name,
          // icon: image
          label: 'WP',
          placeId: me.waypointPlace.place_id
        });
        console.log(currentMarker.placeId);
        console.log(currentMarker.label);

        // me.startMarker.addListener('dblclick', function (event) {
        //   console.log(event.latLng.toJSON())
        // });

        currentMarker.addListener("dblclick", function(e) {
          console.log(e);

            if(confirm("are you sure!") === true){
              var latlng = e.latLng.toJSON();
              console.log(latlng);

              me.geocoder.geocode({'location': latlng}, function(results, status) {
                  if (status === 'OK') {
                    if (results[0]) {
                      let placeId = results[0].place_id;
                      let li = document.getElementById(placeId);
                      //https://stackoverflow.com/questions/5181006/javascript-document-removeelementbyid
                      li.parentNode.removeChild(li);
                    } else {
                      window.alert('No results found');
                    }
                  } else {
                    window.alert('Geocoder failed due to: ' + status);
                  }
                });
            }

        });

        me.waypointMarkerList.push(currentMarker);
        me.waypointMarker = currentMarker;

        // me.waypointMarker = null;
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
            // reset start by autocomplete
            me.originPlace = place;
            originP.innerHTML = place.name;
            if (me.startMarker !== null) {
              me.startMarker.setMap(null);
            }
            // 簡化邏輯
            me.addSingleMarkerWithType(place, mode);


        } else if (mode === 'DEST') {
            me.destinationPlace = place
            destinationP.innerHTML = place.name;


            if (me.endMarker !== null) {
              me.endMarker.setMap(null);
            }
            me.addSingleMarkerWithType(place, mode);



        } else { // show current selected POI
            // if (me.waypointPlace !== null) { // current way point
            //
            // }
            //me.waypointMarker.setAnimation(null);
            me.waypointPlace = place;
            me.addSingleMarkerWithType(place, "SEARCHED");


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


// 5 types
// 1. ORIG
//  1.1 start Marker
//  1.2 mouseover BOUNCE
//  1.3 mouseout NONE
//  1.4 click show InfoWindow
//  1.5 rightclick remove start // set start marker null// startPlace null ==>
//
// 2. DEST
// 2.1 end Marker
// 2.2 mouseover BOUNCE
// 2.3 mouseout NON
// 2.4 click show infowindow
// 2.5 rightclick remove end // set end marker null// endPlace null

// 3. NEARBY
//  3.1 image
//  3.2 drop
//  3.3 click infoWindow
//  3.4 rightclick remove start
//  3.5 dblclick set as WAYPOINT
// 4. SEARCHED
//  4.1 image
//  4.2 BOUNCE
//  4.3 click infoWindow
//  4.4 dblclick
// 5. WAYPOINT
//  5.1 waypoint marker
//  5.2 click infoWindow
//  5.3
//  5.4 rightclick set as searched
//  5.5

AutocompleteDirectionsHandler.prototype.addSingleMarkerWithType = function (place, type) {
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
    // animation: google.maps.Animation.BOUNCE,
    // icon: image,
    placeId: place.place_id // 给marker 一个unique identifier
  });
  marker.addListener('click', function() {
      let infowindow = new google.maps.InfoWindow();
      infowindow.setContent(place.name + '\n' + marker.position);
      // current_selected = marker.position;
      infowindow.open(map, this);
  });
  if (type === 'ORIG') {
    // 1.1 or a differnt marker icon
    marker.setLabel('Start');
    // TODO
    // marker.setIcon();
    // 1.2 BOUNCE
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // 1.3 mouseover
    me.addMouseOverListener(marker);
    // 1.4 no need for mouseout
    // 1.5 remove start label
    me.addRightClickListenerRemoveOnOrign(marker, place);
    // 1.0 set new place and new marker
    me.originPlace = place;
    me.startMarker = marker;
  } else if (type === 'DEST') {
    marker.setLabel('End');
    marker.setAnimation(google.maps.Animation.BOUNCE);
    me.addMouseOverListener(marker);
    me.addRightClickListenerRemoveOnDest(marker, place);
    me.destinationPlace = place;
    me.endMarker = marker;
  } else if (type === 'NEARBY') {
    marker.setIcon(image);



  } else if (type === 'SEARCHED') {
    marker.setIcon(image);
    marker.setAnimation(google.maps.Animation.DROP);
    me.addDoubleClickListenerAddOnWaypoints(marker, place);

  } else { // type === 'SELECTED'

  }
  return marker;
}

AutocompleteDirectionsHandler.prototype.addMouseOverListener = function (marker) {
  marker.addListener('mouseover', function () {
    // test for event content
    // console.log(event)
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }
  });
}

AutocompleteDirectionsHandler.prototype.addRightClickListenerRemoveOnOrign = function(marker, place) {
  let me = this;
  let placeId = place.place_id;
  console.log(placeId);
  marker.addListener("rightclick", function(e) {
      if(confirm("Are you sure to delete start point?") === true){
        let originP = document.getElementById('SP');
        originP.innerHTML = "TBD";
        me.startMarker.setMap(null);
        me.startMarker = null;
        me.originPlace = null;
        // routeSegment
        let newSearchedMarker = me.addSingleMarkerWithType(place, "SEARCHED");
        searchedMarkerList.push(newSearchedMarker);
      }
  });
}

AutocompleteDirectionsHandler.prototype.addRightClickListenerRemoveOnDest = function(marker, place) {
  let me = this;
  let placeId = place.place_id;
  console.log(placeId);
  marker.addListener("rightclick", function(e) {
    if(confirm("Are you sure to delete end point?") === true){
      var destinationP = document.getElementById('EP');
      destinationP.innerHTML = "TBD";
      me.endMarker.setMap(null);
      me.endMarker = null;
      //
      let newSearchedMarker = me.addSingleMarkerWithType(place, "SEARCHED");
      // change to me.
      searchedMarkerList.push(newSearchedMarker);
    }
  });
}

AutocompleteDirectionsHandler.prototype.doubleClickSetSearchedIntoWaypoint = function(marker, place) {
  let me = this;
  let placeId = place.place_id;
  console.log(placeId);
  marker.addListener("dblclick", function(e) {
    if(confirm("Are you sure to select it as POI?") === true){
      var Pois = document.getElementById('POIs');
      const li   = document.createElement("li");
      const name   = document.createElement("span");
      const btn   = document.createElement("span");
      name.textContent = me.waypointPlace.name;
      btn.textContent = "Delete";
      // add class name
      name.classList.add("text") ;
      btn.classList.add("btns") ;
      // appends to  dom
      li.appendChild(name);
      li.appendChild(btn);
      // li.textContent = me.waypointPlace.name
      // Pois.innerHTML = me.waypointsName;
      li.setAttribute("id", place.place_id);
      Pois.appendChild(li);
      // save waypts information
      waypts.push({
          location: me.waypointPlace.geometry.location,
          stopover: true
      });
      console.log(this);



      // //
      // let newSearchedMarker = me.addSingleMarkerWithType(place, "WAYPOINT");
      // // change to me.
      // searchedMarkerList.push(newSearchedMarker);
    }
  });

}

AutocompleteDirectionsHandler.prototype.removeMarkerFromSearched = function(marker, place) {


}




// me.originPlace = place;
// originP.innerHTML = place.name;
// if (me.startMarker !== null) {
//   me.startMarker.setMap(null);
// }

//
// marker.addListener("rightclick", function(e) {
//     // console.log(e);
//     if(confirm("Are you sure to delete start point?") === true){
//       var latlng = e.latLng.toJSON();
//       // console.log(latlng);
//
//       me.geocoder.geocode({'location': latlng}, function(results, status) {
//           if (status === 'OK') {
//             if (results[0]) {
//               // 小黑改一下这的逻辑，把start point 改一下
//               // let placeId = results[0].place_id;
//
//               // 顺便看看能不能清空 autocomplete框里面的东西
//
//               // step2 删除这个point，然后重新生成，searched
//
//               addSingleMarkerWithType
//
//
//             } else {
//               window.alert('No results found');
//             }
//           } else {
//             window.alert('Geocoder failed due to: ' + status);
//           }
//         });
//     }
// });
//
//
// function attachPlaceWithMarker(marker, place) {
//   marker.addListener('mouseover', function (event) {
//     // test for event content
//     // console.log(event)
//     if (marker.getAnimation() !== null) {
//       marker.setAnimation(null);
//     } else {
//       marker.setAnimation(google.maps.Animation.BOUNCE);
//     }
//     // console.log(place);
//   });
// }
