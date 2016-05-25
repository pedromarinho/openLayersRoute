$(document).ready(function() {

  view = new ol.View({
     center: [0,0],
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



  //Mudando os mapas
  	$('#layers input[type=radio]').change(function(){

  		var layer = $(this).val();

  		map.getLayers().getArray().forEach(function(e){
  			var name = e.get('name');
  			e.setVisible(name == layer);
  		});
  	});

});