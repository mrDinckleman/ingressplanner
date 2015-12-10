/*
	gameworld module
*/

ingressplanner.gameworld = new (function() {

	// private vars & functions

	var portals =  {};
	var portalsByllstring = {};

	var links = {};
	var linksByPortalLLstring = {};

	var fields = {};
	var fieldsByPortalLLstring = {};

	function teamName(fromiitc,what)
	{
	    var internal = fromiitc;

	    switch (fromiitc)
	    {
	        case 'E':
	        case 'ENLIGHTENED':
	            internal = 'ENLIGHTENED';
	            break;

	        case 'R':
	        case 'RESISTANCE':
	            internal = 'RESISTANCE';
	            break;

	        case 'N':
	        case 'NEUTRAL':
	            internal = 'NEUTRAL';
	            break;

	        default:
	        	ingress.error('unknown '+what+' team "'+fromiitc+'"');
	            break;
	    }

	    return internal;

	};

	function loadData(data)
	{
		var updateMap = false;

		if (typeof data.links != 'undefined')
		{
			$.each(data.links, function(linkIDX, link) {
				addLink(link);
				updateMap = true;
			});
			
		}

		if (typeof data.fields != 'undefined')
		{
			$.each(data.fields, function(fieldIDX, field) {
				addField(field);
				updateMap = true;
			});
		}

		if (typeof data.portals != 'undefined')
		{
			$.each(data.portals, function(portalIDX,portal) {
				addPortal(portal);
				updateMap = true;
			});
		}

		return updateMap;
	};

	function addLink(link)
	{

		link.teamDECODED = teamName(link.team,'link');
		link.llstring = ingressplanner.utils.llstring(link._latlngsinit,true);

		links[link.guid] = link;

		$.each(link.llstring.split('|'), function(index, portalLLstring) {

			if (typeof linksByPortalLLstring[portalLLstring] == 'undefined')
			{
				linksByPortalLLstring[portalLLstring] = [];
			}

			if (linksByPortalLLstring[portalLLstring].indexOf(link.guid)==-1)
			{
				linksByPortalLLstring[portalLLstring].push(link.guid);
			}
				
		});

	};

	function addField(field)
	{

		field.teamDECODED = teamName(field.team,'field');
		field.llstring = ingressplanner.utils.llstring(field._latlngsinit,true);
		fields[field.guid] = field;

		$.each(field.llstring.split('|'), function(index, portalLLstring) {

			if (typeof fieldsByPortalLLstring[portalLLstring] == 'undefined')
			{
				fieldsByPortalLLstring[portalLLstring] = [];
			}

			if (fieldsByPortalLLstring[portalLLstring].indexOf(field.guid)==-1)
			{
				fieldsByPortalLLstring[portalLLstring].push(field.guid);
			}

		});

	};

	function addPortal(portal)
	{

		portal.teamDECODED = teamName(portal.team,'portal');
		portal.llstring = ingressplanner.utils.llstring(portal.latlng);

		if (typeof portals[portal.guid] != 'undefined')
		{
			$.each(Object.keys(portal), function(index, propertyName) {
				 if (
				 	typeof portal[propertyName] == 'undefined'
				 	&& typeof portals[portal.guid][propertyName] != 'undefined'
				 )
				 {
				 	portal[propertyName] = portals[portal.guid][propertyName];
				 }
			});
		}

		portals[portal.guid] = portal;
		portalsByllstring[portal.llstring] = portal.guid;

		var portal_links = [];

		$.each(['in','out'], function(dummyIDX1, direction) {
			$.each(portal.links[direction], function(dummyIDX2, linkguid) {
				portal_links.push(linkguid);
			});
		});

		if (typeof linksByPortalLLstring[portal.llstring] != 'undefined')
		{

			$.each(linksByPortalLLstring[portal.llstring], function(index, linkguid) {
				 if (portal_links.indexOf(linkguid)==-1)
				 {
					 	delete links[linkguid];
				 }
			});
		}
		linksByPortalLLstring[portal.llstring] = portal_links;

		if (typeof fieldsByPortalLLstring[portal.llstring] != 'undefined')
		{
			$.each(fieldsByPortalLLstring[portal.llstring], function(index, fieldguid) {
				 if (portal.fields.indexOf(fieldguid)==-1)
				 {
					 	delete fields[fieldguid];
				 }
			});

		}
		fieldsByPortalLLstring[portal.guid] = portal.fields;

	};

	var router = L.Routing.osrm();

	var routes = {};

	if(typeof(Storage) !== "undefined") 
	{
		var gwCache = sessionStorage.getItem('gameworld');
    	if (gwCache)
    	{
    		gwCache = JSON.parse(gwCache);
    		loadData(gwCache);
    	}

		var routesCache = sessionStorage.getItem('routes');
    	if (routesCache)
    	{
    		$.each(JSON.parse(routesCache), function(hash, coords) {
    			 routes[hash] = $.map(coords, function(coord) {
    			 	return L.latLng(coord);
    			 });
    		});
    	}

	}
	else
	{
	    ingressplanner.warn('No HTML5 Web Storage available');
	};

	return {

		addRoutePoly: function(fromHash,toHash,layer,options)
		{
			var hash = [fromHash,toHash].join('|');

			if (typeof routes[hash]=='undefined')
			{

				router.route(
					[
						new L.Routing.Waypoint(L.latLng(fromHash.split(','))),
						new L.Routing.Waypoint(L.latLng(toHash.split(',')))
					],
					function(err,route) {

						var coords = null;
						if (err)
						{
							ingressplanner.warn('Route',hash,'error',err);
							coords = [fromHash.split(','),toHash.split(',')];
						}
						else
						{
							routes[hash] = route[0].coordinates;
							coords = routes[hash];
							sessionStorage.setItem('routes',JSON.stringify(routes));
						}

						layer.addLayer(L.polyline(coords,options));

					},
					null,
					{
						geometryOnly: true
					}
				);
			}
			else
			{
				layer.addLayer(L.polyline(routes[hash],options));
			}

		},

		Now: function()
		{
			return {
				links: links,
				fields: fields,
			}
		},

		portalGUIDByllstring: function(llstring)
		{
			if (
                typeof portalsByllstring[llstring] != 'undefined'
            )
			{
				return portalsByllstring[llstring];
			}
			return false;
		},

		getPortalByllstring: function(llstring)
		{
			var guid = ingressplanner.gameworld.portalGUIDByllstring(llstring);
			if (guid)
			{
				return portals[guid];
			}
			return false;
		},

		portalsInRanges: function(ranges, progressCallBack,doneCallBack)
		{
			var inRanges = {};

			var guids = Object.keys(portals);
			var total = guids.length;

			var portalIdx = 0;
	    	progressCallBack(portalIdx,total);

	    	(function checkLoop() {

	    		var guid = guids[portalIdx];
	    		var portal = portals[guid];

				if (typeof inRanges[guid] == 'undefined')
				{
					$.each(ranges, function(index, range) {

						switch(range.type)
						{
							case 'circle':
								var target = portal.llstring.split(',');
		                        // Spherical Law of Cosines - from http://www.movable-type.co.uk/scripts/latlong.html
		                        var φ1 = ingressplanner.utils.toRad(range.latLng.lat), 
		                        	φ2 = ingressplanner.utils.toRad(target[0]), 
		                        	Δλ = ingressplanner.utils.toRad(target[1]-range.latLng.lng), 
		                        	R = 6371000; // gives d in metres

		                        distance = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;

		                        if (distance <= range.radius)
		                        {
		                        	inRanges[guid] = portal;
		                        	return true;
		                        }
								break;

							case 'polygon':
								if (ingressplanner.utils.portalInPolygon(portal.llstring,range.latLngs))
								{
		                        	inRanges[guid] = portal;
		                        	return true;
								}
								break;


							default:
								ingressplanner.error('portalsInRanges() unmanaged range type',range);
								break;
						}
					});				 

				}

	    		portalIdx++;
	    		progressCallBack(portalIdx,total);

	    		if (portalIdx < total)
	    		{
	    			setTimeout(checkLoop, 0);
	    		}
	    		else
	    		{
	    			doneCallBack(
	    				$.map(inRanges, function(portal) {
							return portal;
						})
					)
	    		}

	    	})();

		},

		hashToNames: function(hash)
		{
			if (typeof hash == 'string')
			{
				hash = hash.split('|');
			}
		    return $.map(hash, function(item, index) {
		        var name = item;
		        if (
		            typeof portalsByllstring[item] != 'undefined'
		            && typeof portals[portalsByllstring[item]] != 'undefined'
		            && typeof portals[portalsByllstring[item]].title != 'undefined'
		        )
		        {
		            name = portals[portalsByllstring[item]].title;
		        }
		        return name;
		    }).join('-');
		},

		normalizeTeamName: function(fromiitc,what)
		{
			return teamName(fromiitc,what);
		},

		updateKeys: function(data)
		{

	        if (typeof portals[data.guid] != 'undefined')
	        {
	            portals[data.guid].keys = data.count;
	        }

		},

		update: function(data)
		{

			var updateMap = loadData(data);

			if (updateMap && typeof(Storage) !== "undefined") 
			{

				sessionStorage.setItem('gameworld',JSON.stringify({
					portals: portals,
					links: links,
					fields: fields,
				}));
			}

			return updateMap;
		
		},

		dataProvider: function() {
			return ingressplanner.utils.heredoc(function(){/*
({
    links: $.map(window.links,function(link,guid) {
        return {
            team:           link.options.data.team,
            _latlngsinit:   link._latlngsinit,
            guid:           guid
        };
    }),

    fields: $.map(window.fields, function(field,guid) {
        return {
            team:           field.options.data.team,
            _latlngsinit:   field._latlngsinit,
            guid:           guid,
            points:         field.options.data.points,
        };
    }),

    portals: $.map(window.portals,function (val,i) { 
    	return {
            latlng:     val._latlng,
            guid:       val.options.guid,
            title:      val.options.data.title,
            team:       val.options.data.team,
            level:      val.options.data.level,
            health:     val.options.data.health,
            resCount:   val.options.data.resCount,
            fields:     window.getPortalFields(val.options.guid),
            links:      window.getPortalLinks(val.options.guid),
            keys:       plugin.keys.keys[val.options.guid] || 0,
            image:      val.options.data.image
    	}; 
    })
})
*/})
		}

	}
})
