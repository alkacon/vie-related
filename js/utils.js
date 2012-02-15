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