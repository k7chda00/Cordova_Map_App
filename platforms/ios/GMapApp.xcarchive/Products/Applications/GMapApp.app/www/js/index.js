/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
  // Application Constructor
  initialize: function () {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function () {
    this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function (id) {
    var parentElement = document.getElementById(id);
    var googleApi = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
    var googleApiKey = '&key=AIzaSyBQrKaZNkPTpu7FpAS6yvq1xOIVcUsFpYg';
    var yourPosition = document.getElementById("yourPosition");
    var betweenPoints = document.getElementById("betweenPoints");
    var getLongLat = document.getElementById('getLongLat');
    var distance = document.getElementById('distance');
    var button = document.getElementById("getLongLat");
    var div = document.getElementById("map_canvas");
    var addressLong = 52.3702160; //defualt
    var addressLat = 4.8951680; //defualt
    var userLong = 52.3702160; //defualt
    var userLat = 4.8951680; //defualt
    var mapShowed = false;
    var formated_address;
    var markers = [];
    var map;

    // Initialize the map view
    map = plugin.google.maps.Map.getMap(div, {
      'controls': {
        'myLocationButton': false
      }
    });

    // Wait until the map is ready status.
    map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);

    function onMapReady() {
      onUserLocSet();
    }

    function onUserLocSet() {

      // Move to the position with animation
      map.animateCamera({
        target: { lat: userLat, lng: userLong },
        zoom: 5,
        tilt: 60,
        bearing: 140,
        duration: 3000
      }, function () {

        // Add a maker
        map.addMarker({
          position: { lat: userLat, lng: userLong },
          title: "You are Here",
          snippet: `lat: ${userLat.toFixed(8)}, long: ${userLong.toFixed(8)}`,
          animation: plugin.google.maps.Animation.BOUNCE
        }, function (marker) {

          // Show the info window
          marker.showInfoWindow();

          // Catch the click event
          marker.on(plugin.google.maps.event.INFO_CLICK, function () {

          });
        });
      });
    }

    yourPosition.addEventListener('click', function () {
      checkMarkers()
      myAddMarker(userLat, userLong)
      locationsDivs('Your position', userLat, userLong);
      map.addMarker({
        'position': {
          lat: userLat,
          lng: userLong
        },
        title: "You are Here",
        snippet: `lat: ${userLat.toFixed(8)}, long: ${userLong.toFixed(8)}`
      }, function (marker) {
        // Move to the position
        map.animateCamera({
          'target': { 'lat': userLat, 'lng': userLong },
          'zoom': 8,
          'tilt': 0,
        }, function () {
          marker.showInfoWindow();
        });
      });
    });

    function showCurrentLoc() {
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      function success(pos) {
        var crd = pos.coords;
        checkMarkers();
        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
        userLong = crd.longitude;
        userLat = crd.latitude;

        myAddMarker(userLat, userLong)
        locationsDivs('Your position', userLat, userLong);
        onMapReady();
        //yourPos.innerHTML = `Your current position is: Latitude : ${crd.latitude} Longitude: ${crd.longitude}`;

      };

      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      };
      console.log('geolocation');
      navigator.geolocation.getCurrentPosition(success, error, options);
      console.log("navigator.geolocation works well");

    }
    showCurrentLoc();

    getLongLat.addEventListener('click', function () {
      checkMarkers();
      var address = document.getElementById('addressFrom').value.trim();

      if (address !== '') {
        var trimAddress = address.replace(' ', '+');
        console.log(address);

        // Address -> latitude,longitude
        plugin.google.maps.Geocoder.geocode({
          "address": trimAddress
        }, function (results) {

          console.log(JSON.stringify(results));
          console.log('lat is ' + results[0].position.lat);
          addressLat = results[0].position.lat
          addressLong = results[0].position.lng
          myAddMarker(addressLat, addressLong);
          locationsDivs('Address position', results[0].position.lat, results[0].position.lng)

          // Add a marker
          map.addMarker({
            'position': results[0].position,
            'title': results[0].extra.address.FormattedAddressLines[0] + ', ' + results[0].extra.address.FormattedAddressLines[1],
            "snippet": "Lat: " + addressLat + " Long: " + addressLong
          }, function (marker) {
            // Move to the position
            map.animateCamera({
              'target': results[0].position,
              'zoom': 8,
              'tilt': 60,
            }, function () {
              marker.showInfoWindow();
            });

          });

        });
      }

    });

    function locationsDivs(name, lat, long) {
      var id;
      console.log('markers length ' + markers.length);
      if (markers.length === 1) {
        id = 'yourPos';
      } else {
        id = 'addressPos';
      }
      console.log('where to add loc: ' + id);
      var posDiv = document.getElementById(id);
      while (posDiv.firstChild) {
        posDiv.removeChild(posDiv.firstChild);
      }
      var span = document.createElement('span')
      var pLat = document.createElement('p')
      var pLong = document.createElement('p')
      span.innerHTML = name || 'Marker Position';
      pLat.innerHTML = `Lat:   ${lat.toFixed(8)}`;
      pLong.innerHTML = `Long: ${long.toFixed(8)}`;
      posDiv.appendChild(span);
      posDiv.appendChild(pLat);
      posDiv.appendChild(pLong);
    }

    function getDistance(from, to) {

      var distanceBetween = plugin.google.maps.geometry.spherical.computeDistanceBetween(from, to)
      distance.innerHTML = 'Distance is: ' + (distanceBetween / 1000).toFixed(2) + 'km';
    }


    betweenPoints.addEventListener('click', function () {

      map.clear();

      clearLocations();

      alert('click on map to get two markers from which you want know distance');
      markers = [];


    });

    map.on(plugin.google.maps.event.MAP_CLICK, function (latLng) {

      if (markers.length < 2 ) {

        myAddMarker(latLng.lat, latLng.lng);
        locationsDivs(undefined, latLng.lat, latLng.lng)
        map.addMarker({
          position: latLng,
          title: "Position",
          "snippet": "Lat: " + latLng.lat + " Long: " + latLng.lng,
          animation: plugin.google.maps.Animation.DROP
        }, function(marker) {

          // Show the info window
          marker.showInfoWindow();
        });
      }
    });

    function myAddMarker(lat, lng) {
      markers.push({ 'lat': lat, 'lng': lng });
      if (markers.length >= 2) {
        getDistance(markers[0], markers[1])

      }
    }
    function checkMarkers() {
      console.log('check markers: ' + markers.length);
      if (markers.length === 2) {
        map.clear();
        markers = [];
        clearLocations();
      }
    }
    function clearLocations() {
      var locationsArr = ['yourPos', 'addressPos'];

      for (var i = 0; i < locationsArr.length; i++) {
        var posDiv = document.getElementById(locationsArr[i]);
        if (posDiv.firstChild !== undefined) {
          console.log('location id ');
          console.log(locationsArr[i]);
          while (posDiv.firstChild) {
            posDiv.removeChild(posDiv.firstChild);
          }
        }
      }

      distance.innerHTML = 'To get distance set markers';
    }

    /* phase_2 */

  }


};

app.initialize();