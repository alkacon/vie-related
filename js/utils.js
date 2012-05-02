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

function getAdditionalRules(vie) {
 	mapping = {
		'Work'              : 'CreativeWork',
		'Film'              : 'Movie',
		'TelevisionEpisode' : 'TVEpisode',
		'TelevisionShow'    : 'TVSeries', // not listed as equivalent class on dbpedia.org
		'Website'           : 'WebPage',
		'Painting'          : 'Painting',
		'Sculpture'         : 'Sculpture',
		'Event'             : 'Event',
		'SportsEvent'       : 'SportsEvent',
		'MusicFestival'     : 'Festival',
		'FilmFestival'      : 'Festival',
		'Place'             : 'Place',
		'Continent'         : 'Continent',
		'Country'           : 'Country',
		'City'              : 'City',
		'Airport'           : 'Airport',
		'Station'           : 'TrainStation', // not listed as equivalent class on dbpedia.org
		'Hospital'          : 'GovernmentBuilding',
		'Mountain'          : 'Mountain',
		'BodyOfWater'       : 'BodyOfWater',
		'Company'           : 'Organization',
		'Person'            : 'Person'
     };
			
	var additionalRules = new Array();
	for ( var key in mapping) {
		additionalRules.push(createSimpleRule(key, mapping[key], vie));
	}
	return additionalRules;
}

function createSimpleRule(key, value, vie) {
	var rule = {
			'left' : [ '?subject a dbpedia:' + key, '?subject rdfs:label ?label' ],
			'right' : function(ns) {
				return function() {
					return [ vie.jQuery.rdf.triple(this.subject.toString(), 'a', '<' + ns.base() + value + '>', {
						namespaces : ns.toObj()
					}), vie.jQuery.rdf.triple(this.subject.toString(), '<' + ns.base() + 'name>', this.label.toString(), {
						namespaces : ns.toObj()
					}) ];
				};
			}(vie.namespaces)
		};
	return rule;
}
