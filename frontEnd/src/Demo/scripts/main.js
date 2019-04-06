// map related

var current = [];
current.apppend();
var nearby  = [];
// set ==> 


var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.28, lng: 114.16},
    zoom:14,
    mapTypeControl: false,
    fullscreenControl: false
  });
  // listener for click to add markder
  // google.maps.event.addListener(map, 'click',
  // function(event){
  //   addMarker({coords: event.latLng});
  // });
//   var marker = new google.maps.Marker({
//     position: {lat: 22.28, lng: 114.16},
//     map: map,
//     // icon: 'http://maps.google.com/mapfiles/kml/pal3/icon0.png'
//   });
//
//   var infoWindow = new google.maps.InfoWindow({
//     content: '<h1> Hahah </h1>'
//   });
//
//   marker.addListener('click', function() {
//     infoWindow.open(map, marker);
//   });
// Add Marker function
addMarker({coords:{lat: 22.28, lng: 114.16}, iconImage:'http://maps.google.com/mapfiles/kml/pal3/icon0.png', content:'hhhh'});
addMarker({coords:{lat: 22.28, lng: 114.14}});
addMarker({coords:{lat: 22.283001, lng: 114.137085}});




// search bar
  var input = document.getElementById('search');
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        // icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}


function addMarker(props) {
  // way to initialize markder
    var marker = new google.maps.Marker({
      position: props.coords,
      map: map,
      // icon: 'http://maps.google.com/mapfiles/kml/pal3/icon0.png'
    });
    if (props.iconImage){
      marker.setIcon(props.iconImage);
    }

    if(props.content){
      var infoWindow = new google.maps.InfoWindow ({
        content:props.content
      })

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    }
}

// page realted



function init() {

}




function hideElement(element) {
  element.style.display = 'none';
}

// Create item list

function listItems(items) {
  var itemList = document.querySelector("item-list");
  itemList.innerHTML = '';
  for (var i = 0; i < items.length; i++) {
    addItem(itemList, items[i]);
  }
}
