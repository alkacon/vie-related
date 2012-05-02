function extractString(entity, attrs, lang) {
	if (entity && typeof entity !== "string") {
		var possibleAttrs = (_.isArray(attrs)) ? attrs : [ attrs ];
		for ( var p = 0; p < possibleAttrs.length; p++) {
			var attr = possibleAttrs[p];
			if (entity.has(attr)) {
				var value = entity.get(attr);
				if (entity.vie.jQuery.isArray(value) && value.length > 0) {
					for ( var i = 0; i < value.length; i++) {
						if (value[i].indexOf('@' + lang) > -1) {
							value = value[i];
							break;
						}
					}
					if (entity.vie.jQuery.isArray(value))
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
