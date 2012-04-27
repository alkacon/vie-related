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

	var stanbol = new v.StanbolService({
		url : [ "http://dev.iks-project.eu/stanbolfull", "http://dev.iks-project.eu:8080" ]
	});
	v.use(stanbol);
	stanbol.rules = jQuery.merge(stanbol.rules, Util.getAdditionalRules(stanbol));
	v.analyze({
		element : jQuery(con)
	}).using('stanbol').execute().done(
	
			function(entities) {
				
				var goods = {
					persons : [],
					cities : [],
					places : [],
					orgas : [],
					events : [],
					movies : [],
					species : [],
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
					} else if (entity.isof("dbpedia:Species")) {
						goods.species.push(entity);
						console.log("dbpedia:Species found");
					} else if (entity.isof("Thing")) {
						goods.others.push(entity);
					}
				});

				var container = jQuery('<div id="image_container"></div>');
				if (goods.persons.length == 0
					&& goods.cities.length == 0 
					&& goods.places.length == 0
					&& goods.orgas.length == 0 
					&& goods.events.length == 0 
					&& goods.movies.length == 0
					&& goods.species.length == 0) {
					container.append("<p><b>No known entities found.</b></p>");
				} else {
					container.empty();
					performGoogleFlickrImageSearch("Persons", goods.persons, this.vie, container);
					performGoogleFlickrImageSearch("Cities", goods.cities, this.vie, container);
					performGoogleFlickrImageSearch("Places", goods.places, this.vie, container);
					performGoogleFlickrImageSearch("Organizations", goods.orgas, this.vie, container);
					performGoogleFlickrImageSearch("Events", goods.events, this.vie, container);
					performGoogleFlickrImageSearch("Movies", goods.movies, this.vie, container);
					performDbpediaDepictionSearch("Species", goods.species, this.vie, container);
					openResultDialog(container, element);
				}

		});
}

function performGoogleFlickrImageSearch(typeName, entities, v, container) {

	if (entities.length > 0) {
		container.append("<p><b>" + typeName + ":</b></p>");
		for ( var j = 0; j < entities.length; j++) {
			var entity = entities[j];
			var name = extractString(entity, [ "rdfs:label", "name" ], "en");
			
			var cnt = jQuery('<div id="imgCnt_' + j + '"></div>');
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

	if (entities.length > 0) {
	var picSize = 190;
		container.append("<p><b>" + typeName + ":</b></p>");
		for ( var j = 0; j < entities.length; j++) {
			var entity = entities[j];
			var imgUrl = getDepiction(entity, picSize);
			if (imgUrl) {
				
				var name =  extractString(entity, [ "rdfs:label", "name" ], "en");
				var cnt = jQuery('<div id="imgCnt_' + j + '"></div>');
				cnt.append('<p>'+name+'</p>');
				cnt.appendTo(container);
				var imageLink = jQuery('<a class="view-vieImageSearch-image" href="'+imgUrl+'" target="_blank"><img src="'+imgUrl+'" style="width:'+picSize+'px; height:auto;" /></a>');
				imageLink.appendTo(cnt);
			}
		}
	}	
}

function getDepiction(entity, picSize) {

	var depictionUrl, field, fieldValue, preferredFields;
	preferredFields = [ "foaf:depiction", "schema:thumbnail" ];
	field = _(preferredFields).detect(function(field) {
		if (entity.get(field)) return true;
	});
	if (field && (fieldValue = _([entity.get(field)]).flatten())) {
		depictionUrl = _(fieldValue).detect(function(uri) {
			uri = (typeof uri.getSubject === "function" ? uri.getSubject() : void 0) || uri;
			if (uri.indexOf("thumb") !== -1) return true;
		}).replace(/[0-9]{2..3}px/, "" + picSize + "px");
		return depictionUrl.replace(/^<|>$/g, '');
	}
}

function openResultDialog(results, element) {

	results.appendTo(jQuery(element).parent());
	var parentElement = jQuery(element).parent();
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
