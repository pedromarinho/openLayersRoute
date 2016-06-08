var map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.MapQuest({layer: 'osm'})
    })
  ],
  view: new ol.View({
    center: [0, 0],
    zoom: 4


  })
});

var vectorSource = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
  source: vectorSource
});
map.addLayer(vectorLayer);

var icon_url =
	'//cdn.rawgit.com/openlayers/ol3/master/examples/data/icon.png';
var styles = {
  route: new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 6, color: [40, 40, 40, 0.8]
    })
  }),
  icon: new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      src: icon_url
    })
  })
};
var points = [];
var msg_el = document.getElementById('msg');
var url_osrm_nearest = 'http://router.project-osrm.org/nearest?loc=';
var url_osrm_route = 'http://router.project-osrm.org/viaroute?loc=';
console.clear();

map.on('click', function(evt){
  var clicked = evt.coordinate;

  utils.getNearest(clicked).then(function(coord_street){
  	console.info('promise', coord_street);


    var last_point = points[points.length - 1];

    utils.createFeature([coord_street[1], coord_street[0]]);
    var points_length = points.push(coord_street);

    if (points_length < 2) {
      msg_el.innerHTML = 'Clique em outro ponto';
      return;
    }
    //get the route
    var point1 = '-7.233445,-35.914911';
    var point2 = '-7.224132,-35.893678';

    console.log("POINT 1 ", point1);

    console.log("POINT 2 ", point2);
    utils.json(url_osrm_route + point1+'&loc='+point2+'&instructions=true').when({
      ready: function(response){
        console.info(response);
console.log(response);

        if(response.status != 200) {
          msg_el.innerHTML = response.status_message;
          return;
        }
        msg_el.innerHTML = 'Rota calculada';
        //points.length = 0;
        utils.createRoute(response.route_geometry);

        points = [];
      }
    });
  });
});









var utils = {
	getNearest: function(coord){
    var coord4326 = utils.to4326(coord);
    var lat_lon = coord4326[1] +','+ coord4326[0];

    return new Promise(function(resolve, reject) {
      //make sure the coord is on street
      utils.json(url_osrm_nearest + lat_lon).when({
        ready: function(response) {
          resolve(response.mapped_coordinate);
        }
      });
    });
  },
  createFeature: function(coord) {
    var feature = new ol.Feature({
      type: 'place',
      geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
    });
    feature.setStyle(styles.icon);
    vectorSource.addFeature(feature);
  },
  createRoute: function(polyline) {
    // route is ol.geom.LineString
    var route = new ol.format.Polyline({
      factor: 1e6
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    var feature = new ol.Feature({
      type: 'route',
      geometry: route
    });
    feature.setStyle(styles.route);
    vectorSource.addFeature(feature);
  },
  to4326: function(coord) {
    return ol.proj.transform([
      parseFloat(coord[0]), parseFloat(coord[1])
    ], 'EPSG:3857', 'EPSG:4326');
  },
  encodeUrlXhr: function(url, data){
    if(data && typeof(data) === 'object') {
      var str_data = utils.toQueryString(data);
      url += (/\?/.test(url) ? '&' : '?') + str_data;
    }
    return url;
  },
  toQueryString: function(obj){
    return Object.keys(obj).reduce(function(a, k) {
      a.push(
        (typeof obj[k] === 'object') ? utils.toQueryString(obj[k]) :
        encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])
      );
      return a;
    }, []).join('&');
  },
  json: function(url, data) {

    console.log("URL: ", url);

    var xhr = new XMLHttpRequest(),
        when = {},
        onload = function() {
          if (xhr.status === 200) {
            when.ready.call(undefined, JSON.parse(xhr.response));
          } else {
            console.error("Status code was " + xhr.status);
          }
        },
        onerror = function() {
          console.error("Can't XHR " + JSON.stringify(url));
        },
        onprogress = function() {};
    url = utils.encodeUrlXhr(url, data);
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Accept","application/json");
    xhr.onload = onload;
    xhr.onerror = onerror;
    xhr.onprogress = onprogress;
    xhr.send(null);

    return {
      when: function(obj){
        when.ready = obj.ready;
      }
    };
  }
};