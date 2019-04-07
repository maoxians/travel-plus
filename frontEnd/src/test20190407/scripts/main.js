var MY_API_KEY = 'AIzaSyCWxyRxex2f7OtrXKMrr8xeSlzIq_niefE';
var HONGKONG = {'lat':22.283001, 'lng': 114.137085};
var RANGE = 5000;
var POITYPE = 'point_of_interest';
var pois = [];

var selected = [];
var current_selected;
var nearbyplaces = [];


var map;
var service;
var infowindow;

function initMap() {
  var mapDiv = document.getElementById('map');
  var hongkong = new google.maps.LatLng(HONGKONG);
  map = new google.maps.Map(mapDiv, {
    center: hongkong,
    zoom: 13
  });
  // var marker = new google.maps.Marker({
  //   position: hongkong,
  //   map: map
  // });
  var startbtn = document.getElementById('start');
  startbtn.addEventListener('click', centerViaGeoLocation);
  var nearbybtn = document.getElementById('nearby');
  nearbybtn.addEventListener('click', putNearbyMarkersOnMap);

  infoWindow = new google.maps.InfoWindow;




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
  for (var i = 0; i < results.length; i++) {
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

  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name + '\n' + marker.position);
      current_selected = marker.position;

      infowindow.open(map, this);
  });

  bounds.extend(place.geometry.location);
}


// 20190407
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

//
function putNearbyMarkersOnMap() {
  var request = {
    // LatLngBounds
    location: map.getCenter(),
    radius: '10000',
    // query: 'restaurant'
    // 'restaurant', 'point_of_interest', 'store', 'convenience_store', 'aquarium', 'shopping_mall',
    type: ['amusement_park']
  }

  service = new google.maps.places.PlacesService(map);
  var getNextPage = null;
  var moreButton = document.getElementById('more');
  moreButton.onclick = function() {
    moreButton.disabled = true;
    if (getNextPage) {
      getNextPage();
    }
  };
  // service.textSearch(request, function(results, status, pagination) {

  service.nearbySearch(request, function(results, status, pagination) {
    if (status !== 'OK') return;

    addMarkers(results);
    moreButton.disabled = !pagination.hasNextPage;
    getNextPage = pagination.hasNextPage && function() {
      pagination.nextPage();
    };
  });
}








// 额外的调用 可以查看多于20 ~ 60条的记录。。。

//
//
//
//
// // test function
// function getLocation(res) {
//   var values = JSON.parse(res);
//   var places = values['result'];
//   var result = [];
//   for (var i = 0; i < places.length; i++) {
//     result.append(places[i]['geometry']['location']);
//   }
//   return result;
// }
//
//
//
// /**
//  * AJAX helper
//  *
//  * @param method - GET|POST|PUT|DELETE
//  * @param url - API end point
//  * @param data - request payload data
//  * @param successCallback - Successful callback function
//  * @param errorCallback - Error callback function
//  */
// function ajax(method, url, data, successCallback, errorCallback) {
//   var xhr = new XMLHttpRequest();
//
//   xhr.open(method, url, true);
//
//   xhr.onload = function() {
//     if (xhr.status === 200) {
//       successCallback(xhr.responseText);
//     } else {
//       errorCallback();
//     }
//   };
//
//   xhr.onerror = function() {
//     console.error("The request couldn't be completed.");
//     errorCallback();
//   };
//
//   if (data === null) {
//     xhr.send();
//   } else {
//     xhr.setRequestHeader("Content-Type",
//       "application/json;charset=utf-8");
//     xhr.send(data);
//   }
// }
//
//   // -------------------------------------
//   // AJAX call client-side APIs
//   // -------------------------------------
//   // function loadNearbyItems() {
//   //   console.log('loadNearbyItems');
//   //   // activeBtn('nearby-btn');
//   //
//   //   // The request parameters
//   //   // var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=22.283001,114.137085&radius=5000&type=point_of_interest&key=AIzaSyCWxyRxex2f7OtrXKMrr8xeSlzIq_niefE';
//   //   var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
//   //   var params = 'location=' + hklocation['lat'] + ',' + hklocation['lng'] + '&radius=' + RANGE + '&type=' + POITYPE + '&key=' + MY_API_KEY;
//   //   var data = null;
//   //
//   //   // display loading message
//   //   // showLoadingMessage('Loading nearby items...');
//   //
//   //   // make AJAX call
//   //   ajax('GET', url + '?' + params, data,
//   //     // successful callback
//   //     function(res) {
//   //       var items = JSON.parse(res);
//   //       if (!items || items.length === 0) {
//   //         // showWarningMessage('No nearby item.');
//   //       } else {
//   //         listItems(items);
//   //       }
//   //     },
//   //     // failed callback
//   //     function() {
//   //       showErrorMessage('Cannot load nearby items.');
//   //     }
//   //   );
//   // }
