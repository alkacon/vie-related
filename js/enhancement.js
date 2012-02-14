function enhance(con) {
	v = new VIE();
	v.namespaces.base("http://schema.org/");
	v.loadSchema("http://schema.rdfs.org/all.json", {
		baseNS : "http://schema.org/",
		success : function() {
			onSchemaLoadSuccess();
		},
		error : function(msg) {
			console.warn(msg);
		}
	});

	function onSchemaLoadSuccess() {
		var stanbol = new v.StanbolService({
			url : [ "http://dev.iks-project.eu/stanbolfull", "http://dev.iks-project.eu:8080" ],
			enhancerUrlPostfix : "/enhancer/chain/dbpedia-keyword"
		});
		v.use(stanbol);
		stanbol.rules = jQuery.merge(stanbol.rules, getAdditionalRules(stanbol));
		v.analyze({
			element : jQuery(con)
		}).using('stanbol').execute().done(function(entities) {
			persons = new Array();
			cities = new Array();
			places = new Array();
			organizations = new Array();
			events = new Array();
			movies = new Array();
			var count = 0;
			_.each(entities, function(entity) {
				if (!entity.has('http://www.w3.org/2000/01/rdf-schema#label')) {
					return;
				}
				if (entity.isof("Person")) {
					persons.push(entity);
					count++;
				} else if (entity.isof("City")) {
					cities.push(entity);
					count++;
				} else if (entity.isof("Place")) {
					places.push(entity);
					count++;
				} else if (entity.isof("Organization")) {
					organizations.push(entity);
					count++;
				} else if (entity.isof("Event")) {
					events.push(entity);
					count++;
				} else if (entity.isof("Movie")) {
					movies.push(entity);
					count++;
				}
			});
			jQuery('#image_container').empty();
			if (count == 0) {
				jQuery('#image_container').append("<p><b>No Persons or Places found.</b></p>")
			} else {
				goods = [ persons, cities, places, organizations, events, movies ];
				imageSearch(v, goods);
			}
		});
	}
	;
}

function imageSearch(v, goods) {

	var count = 0;
	for ( var i = 0; i < goods.length; i++) {
		currEntities = goods[i];
		if (currEntities.length > 0) {
			if (i == 0) {
				// persons
				jQuery("#image_container").append("<p><b>Persons:</b></p>")
			} else if (i == 1) {
				// places
				jQuery("#image_container").append("<p><b>Cities:</b></p>")
			} else if (i == 2) {
				// places
				jQuery("#image_container").append("<p><b>Places:</b></p>")
			} else if (i == 3) {
				// organizations
				jQuery("#image_container").append("<p><b>Organizations:</b></p>")
			} else if (i == 4) {
				// events
				jQuery("#image_container").append("<p><b>Events:</b></p>")
			} else if (i == 5) {
				// movies
				jQuery("#image_container").append("<p><b>Movies:</b></p>")
			}
			for ( var j = 0; j < currEntities.length; j++) {
				var cntId = "imgCnt_" + count;
				count++;
				jQuery('#image_container').append('<div id="' + cntId + '"></div>');
				// set-up of the Image-widget
				jQuery("#" + cntId).vieImageSearch({
					vie : v,
					// render : function(data) { // render images }
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
				var name = extractString(currEntities[j], [ "rdfs:label", "name" ], "en");
				jQuery("#" + cntId).append("<p>" + name + "</p>");
				jQuery("#" + cntId).vieImageSearch({
					entity : currEntities[j].getSubject()
				});
			}
		}
	}
}

function extractString(entity, attrs, lang) {
	if (entity && typeof entity !== "string") {
		var possibleAttrs = (_.isArray(attrs)) ? attrs : [ attrs ];
		for ( var p = 0; p < possibleAttrs.length; p++) {
			var attr = possibleAttrs[p];
			if (entity.has(attr)) {
				var value = entity.get(attr);
				if (jQuery.isArray(value) && value.length > 0) {
					for ( var i = 0; i < value.length; i++) {
						if (value[i].indexOf('@' + lang) > -1) {
							value = value[i];
							break;
						}
					}
					if (jQuery.isArray(value))
						// if it is still an array, your language was not found
						value = undefined;
				}
				value = (value) ? value.replace(/"/g, "").replace(/@[a-z]+/, '').trim() : value;
				return value;
			}
		}
	}
	return undefined;
}

function getAdditionalRules(service) {
	var res = [
	// rule(s) to transform a dbpedia:Company into a VIE:Organization
	{
		'left' : [ '?subject a dbpedia:Company', '?subject rdfs:label ?label' ],
		'right' : function(ns) {
			return function() {
				return [ jQuery.rdf.triple(this.subject.toString(), 'a', '<' + ns.base() + 'Organization>', {
					namespaces : ns.toObj()
				}), jQuery.rdf.triple(this.subject.toString(), '<' + ns.base() + 'name>', this.label, {
					namespaces : ns.toObj()
				}) ];
			};
		}(service.vie.namespaces)
	},
	// rule(s) to transform a dbpedia:Event into a VIE:Event
	{
		'left' : [ '?subject a dbpedia:Event', '?subject rdfs:label ?label' ],
		'right' : function(ns) {
			return function() {
				return [ jQuery.rdf.triple(this.subject.toString(), 'a', '<' + ns.base() + 'Event>', {
					namespaces : ns.toObj()
				}), jQuery.rdf.triple(this.subject.toString(), '<' + ns.base() + 'name>', this.label.toString(), {
					namespaces : ns.toObj()
				}) ];
			};
		}(service.vie.namespaces)
	},
	// rule(s) to transform a dbpedia:Film into a VIE:Movie
	{
		'left' : [ '?subject a dbpedia:Film', '?subject rdfs:label ?label' ],
		'right' : function(ns) {
			return function() {
				return [ jQuery.rdf.triple(this.subject.toString(), 'a', '<' + ns.base() + 'Movie>', {
					namespaces : ns.toObj()
				}), jQuery.rdf.triple(this.subject.toString(), '<' + ns.base() + 'name>', this.label.toString(), {
					namespaces : ns.toObj()
				}) ];
			};
		}(service.vie.namespaces)
	}, ];
	return res;
}
