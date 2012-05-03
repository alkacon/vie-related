function enhance(con, element) {
	v = new VIE();
	v.namespaces.base("http://schema.org/");
	v.loadSchema("http://schema.rdfs.org/all.json", {
		baseNS : "http://schema.org/",
		success : function() {
			onLoadSuccess(v, con, element);
		},
		error : function(msg) {
			console.warn(msg);
		}
	});
}

function onLoadSuccess(v, con, element) {

	var stanbol = new v.StanbolService(
	        { 
	            // url : [ "http://dev.iks-project.eu:8080" ]
	            url : [ "http://localhost:8085" ]
	        });
	v.use(stanbol);
	stanbol.rules = v.jQuery.merge(stanbol.rules, VIE.Util.getAdditionalRules(v));
	v.analyze({ element : v.jQuery(con) }).using('stanbol').execute().done(

			function(entities) {
				
				var goods = {
					persons : [],
					cities : [],
					places : [],
					orgas : [],
					events : [],
					movies : [],
					plants : [],
					others : []
				};

				_.each(entities, function(entity) {
					if (!entity.has('http://www.w3.org/2000/01/rdf-schema#label')) {
						return;
					}
					if (entity.isof("Person")) {
						goods.persons.push(entity);
					} else if (entity.isof("City")) {
						goods.cities.push(entity);
					} else if (entity.isof("Place")) {
						goods.places.push(entity);
					} else if (entity.isof("Organization")) {
						goods.orgas.push(entity);
					} else if (entity.isof("Event")) {
						goods.events.push(entity);
					} else if (entity.isof("Movie")) {
						goods.movies.push(entity);
                    } else if (isOf(entity, "<http://dbpedia.org/ontology/Plant>")) {
                        goods.plants.push(entity);
					} else if (entity.isof("Thing")) {
						goods.others.push(entity);
					}
				});

				var container = v.jQuery('<div id="image_container"></div>');
				if (goods.persons.length == 0
					&& goods.cities.length == 0 
					&& goods.places.length == 0
					&& goods.orgas.length == 0 
					&& goods.events.length == 0 
					&& goods.movies.length == 0
					&& goods.plants.length == 0) {
					container.append("<p><b>No known entities found.</b></p>");
				} else {
					container.empty();
					performGoogleFlickrImageSearch("Persons", goods.persons, this.vie, container);
					performGoogleFlickrImageSearch("Cities", goods.cities, this.vie, container);
					performGoogleFlickrImageSearch("Places", goods.places, this.vie, container);
					performGoogleFlickrImageSearch("Organizations", goods.orgas, this.vie, container);
					performGoogleFlickrImageSearch("Events", goods.events, this.vie, container);
					performGoogleFlickrImageSearch("Movies", goods.movies, this.vie, container);
					performDbpediaDepictionSearch("Plants found", goods.plants, this.vie, container);
					openResultDialog(container, element, v);
				}
		});
}

function performGoogleFlickrImageSearch(typeName, entities, v, container) {

    logEntities(typeName, entities);
	if (entities.length > 0) {
		container.append("<p><b>" + typeName + ":</b></p>");
		for ( var j = 0; j < entities.length; j++) {
			var entity = entities[j];
			var name = VIE.Util.getPreferredLangForPreferredProperty(entities[j], new Array("rdfs:label"), prefLanguages );
			var cnt = v.jQuery('<div id="imgCnt_' + j + '"></div>');
			cnt.append("<p>" + name + "</p>");
			cnt.appendTo(container);
			cnt.vieImageSearch({
				vie : v,
				bin_size : 4,
				services : {
					flickr : {
						api_key : "ffd6f2fc41249feeddd8e62a531dc83e",
						use : false
					},
					gimage : {
						use : true
					}
				}
			});
			cnt.vieImageSearch({
				entity : entity.getSubject()
			});
		}
	}
}

function performDbpediaDepictionSearch(typeName, entities, v, container) {

    logEntities(typeName, entities);
	if (entities.length > 0) {
	var picSize = 174;
		container.append("<p><b>" + typeName + ":</b></p>");
		for ( var j = 0; j < entities.length; j++) {
			var entity = entities[j];
			var imgUrl = VIE.Util.getDepiction(entity, picSize);
			if (imgUrl) {
			    var name = VIE.Util.getPreferredLangForPreferredProperty(entities[j], new Array("rdfs:label"), prefLanguages);
				var cnt = v.jQuery('<div id="imgCnt_' + j + '"></div>');
				cnt.append("<p>"+name+"</p>");
				cnt.appendTo(container);
				var imageLink = v.jQuery('<a class="view-vieImageSearch-image" href="'+imgUrl+'" target="_blank"><img src="'+imgUrl+'" style="width:'+picSize+'px; height:auto; margin: 0px;" /></a>');
				imageLink.appendTo(cnt);
			}
		}
	}	
}

function openResultDialog(results, element, v) {

	results.appendTo(v.jQuery(element).parent());
	var parentElement = v.jQuery(element).parent();
	var left = parentElement.offset().left + parentElement.outerWidth() + 20;
	var top = parentElement.offset().top;

	results.dialog({
		title : 'Image search results',
		autoOpen : false,
		closeOnEscape : true,
		height : 500,
		maxHeight : 500,
		width : 223,
		maxWidth : 223,
		position : [ left, top ],
		resizable : false,
		zIndex : 999999999999,
		close : function(event, ui) {
			results.empty();
		}
	});
	results.dialog('open');
}

var prefLanguages = [ "en", "de" ];

function isOf(entity, type) {
    for (i = 0; i < entity.get("@type").length; i++) {
        var eType = entity.get("@type")[i];
        if (eType.id == type) {
            return true;
        }
    }
}

function logEntities(typeName, entities) {
    if (entities.length > 0) {
        console.log('');
        console.log('### Type: ' + typeName + ' ###');
        for (var j = 0; j < entities.length; j++) {
            console.log(VIE.Util.getPreferredLangForPreferredProperty(entities[j], [ "rdfs:label" ], prefLanguages));
        }
    }
}
