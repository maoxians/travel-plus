// 數據結構
var markerMap = new Map();
var categoryMap = new Map();

const CATEGORY = ["ORIG", "DEST", "SEARCHED", "POI", "NBAPARK", "NBAQUARIUM", "NBARTGALLERY", "NBMUSEUM", "NBPARK", "NBZOO"];
for (let cat of CATEGORY) {
  categoryMap.set(cat, new Map());
}
const SEARCH_TYPE = ['amusement_park', 'aquarium', 'art_gallery', 'museum', 'park', 'zoo'];
var typeMap = new Map();
for (let i = 0; i < SEARCH_TYPE.length; i++) {
  typeMap.set(SEARCH_TYPE[i], CATEGORY[i + 4]);
}

var waypts = [];
var map;
var nearbyMarkerList = [];
var waypointMarkerList = [];
// var waypointMarkerList = [];
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
    // var marker = new google.maps.Marker({
    //   map: map,
    //   position: map.getCenter(),
    //   title: "hello world"
    // });

    new AutocompleteDirectionsHandler(map);
}

/**
 * @constructor
 */
function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.bounds = new google.maps.LatLngBounds();

    this.originPlace = null;
    this.startMarker = null;
    this.destinationPlace = null;
    this.endMarker = null;
    this.waypointPlace = null; // currently selected place
    this.waypointMarker = null;
    // this.waypointMarkerList = [];
    this.waypointMarkerBounceListener = null;
    this.WaypointMarkerSearchHistory = [];
    this.infoWindow = null;

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
             // // TODO:
             let id = i.target.parentElement.id;
             console.log(id);
             let marker = markerMap.get(id);
             me.switchMarkerType(marker, marker.prevType);
          }
        }
    });

    var nearbyFilter = document.querySelectorAll(".filter");
    console.log(nearbyFilter);
    nearbyFilter.forEach(function(item) {
      item.addEventListener('change', function() {
        if (this.checked) {
          console.log('check');
          me.nearbyWithType(this.value);
          me.mapSizeShowInfo();
        } else {
          console.log('uncheck');
          me.clearMarkerWithType(this.value);
          me.mapSizeShowInfo();
        }
      });
    });

    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var waypointsInput = document.getElementById('waypoints-input');
    var modeSelector = document.getElementById('mode-selector');
    var locationFilter = document.getElementById('location-filter');

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
    this.setupPlaceChangedListener(waypointsAutocomplete, 'SEARCHED')

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(
        destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
    this.map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(locationFilter);


    addButton.addEventListener('click', function () {
      console.log("TEST: add POI on add Button");
      // console.log(me.waypointMarker);
      console.log("這裏有一個值");
      console.log(me.waypointPlace.place_id);
      me.addSingleMarkerWithType(me.waypointPlace, "POI");
    });
}

AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;

    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
    });
};

AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
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
        console.log("TEST: add " + mode + " on search box" );
        if (mode === "SEARCHED") {
          me.waypointPlace = place;
          // console.log(me.waypointPlace);
          me.waypointPlaceMarker = me.addSingleMarkerWithType(me.waypointPlace, mode);
          // console.log(me.waypointMarker);

        } else { // ORIG DEST
          if (mode === "ORIG") {
            me.startMarker = me.addSingleMarkerWithType(place, mode);
            me.originPlace = place;
          } else {
            me.endMarker = me.addSingleMarkerWithType(place, mode);

            me.destinationPlace = place;
          }
        }
        submitButton.addEventListener('click', function () {
            me.route();
        });
    });
};

AutocompleteDirectionsHandler.prototype.route = function () {
    let me = this;
    if (!this.originPlace || !this.destinationPlace) {
        window.alert('start or destination not specified ' + status);
        return;
    }
    console.log("TEST: show route on map");
    this.directionsService.route({
            origin: {'placeId': me.originPlace.place_id},
            destination: {'placeId': me.destinationPlace.place_id},
            waypoints: me.getwaypts(), // waypts,
            optimizeWaypoints: true,
            travelMode: this.travelMode
        },
        function (response, status) {
            if (status === 'OK') {
              // remote previous Marker
              // me.startMarker.setMap(null);
              // me.startMarker = null;
              // me.endMarker.setMap(null);
              // me.endMarker = null;

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
// ADD LOGIC
// add marker operation
// put a marker on map from two method: 1. text input && 2. nearby filter
// 3. on map marker dblclick switchMarkerType Logic
AutocompleteDirectionsHandler.prototype.addSingleMarkerWithType = function (place, type) {
  let me = this;
  let marker = null;
  console.log(place.place_id);

  if (markerMap.has(place.place_id)) { // 已經存在在地圖上了
    marker = markerMap.get(place.place_id);
    let oldType = marker.type;
    // 排除通過input text和nearby對start，end，poi的更改
    // 1. 新添加進來的marker不會對現有SELECTED marker起作用
    console.log("TEST: switch marker type via marker behavior on " + type);
    console.log(place.place_id);
    if (oldType === "POI" || oldType === "ORIG" || oldType === "DEST") { // 如果是已經選好了的點 SELECTED
      if (type !== "POI" || type !== "ORIG" || type !== "DEST") { // 如果我們嘗試去修改選好了的點
        // searched || 6 nearby
        marker.prevType = type; // 下一次狀態改變的type， 只對SELECTED TYPE 操作
      } else {
        // 只有 POI可以通過input search 改成 ORIG 和 dest
        // 其他的case 都不行，ORIG 和DEST不能通過input add 改成POI
        if (oldType === "POI" && (type === "ORIG" || type === "DEST")) {
          marker = me.switchMarkerType(place, type);

        }
        //
        // case 1. orign, dest ==> poi 這個可以用dbl click實現
        // case 2. poi ==> orign or dest 這個需要兩個狀態來實現 // TODO
        // 其實只要改一下marker的type和相對應的category map update
        // Override selected
      }
    } else { // oldType： SEARCHED and nearby
      marker = me.switchMarkerType(marker, type);
    }
  } else { // 沒有存在在地圖上
    console.log("TEST: add new marker via search box or nearby");
    marker = me.createMarker(place, type);
  }
  return marker;
}
// SWITCH LOGIC
// 已經存在的marker，state的轉變
// 主要是，event listener的操作
// valid operation to change the type of the marker
AutocompleteDirectionsHandler.prototype.switchMarkerType = function (marker, type) {
  console.log("FUNCTION: in switchMarkerType function");
  let me = this;
  let place = marker.placeDetail;
  // console.log(place.place_id);
  // console.log(markerMap.get(place.place_id));
  if (type === marker.type) {
    console.log("did nothing");
    return marker;
  }
  // console.log(marker);
  // console.log(marker.type);


  let prevType = marker.type;
  // console.log("previous type: " + prevType);
  // console.log("current type: " + type);
  marker.type = type;
  // update categoryMap, mutual exclusive
  categoryMap.get(prevType).delete(marker.placeId);

  if (prevType === "ORIG" || prevType === "DEST" || prevType === "POI") { // TODO:  xXXX
    // console.log("A selected point is modified");
    console.log("TEST: switch marker on SELECTED marker " + type);
  } else {
    console.log("TEST: switch marker on UNSELECTED marker " + type);
    marker.prevType = prevType;
  }
  categoryMap.get(type).set(marker.placeId, marker);
  google.maps.event.clearInstanceListeners(marker);
  if (type === "ORIG") {
    me.setOrigMarkerFeature(marker);
  } else if (type === "DEST") {
    me.setDestMarkerFeature(marker);
  } else if (type === "POI") {
    me.setPoiMarkerFeature(marker);
  } else { // SEARCHED， 6 NB type unselected
    me.setUnselectedMarkerFeature(marker);
  }
  // test
  me.mapSizeShowInfo();
  return marker;
}

AutocompleteDirectionsHandler.prototype.createMarker = function (place, type) {
  console.log("FUNCTION: in createMarker function");
  let me = this;
  let map = me.map;
  console.log(place);
  let marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    animation: google.maps.Animation.DROP,
    // icon: image,
    placeId: place.place_id, // 给marker 一个unique identifier
    placeDetail: place,
    type: null,
    prevType : null
  });
  marker.type = type;
  // console.log(marker.type);
  markerMap.set(place.place_id, marker);
  categoryMap.get(type).set(place.place_id, marker);

  if (type === "ORIG") {
    marker.prevType = "SEARCHED";
    me.setOrigMarkerFeature(marker);
  } else if (type === "DEST") {
    marker.prevType = "SEARCHED";
    me.setDestMarkerFeature(marker);
  } else if (type === "POI") {
    marker.prevType = "SEARCHED";
    me.setPoiMarkerFeature(marker);
  } else {
    marker.prevType = type;
    me.setUnselectedMarkerFeature(marker);
  }
  me.bounds.extend(place.geometry.location);
  // me.map.fitBounds(me.bounds);
  // test
  me.mapSizeShowInfo();
  return marker;
}
// marker feature setter function
AutocompleteDirectionsHandler.prototype.setOrigMarkerFeature = function (marker) {
  let me = this;
  let place = marker.placeDetail;
  me.originPlace = place;
  me.startMarker = marker;
  var originP = document.getElementById('SP');
  originP.innerHTML = place.name;

  marker.setIcon(null);
  marker.setLabel('Start');
  me.addClickListenerShowInfo(marker);
  me.addMouseOverListener(marker);
  me.addRClickListnerToRemoveOrig(marker); // DONE
}

AutocompleteDirectionsHandler.prototype.setDestMarkerFeature = function (marker) {
  let me = this;
  let place = marker.placeDetail;
  let destinationP = document.getElementById('EP');
  me.destinationPlace = marker.placeDetail
  destinationP.innerHTML = place.name;
  me.endMarker = marker;

  marker.setIcon(null);
  marker.setLabel('End');
  me.addClickListenerShowInfo(marker);
  me.addMouseOverListener(marker);
  me.addRClickListenerToRemoveDest(marker); // DONE
}

AutocompleteDirectionsHandler.prototype.setPoiMarkerFeature = function (marker) {
  let me = this;
  marker.setIcon(null);
  marker.setLabel('POI');
  me.addClickListenerShowInfo(marker);
  me.addMouseOverListener(marker);
  me.addDblClickToSelectAsDestOrOrig(marker); // DONE
  me.addRClickListenerFromPoiToUnselected(marker);  // DONE
  let place = marker.placeDetail;
  var Pois = document.getElementById('POIs');
  const li   = document.createElement("li");
  const name   = document.createElement("span");
  const btn   = document.createElement("span");
  const btnIcon = document.createElement("i");
  name.textContent = place.name;
  // btn.textContent = "Delete";
  // add class name
  name.classList.add("text") ;
  btn.classList.add("btns") ;
  btnIcon.classList.add("fa");
  btnIcon.classList.add("fa-trash");
  btnIcon.setAttribute("aria-hidden", "true");
  // appends to  dom
  btn.appendChild(btnIcon);
  li.appendChild(name);
  li.appendChild(btn);
  // li.textContent = me.waypointPlace.name
  // Pois.innerHTML = me.waypointsName;
  li.setAttribute("id", place.place_id);
  li.classList.add("poi");
  Pois.appendChild(li);
  // save waypts information
  // TODO: get this by category map
  waypts.push({ // ===> could ommit it
      location: place.geometry.location,
      stopover: true
  });
}

AutocompleteDirectionsHandler.prototype.setUnselectedMarkerFeature = function (marker) {
  let me = this;
  me.waypointPlace = marker.placeDetail;
  me.waypointMarker = marker;

  let image = {
    url: marker.placeDetail.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  }
  marker.setIcon(image);
  marker.setLabel(null);
  me.addClickListenerShowInfo(marker);
  me.addMouseOverListener(marker);
  me.addDblClickToAddAsPois(marker); // DONE
  me.addRClickListenerToRemoveFromMap(marker); // DONE

}
// Listener adder functions
AutocompleteDirectionsHandler.prototype.addClickListenerShowInfo = function (marker) {
  let me = this;
  let place = marker.placeDetail;
  marker.addListener('click', function() {
      if (me.infoWindow !== null) {
        me.infoWindow.close();
      }
      me.infoWindow = new google.maps.InfoWindow();
      me.infoWindow.setContent(place.name + '\n' + marker.position);
      // current_selected = marker.position;
      me.infoWindow.open(map, this);

  });
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

AutocompleteDirectionsHandler.prototype.addRClickListnerToRemoveOrig = function (marker) {
  let me = this;
  marker.addListener("rightclick", function(e) {
      if(confirm("Are you sure to delete start point?") === true){
        // console.log(this);
        // console.log(this.placeId === place.place_id);
        console.log("BEHAVIOR: RClick on Origin: ORIG --> POI");

        let originP = document.getElementById('SP');
        originP.innerHTML = "TBD";
        // me.startMarker.setMap(null);
        me.startMarker = null;
        me.originPlace = null;
        me.switchMarkerType(this, "POI");
      }

  });
}

AutocompleteDirectionsHandler.prototype.addRClickListenerToRemoveDest = function (marker) {
  let me = this;
  marker.addListener("rightclick", function(e) {
    console.log("BEHAVIOR: RClick on DEST: DEST --> POI");

      if(confirm("Are you sure to delete end point?") === true){
        // console.log(this);
        // console.log(this.placeId === place.place_id);
        let destinationP = document.getElementById('EP');
        destinationP.innerHTML = "TBD";
        // me.startMarker.setMap(null);
        me.endMarker = null;
        me.destinationPlace = null;
        me.switchMarkerType(this, "POI");
      }
  });
}

AutocompleteDirectionsHandler.prototype.addDblClickToSelectAsDestOrOrig = function(marker) {
  // console.log("BEHAVIOR: DBLClick on POI: POI --> " + firstChar);

  let me = this;
  marker.addListener("dblclick", function(e) {
      let promptResult = prompt("enter \'S\' as start point, \'E\' as end point ");
      let firstChar = promptResult.charAt(0).toUpperCase();
      if(firstChar === 'S'){
        // console.log("S");
        me.startMarker = marker;
        me.originPlace = marker.placeDetail;
        me.switchMarkerType(this, "ORIG");
        let li = document.getElementById(this.placeId);
        //https://stackoverflow.com/questions/5181006/javascript-document-removeelementbyid
        li.parentNode.removeChild(li);

      } else if (firstChar === 'E') {
        // console.log("E");
        me.destinationPlace = marker.placeDetail;
        me.endMarker = marker;
        me.switchMarkerType(this, "DEST");
        let li = document.getElementById(this.placeId);
        //https://stackoverflow.com/questions/5181006/javascript-document-removeelementbyid
        li.parentNode.removeChild(li);
      } else {
        alert("did nothing");
      }
      console.log("BEHAVIOR: DBLClick on POI: POI --> " + firstChar);
      // test
      me.mapSizeShowInfo();
  });
}

AutocompleteDirectionsHandler.prototype.addRClickListenerFromPoiToUnselected = function(marker) {

  let me = this;
  marker.addListener("rightclick", function(e) {
    console.log("BEHAVIOR: RClick on POI: POI --> Unselected NB or SEARCHED");

      if(confirm("Are you sure to remove this point from POIs?") === true){
        let li = document.getElementById(this.placeId);
        //https://stackoverflow.com/questions/5181006/javascript-document-removeelementbyid
        li.parentNode.removeChild(li);
        me.switchMarkerType(this, this.prevType);
        // test
        me.mapSizeShowInfo();
      }

  });
}

AutocompleteDirectionsHandler.prototype.addRClickListenerToRemoveFromMap = function(marker) {

  let me = this;
  marker.addListener("rightclick", function(e) {
    console.log("BEHAVIOR: RClick on SEARCHE or NB: SELECTED --> remove from map");

      if(confirm("Are you sure to remove this point from map?") === true){
        let type = this.type;
        let id = this.placeId;
        markerMap.delete(id);
        categoryMap.get(type).delete(id);
        this.setMap(null);
        // test
        me.mapSizeShowInfo();
      }
  });
}

AutocompleteDirectionsHandler.prototype.addDblClickToAddAsPois = function(marker) {

  let me = this;
  marker.addListener("dblclick", function(e) {
    console.log("BEHAVIOR: DBLClick on SEARCHED: SEARCHED or ON MAP --> POI");
    me.switchMarkerType(this, "POI");
    // test
    me.mapSizeShowInfo();
  });
}

AutocompleteDirectionsHandler.prototype.mapSizeShowInfo = function () {

  for (let i of categoryMap.keys()) {
    console.log("show: " + i + " ==> " + categoryMap.get(i).size);
  }
  console.log("show: size of markerMap " + markerMap.size);
  console.log("show: waypts array ==> "  + waypts.length);
  console.log("show: end ===========================================");
}

AutocompleteDirectionsHandler.prototype.getwaypts = function () {
  let res = [];
  for (let i of categoryMap.get("POI").values()) {
    res.push({
      location: i.placeDetail.geometry.location,
      stopover: true
    });
  }
  return res;
}

AutocompleteDirectionsHandler.prototype.clearMarkerWithType = function (type) {
  let markers = categoryMap.get(typeMap.get(type));
  for (let i of markers.entries()) {
    markerMap.delete(i[0]);
    i[1].setMap(null);
  }
  markers.clear();
}

AutocompleteDirectionsHandler.prototype.nearbyWithType = function (searchType) {
  let me = this;
  var request = {
    bounds: map.getBounds(),
    type: [searchType]
  }
  me.placeDetailsService.nearbySearch(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; i < results.length; i++) {
        var place = results[i];
        me.addSingleMarkerWithType(results[i], typeMap.get(searchType));
      }
    }
  });
}
