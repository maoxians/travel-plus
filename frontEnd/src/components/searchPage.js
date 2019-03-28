        
        var waypoint_dict = [];
        function initMap() {
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            var geocoder = new google.maps.Geocoder();

            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12, //set zoom value todo
                center: {
                    lat: 38.9072,
                    lng: -77.0369
                }
            });
            directionsDisplay.setMap(map);

            //write another function to reduce hard-code 
            //to do

            document.getElementById('submit').addEventListener('click', function () {
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            });

            document.getElementById('search').addEventListener('click', function () {
                geocodeAddress(geocoder, map);
            });
        }



        function calculateAndDisplayRoute(directionsService, directionsDisplay) {

            var start_address = waypoint_dict[0].location;
            var end_address = waypoint_dict[waypoint_dict.length-1].location;

            var options = {
                origin: start_address,
                destination: end_address,
                waypoints:{},
                optimizeWaypoints: true,
                travelMode: 'DRIVING'
            }

            for (var i = 1; i < waypoint_dict.length-2;i++) {
                options.waypoints.push({
                    location: waypoint_dict[property],
                    stopover: true
                });
            }

            directionsService.route(options, function (response, status) {
                if (status === 'OK') {
                    directionsDisplay.setDirections(response);
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
        }

        function geocodeAddress(geocoder, resultsMap) {
            var address = document.getElementById('address').value;
            // GeocoderComponentRestrictions 
            //to do
            geocoder.geocode({
                'address': address
            }, 
            function (result, status) {
                if (status === 'OK') {
                    var marker = new google.maps.Marker({
                        map: resultsMap,
                        position: result[0].geometry.location
                    });
                    waypoint_dict.push(marker.position);
                    
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }