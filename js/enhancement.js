function enhance(con) {
	v = new VIE();
	v.namespaces.base("http://schema.org/");
	v.loadSchema("http://schema.rdfs.org/all.json", {
		baseNS : "http://schema.org/",
		success : function() {
			onLoadSuccess(v, con);
		},
		error : function(msg) {
			console.warn(msg);
		}
	});
}

function onLoadSuccess(v, con) {
	var stanbol = new v.StanbolService({
		url : [ "http://dev.iks-project.eu/stanbolfull", "http://dev.iks-project.eu:8080" ],
		enhancerUrlPostfix : "/enhancer/chain/dbpedia-keyword"
	});
	v.use(stanbol);
	stanbol.rules = jQuery.merge(stanbol.rules, getAdditionalRules(stanbol));
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
					movies : []
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
					}
				});
				var container = jQuery('#image_container');
				if (goods.persons.length == 0 && goods.persons.length == 0 && goods.persons.length == 0
						&& goods.persons.length == 0 && goods.persons.length == 0 && goods.persons.length == 0) {
					container.append("<p><b>No Persons or Places found.</b></p>");
				} else {
					container.empty();
					performSearch("Persons", goods.persons, this.vie);
					performSearch("Cities", goods.cities, this.vie);
					performSearch("Places", goods.places, this.vie);
					performSearch("Organizations", goods.orgas, this.vie);
					performSearch("Events", goods.events, this.vie);
					performSearch("Movies", goods.movies, this.vie);
					openResultDialog(container);
				}
			});
}

function performSearch(typeName, entities, v) {
	if (entities.length > 0) {
		var container = jQuery('#image_container');
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

function openResultDialog(results) {

	var parentElement = jQuery('#wrapper');
	var left = parentElement.offset().left + parentElement.outerWidth() + 30;
	var top = parentElement.offset().top;

	results.dialog({
		title : 'Image search results',
		autoOpen : false,
		closeOnEscape : true,
		height : 530,
		maxHeight : 530,
		width : 540,
		maxWidth : 540,
		position : [ left, top ],
		resizable : false,
		close : function(event, ui) {
			results.empty();
		}
	});
	results.dialog('open');
}
