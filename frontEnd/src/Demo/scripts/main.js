// map related

var candidate = [];
var nearby  = [];
// set ==> 


var map;

var markers = [];



  var locations = [
  {title: 'Victoria Peak',    location: {lat: 22.2758835,       lng: 114.145532   }},
  {title: 'Disney Land',      location: {lat: 22.308393,        lng: 114.043959   }},
  {title: 'Little Hong Kong', location: {lat: 22.2466607,       lng: 114.1757239  }},
  {title: 'Tsim Sha Tsui',    location: {lat: 22.3034899,       lng: 114.1771279  }},
  {title: 'victoria harbour', location: {lat: 22.279485,        lng: 114.164823   }},
  {title: 'Tian Tan Buddha',  location: {lat: 22.2539847,       lng: 113.904984   }},
  {title: 'Lantau Island',    location: {lat: 22.3476034,       lng: 114.0583373  }},
  {title: 'Central',          location: {lat: 22.2890069,       lng: 114.1689992  }},
  {title: 'Ngong Ping 360',   location: {lat: 22.2563163,       lng: 113.9014163  }},
  {title: 'The Peak Tram',    location: {lat: 22.2776827,       lng: 114.1591909  }}
  ];

function initMap() {



  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 22.28, lng: 114.16},
    zoom:14,
    mapTypeControl: false,
    fullscreenControl: false
  });

    // addMarker({coords:{lat: 22.28, lng: 114.16}, 
    // iconImage:'http://maps.google.com/mapfiles/kml/pal3/icon0.png', content:'hhhh'});
    // addMarker({coords:{lat: 22.28, lng: 114.14}});
    // addMarker({coords:{lat: 22.283001, lng: 114.137085}});

    // var defaultIcon = makeMarkerIcon('0091ff');
    // var highlightedIcon = makeMarkerIcon('FFFF24');
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

   for (var i = 0; i < locations.length; i++) {
     // Get the position from the location array.
     var position = locations[i].location;
     var title = locations[i].title;
     // Create a marker per location, and put into markers array.
     var marker = new google.maps.Marker({
       map: map,
       position: position,
       title: title,
       animation: google.maps.Animation.DROP,
       id: i
     });
     // Push the marker to our array of markers.
     markers.push(marker);
     // Create an onclick event to open an infowindow at each marker.
     marker.addListener('click', function() {
       populateInfoWindow(this, largeInfowindow);
     });
     bounds.extend(markers[i].position);
   }

   document.getElementById("show-listings").addEventListener('click', showListings);
   document.getElementById("hide-listings").addEventListener('click', hideListings);
   document.getElementById("dele-listings").addEventListener('click', deleListings);
  // search bar
  var input = document.getElementById('search');
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    // markers.forEach(function(marker) {
    //   marker.setMap(null);
    // });
    // markers = [];

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

      var preId = markers[markers.length - 1].id

      var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location,
        id: preId+1
      });
      markers.push(marker);


     marker.addListener('click', function() {
       populateInfoWindow(this, largeInfowindow);
     });




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

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>' + 
                          '<button type="button" name="select" onclick="addToCandidate(this)" value = ' + marker.id + '>select</button>' + 
                          '<button type="button" name="delete" onclick="delFromCandidate(this)" value = ' + marker.id + '>delete</button>'
                          );
    infowindow.open(map, marker);
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}


function addToCandidate(input) {


  var inputid = input.value 
  var flag = false
  for (var i = 0; i < candidate.length; i++) {
    if (candidate[i].id == inputid) {
      flag = true
    }
  }
  if (!flag) {
      candidate.push(markers.find(marker => marker.id == inputid))
  }

    
            // <li class="fas fa-map-marker">
            // <a href="">POI1</a>
            // <p>Category: Music</p>
            // <button type="button" name="remove-button"> remove </button>
            // </li>
}

function delFromCandidate(input) {
  var inputid = input.value 
  candidate = candidate.filter(marker => marker.id != inputid)
}


function renderCandidate() {
    var notebook = document.getElementById("notebook_ul");
    var li = document.createElement("li");
    li.setAttribute("class", "fas fa-map-marker");

}



function showListings() {
  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }

  for (var i = 0; i < locations.length; i++) {
    bounds.extend(locations[i].location);
  }

  map.fitBounds(bounds);
}

function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function deleListings() {
    hideListings()
    markers = []
}




// function addMarker(props) {
//   // way to initialize markder
//     var marker = new google.maps.Marker({
//       position: props.coords,
//       map: map,
//       // icon: 'http://maps.google.com/mapfiles/kml/pal3/icon0.png'
//     });
//     if (props.iconImage){
//       marker.setIcon(props.iconImage);
//     }

//     if(props.content){
//       var infoWindow = new google.maps.InfoWindow ({
//         content:props.content
//       })

//       marker.addListener('click', function() {
//         infoWindow.open(map, marker);
//       });
//     }
// }

// page realted






// function hideElement(element) {
//   element.style.display = 'none';
// }

// // Create item list

// function listItems(items) {
//   var itemList = document.querySelector("item-list");
//   itemList.innerHTML = '';
//   for (var i = 0; i < items.length; i++) {
//     addItem(itemList, items[i]);
//   }
// }
