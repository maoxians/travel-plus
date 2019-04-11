// var MY_API_KEY = 'AIzaSyCWxyRxex2f7OtrXKMrr8xeSlzIq_niefE';
// var HONGKONG = {'lat':22.283001, 'lng': 114.137085};
// var RANGE = 5000;
// var POITYPE = 'point_of_interest';
// var pois = [];
//
// var selected = [];
// var current_selected;
// var nearbyplaces = [];
//
//
// var map;
// var service;
// var infowindow;
//
// function initMap() {
//   var mapDiv = document.getElementById('map');
//   var hongkong = new google.maps.LatLng(HONGKONG);
//   map = new google.maps.Map(mapDiv, {
//     center: hongkong,
//     zoom: 13
//   });
//   // var marker = new google.maps.Marker({
//   //   position: hongkong,
//   //   map: map
//   // });
//   var startbtn = document.getElementById('start');
//   startbtn.addEventListener('click', centerViaGeoLocation);
//   var nearbybtn = document.getElementById('nearby');
//   nearbybtn.addEventListener('click', putNearbyMarkersOnMap);
//
//   infoWindow = new google.maps.InfoWindow;
//
//
//
//
//   console.log(map.getCenter().lat() + ', '+ map.getCenter().lng())
//
//
//
//   // google.maps.event.addDomListener(document.getElementById('map'), 'click', function() {
//   //   window.alert('Map was clicked!');
//   // });
//
// }
//
// // 最简单的加array of markers的方式
// function addMarkers(results) {
//
//   var bounds = new google.maps.LatLngBounds();
//   // var placesList = document.getElementById('places');
//
//   // if (status == google.maps.places.PlacesServiceStatus.OK) {
//   for (var i = 0; i < results.length; i++) {
//     var place = results[i];
//     createMarker(results[i], bounds);
//     nearbyplaces.push(place);
//   }
//   // }
//   map.fitBounds(bounds);
// }
//
// // 创建单一的marker的方式
// function createMarker(place, bounds) {
//   // var placesList = document.getElementById('places');
//   var image = {
//     url: place.icon,
//     size: new google.maps.Size(71, 71),
//     origin: new google.maps.Point(0, 0),
//     anchor: new google.maps.Point(17, 34),
//     scaledSize: new google.maps.Size(25, 25)
//   }
//
//   var marker = new google.maps.Marker({
//     map: map,
//     position: place.geometry.location,
//     title: place.name,
//     icon: image
//   });
//
//   var infowindow = new google.maps.InfoWindow();
//
//   google.maps.event.addListener(marker, 'click', function() {
//       infowindow.setContent(place.name + '\n' + marker.position);
//       current_selected = marker.position;
//
//       infowindow.open(map, this);
//   });
//
//   bounds.extend(place.geometry.location);
// }
//
//
// // 20190407
// function centerViaGeoLocation() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var pos = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };
//       console.log(pos.lat + ', '+ pos.lng)
//
//       infoWindow.setPosition(pos);
//       infoWindow.setContent('Location found.');
//       infoWindow.open(map);
//       map.setCenter(pos);
//     }, function() {
//       handleLocationError(true, infoWindow, map.getCenter());
//     });
//   } else {
//     // Browser doesn't support Geolocation
//     handleLocationError(false, infoWindow, map.getCenter());
//   }
// }
//
//
// function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//   infoWindow.setPosition(pos);
//   infoWindow.setContent(browserHasGeolocation ?
//                         'Error: The Geolocation service failed.' :
//                         'Error: Your browser doesn\'t support geolocation.');
//   infoWindow.open(map);
// }
//
// //
// function putNearbyMarkersOnMap() {
//   var request = {
//     // LatLngBounds
//     location: map.getCenter(),
//     radius: '10000',
//     // query: 'restaurant'
//     // 'restaurant', 'point_of_interest', 'store', 'convenience_store', 'aquarium', 'shopping_mall',
//     type: ['amusement_park']
//   }
//
//   service = new google.maps.places.PlacesService(map);
//   var getNextPage = null;
//   var moreButton = document.getElementById('more');
//   moreButton.onclick = function() {
//     moreButton.disabled = true;
//     if (getNextPage) {
//       getNextPage();
//     }
//   };
//   // service.textSearch(request, function(results, status, pagination) {
//
//   service.nearbySearch(request, function(results, status, pagination) {
//     if (status !== 'OK') return;
//
//     addMarkers(results);
//     moreButton.disabled = !pagination.hasNextPage;
//     getNextPage = pagination.hasNextPage && function() {
//       pagination.nextPage();
//     };
//   });
// }


const MY_API_KEY = 'AIzaSyCWxyRxex2f7OtrXKMrr8xeSlzIq_niefE';
const HONGKONG = {'lat':22.283001, 'lng': 114.137085};
const RANGE = 5000;
const POITYPE = 'point_of_interest';
var pois = [];

var selected = [];
var current_selected;
var nearbyplaces = [];

const SEARCH_TYPE = ['amusement_park', 'aquarium', 'art_gallery', 'museum', 'park', 'zoo'];


var map;
var service;
var infowindow;

function initMap() {
  var mapDiv = document.getElementById('map');
  var hongkong = new google.maps.LatLng(HONGKONG);
  map = new google.maps.Map(mapDiv, {
    center: hongkong,
    zoom: 13,
    mapTypeControl: false,
    fullscreenControl: false
  });
  // var marker = new google.maps.Marker({
  //   position: hongkong,
  //   map: map
  // });
  var startbtn = document.getElementById('start');
  startbtn.addEventListener('click', centerViaGeoLocation);
  var nearbybtn = document.getElementById('nearby');
  nearbybtn.addEventListener('click', putNearbyMarkersWithDifferentTypeOnMap);

  infoWindow = new google.maps.InfoWindow();
  google.maps.event.addListener(map, "click", function() {
    infoWindow.close();
  });



  console.log(map.getCenter().lat() + ', '+ map.getCenter().lng())



  // google.maps.event.addDomListener(document.getElementById('map'), 'click', function() {
  //   window.alert('Map was clicked!');
  // });

}

// 最简单的加array of markers的方式
function addMarkers(results) {

  var bounds = new google.maps.LatLngBounds();
  // var placesList = document.getElementById('places');

  // if (status == google.maps.places.PlacesServiceStatus.OK) {
  for (let i = 0; i < results.length; i++) {
    var place = results[i];
    createMarker(results[i], bounds);
    nearbyplaces.push(place);
  }
  // }
  map.fitBounds(bounds);
}

// 创建单一的marker的方式
function createMarker(place, bounds) {
  // var placesList = document.getElementById('places');
  var image = {
    url: place.icon,
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25)
  }

  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name,
    icon: image
  });

  var infowindow = new google.maps.InfoWindow();
  var photoreference =

  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(
        "<div class='info-card'>" +
            "<div class='info-card-top'>" +
            "<img src='" +
            "'" + place.photos[0].getUrl() + "'" +
            "' class='info-card-image'>" +
            "<div class='info-card-meta'>" +
            "<div class='info-card-heading'>" +
            place.name +
            "</div>" +
            "<div class='info-card-subheading'>" +
            place.types +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='info-card-bottom'>" +
            "<p>" + 'data.body' + "</p>" +
            "</div>" +
            "</div>");
      current_selected = marker.position;

      infowindow.open(map, this);
  });

  bounds.extend(place.geometry.location);
}


// 20190407 get browserHasGeolocation
function centerViaGeoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      console.log(pos.lat + ', '+ pos.lng)

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

// add nearby markers
function putNearbyMarkersWithDifferentTypeOnMap() {
  for (let i = 0; i < SEARCH_TYPE.length; i++ ) {
    putNearbyMarkersOnMap(SEARCH_TYPE[i]);
  }
}

// put nearbyMarkerOnMap based on the bounds of current view
function putNearbyMarkersOnMap(searchType) {
  var request = {
    bounds:  map.getBounds(),
    type: [searchType]
  }
  // request using location and radius
  // var request = {
  //   // LatLngBounds
  //   location: map.getCenter(),
  //   radius: '1000',
  //   // query: 'restaurant'
  //   // 'restaurant', 'point_of_interest', 'store', 'convenience_store', 'aquarium', 'shopping_mall',
  //   type: [searchType]
  // }

  service = new google.maps.places.PlacesService(map);
  // ONLY RETURN FIRST PAGE
  // var getNextPage = null;
  // var moreButton = document.getElementById('more');
  // moreButton.onclick = function() {
  //   moreButton.disabled = true;
  //   if (getNextPage) {
  //     getNextPage();
  //   }
  // };
  // service.textSearch(request, function(results, status, pagination) {

  service.nearbySearch(request, function(results, status, pagination) {
    if (status !== 'OK') return;

    addMarkers(results);
    // ONLY return first page result
    // moreButton.disabled = !pagination.hasNextPage;
    // getNextPage = pagination.hasNextPage && function() {
    //   pagination.nextPage();
    // };
  });
}
