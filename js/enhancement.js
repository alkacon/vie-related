function enhance(con) {
	
	// Add you own code to execute something on click
	var v = new VIE();
	v.types
	v.loadSchemaOrg();
	v.use(new v.StanbolService({url: "http://dev.iks-project.eu/stanbolfull"}));
	v.analyze({element: jQuery(con)}).using('stanbol').execute().done(function(entities) {
		persons = new Array();
		places = new Array();
		organizations = new Array();
		var count = 0;
		_.each(entities, function(entity) {
			if (entity.isof("Person")) {
				persons.push(entity);
				count++;
			} else if (entity.isof("Place")) {
				places.push(entity);
				count++;
			} else if (entity.isof("Organization")) {
				organizations.push(entity);
				count++;
			}
	    });
		
		jQuery('#image_container').empty();
		if (count == 0){
			jQuery('#image_container').append("<p><b>No Persons or Places found.</b></p>")
		} else {
			goods = [ persons, places, organizations ];
			imageSearch(v, goods);
		}
	});
	// this.execCommand("mceInsertContent",false,'<b>Test</b>');
}

function imageSearch(v, goods) {
	
	var count = 0;
	
	for (var i = 0; i < goods.length; i++) {
		currEntities = goods[i];
		if (currEntities.length > 0) {
			if (i == 0) {
				// persons
				jQuery("#image_container").append("<p><b>Persons:</b></p>")
			}else if (i ==1) {
				// places
				jQuery("#image_container").append("<p><b>Places:</b></p>")
			}else if (i ==2) {
				// organizations
				jQuery("#image_container").append("<p><b>Organizations:</b></p>")
			}
			for (var j = 0; j < currEntities.length; j++) {

				var cntId = "imgCnt_" + count;
				count++;
				jQuery('#image_container').append('<div id="' + cntId + '"></div>');
				// set-up of the Image-widget
		        jQuery("#" + cntId).vieImageSearch({
		            vie    : v,
					// render : function(data) { // render images }
		            bin_size: 4,
		            services : {
		                flickr : {
		                    api_key : "ffd6f2fc41249feeddd8e62a531dc83e",
		                	use: false
		                },
		                gimage : {
		                    use: true
		                }
		            }
		        });
		        var name = extractString(currEntities[j], ["rdfs:label", "name"], "en");
		        jQuery("#" + cntId).append("<p>" + name + "</p>");
				jQuery("#" + cntId).vieImageSearch({
					entity : currEntities[j].getSubject() // uri
				});
			}
		}
	}
}

function extractString (entity, attrs, lang) {
    if (entity && typeof entity !== "string") {
        var possibleAttrs = (_.isArray(attrs))? attrs : [ attrs ];
        for (var p = 0; p < possibleAttrs.length; p++) {
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
                    if (jQuery.isArray(value)) // <-- if it is *still* an array, your language was not found, hence, return undefined
                        value = undefined; // just take the first
                }
                value = (value)? value.replace(/"/g, "").replace(/@[a-z]+/, '').trim() : value;
                return value;
            }
        }
    }
    return undefined;
}
