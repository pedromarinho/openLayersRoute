//$(document).ready(function () {

    var geocoding = "http://nominatim.openstreetmap.org/search.php?&viewbox=&format=json&q=";
    // var geocoding = "https://www.mapquestapi.com/geocoding/v1/address?key=xAdAvfH6WQx0ZzMejjz6hHO31SinCebQ&outFormat=xml&location=";

    // var url_osrm_nearest = 'http://router.project-osrm.org/nearest?loc=';
    var url_osrm_route = 'http://router.project-osrm.org/viaroute?loc=';


    view = new ol.View({
        center: [0, 0],
        zoom: 2,
        maxZoom: 18,
        minZoom: 2
    });




    var mapquest = new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'osm'}),
        visible: true,
        name: 'mapquest'
    });

    var mapquestSat = new ol.layer.Tile({
        title: 'MapQuest Satellite',
        type: 'base',
        visible: false,
        name: 'mapquestSat',
        source: new ol.source.MapQuest({layer: 'sat'})
    });

    var bingMaps = new ol.layer.Tile({
        source: new ol.source.BingMaps({
            key: 'ArKgBVskYGPOLbHxIuMN1rsnuO1JnWrrPO8bpzC2fKWeyJMdi4W6Oj8J8X40_IQj',
            imagerySet: 'Road'
        }),
        visible: false,
        name: 'bingMaps'
    });

    var bingMapsSat = new ol.layer.Tile({
        source: new ol.source.BingMaps({
            key: 'ArKgBVskYGPOLbHxIuMN1rsnuO1JnWrrPO8bpzC2fKWeyJMdi4W6Oj8J8X40_IQj',
            imagerySet: 'AerialWithLabels'
        }),
        visible: false,
        name: 'bingMapsSat'
    });


    var stamen = new ol.layer.Group({

        layers: [
            new ol.layer.Tile({
                source: new ol.source.Stamen({layer: 'watercolor'}),
            }),

            new ol.layer.Tile({
                source: new ol.source.Stamen({layer: 'terrain-labels'}),
            })
        ],
        visible: false,
        name: 'stamen'
    });


var iconFeature = new ol.Feature({
  geometry: new ol.geom.Point([0, 0]),
  name: 'Null Island',
  population: 4000,
  rainfall: 500
});

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: 'cdn.rawgit.com/openlayers/ol3/master/examples/data/icon.png'
      }))
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });


    var map = new ol.Map({
        target: 'map',
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine(),
            new ol.control.ZoomSlider()
        ]),
        renderer: 'canvas',
        layers: [mapquest, mapquestSat, bingMaps, bingMapsSat, stamen],
        view: view
    });

    map.addLayer(vectorLayer); //adiciona o vectorLayer

    var icon_url = 'cdn.rawgit.com/openlayers/ol3/master/examples/data/icon.png';
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
        }),
        image: new ol.style.Circle({
        	radius: 8,
        	stroke: new ol.style.Stroke({
        		color: '#D32F2F',
        		width: 4
        	}),
        	fill: new ol.style.Fill({
        		color: 'rgba(211, 47, 47, 0.3)'
        	})
        })
    };


    $('#search').click(function () {
        console.log(geocoding + $('#address').val());

        var latitude;
        var longitude;

        $.get(geocoding + $('#address').val(), function (data) {

            $('#options').empty();

            latitude = data[0].lat;
            longitude = data[0].lon;

            $.each( data, function( index, value ){
                console.log(index, value.display_name);
                $('#options').append('<a onclick="projectIntoMap('+ value.lon + ',' + value.lat +')">'+ value.display_name +'</a><br>');
            });

            projectIntoMap(longitude, latitude);

//            var position = new ol.geom.Point(ol.proj.transform([parseFloat(data[0].lat), parseFloat(data[0].lon)], 'EPSG:4326','EPSG:3857'));

            iconFeature.setGeometry(new ol.geom.Point(ol.proj.transform([parseFloat(data[0].lat), parseFloat(data[0].lon)], 'EPSG:4326','EPSG:3857')));


            map.getView().setZoom(13);

            $('#route').css("visibility", 'visible');
//            $('#search').css("visibility", 'hidden');
            // $('#search').text("Calcular rota");
            $('#address2').css("visibility", 'visible');

        }).fail(function () {
            alert("endereço não localizado");
        });

    });






    $('#route').click(function () {
        //rotas

        //get the route
        // var point1 = '-7.233445,-35.914911';
        // var point2 = '-7.224132,-35.893678';
        var point1;
        var point2;

        // map.clear();

        $.get(geocoding + $('#address').val(), function (data) {
            point1 = data[0].lat + ',' + data[0].lon;

            $.get(geocoding + $('#address2').val(), function (data) {
                point2 = data[0].lat + ',' + data[0].lon;

                console.log('POINT 1 ', point1);

                console.log('POINT 2 ', point2);



                $.get(url_osrm_route + point1 + '&loc=' + point2 + '&instructions=true', function (data) {

                        console.log(url_osrm_route + point1 + '&loc=' + point2 + '&instructions=true');

                        $('#options').empty();

                        var polyline = data.route_geometry;
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

                        $('#options').append('<h3>'+ (data.route_summary.total_distance / 1000).toFixed(2) + ' km, ' + formatTime(data.route_summary.total_time));

                        $.each( data.route_instructions, function( index, value ){
                             console.log(index, value);
                             $('#options').append('<a>'+ value +'</a><br>');
                        });

                    })
                    .fail(function () {
                        alert("rota nao localizada");
                    });

            }).fail(function () {
                alert("endereço de destino não localizado");
            });

        }).fail(function () {
            alert("endereço de origem não localizado");
        });


    });


    //Mudando os mapas
    $('#layers input[type=radio]').change(function () {

        var layer = $(this).val();

        map.getLayers().getArray().forEach(function (e) {
            var name = e.get('name');
            e.setVisible(name == layer);
        });
    });

    function projectIntoMap(longitude, latitude) {
        map.getView().setCenter(ol.proj.transform([parseFloat(longitude), parseFloat(latitude)], 'EPSG:4326', 'EPSG:3857'));
    }

    function formatTime(s){
        h = Math.round(s/3600);
        min = Math.floor((s%3600)/60);
        return h+" h "+min+" m";
    }


//});