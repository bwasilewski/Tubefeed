(function ($) {
	"use strict";
	var obj = this,
		playerObj,								
		thumbsObj,
		paginationObj,
		dataUrl,
		updated,
		counter = 0,
		groupCounter = 0,
		viewCount = 0,
		searchMethod = 0,
		showRelated,
		autoPlay,
		enableJS,
		disableKB,
		enableEGM,
		fullScreen,
		enableHD,
		showSearch,
		showInfo,
		maxResults,
		matchArray = new Array(),
		videoArray = new Array(),
		data = new Object(),
		responseTags = new Object();
	
	$.fn.tubefeed = function (options) {	
		var defaults = {
			autoPlay : false,						// autoplay the video
			paginate : false,						// paginate results into divs
			itemsPerRow : null,						// number of video buttons that should appear per row
			startIndex : 1,							// index of video to start with
			maxResults : 50,						// maximum results to receive	
			playerID : 'ytPlayer',					// id of the div that gets replaced with the flash object
			thumbsID : 'ytThumbs',					// id of the div that gets populated with thumbnails
			paginationID : 'ytPagination',			// id of the div that contains the pagination controls
			playerOptions : {						
				disableKB : false,					// disable keyboard controls on player
				enableHD : true,					// enable hd option on player
				fullScreen : true,					// enable fullscreen option on player
				jsAPI : {
					enabled : false,				// allow javascript access to the player
					nextID : 'nextBtn',				// id of the link for "next" functionality
					prevID : 'prevBtn'				// id of the link for "previous" functionality
				},
				playerWidth : 640,					// width of the player
				playerHeight : 390,					// height of the player
				showRelated : true,					// show related videos at the end of a video
				useEGM : true,						// use enhanced genie mode (genie mode appears during playback when the video is moused over
				showSearch : false,					// show search bar at the end of a video
				showInfo : false,					// show info at the end of a video
				showTitle : false,					// show the title at the end of the video
				showDescription : false				// show the description at the end of the video
			},
			ids : [ ],								// specific id's of videos to receive
			tags : [ ],								// tags to search for within a user's feed
			playQueue : false,						// play the next video after the current video has finished
			userName : '',							// set the username of the user's feed you want	
			onComplete: function(userFunction) {
				if(userFunction !== undefined) {
					userFunction();
				}
			}
		};
		//this applies the user's settings (options) to the default value object (defaults)
		options = $.extend(defaults, options);
		playerObj = $('#' + options.playerID);										
		thumbsObj = $('#' + options.thumbsID);
		paginationObj = $('#' + options.paginationID);
		
		showRelated = (options.playerOptions.showRelated === true) ? 1 : 0;
		autoPlay = (options.autoPlay === true) ? 1 : 0;
		enableJS = (options.playerOptions.jsAPI.enabled === true) ? 1 : 0;
		disableKB = (options.playerOptions.disableKB === true) ? 1 : 0;
		enableEGM = (options.playerOptions.useEGM === true) ? 1 : 0;
		fullScreen = (options.playerOptions.fullScreen === true) ? 1 : 0;
		enableHD = (options.playerOptions.enableHD === true) ? 1 : 0;
		showSearch = (options.playerOptions.showSearch === true) ? 1 : 0;
		showInfo = (options.playerOptions.showInfo === true) ? 1 : 0;
		maxResults = (options.maxResults > 50) ? 50 : options.maxResults;
		
		// if no player div exists, create one
		if (playerObj.length === 0) { 
			appendPlayerDiv(this); 
		} else {
			playerObj.wrap('<div id="' + options.playerID + 'Wrapper"></div>');
			
		};
		
		// set height and width of video on video wrapping div
		$('#' + options.playerID + 'Wrapper').css("height", options.playerOptions.playerHeight);
		$('#' + options.playerID + 'Wrapper').css("width", options.playerOptions.playerWidth);
		
		// if no pagination div exists, create one
		if (paginationObj.length === 0 && options.paginate === true) { appendPaginationDiv(this) } ;
		// if no thumbnail div exists, create one
		if (thumbsObj.length === 0) { appendThumbDiv(this) };
		
		setSearchMethod();
		
		return this.each(function() {
			switch(searchMethod) {
				case "username" :
					dataUrl = "http://gdata.youtube.com/feeds/api/users/" 
						+ options.userName + "/uploads?v=2&alt=jsonc&start-index=" 
						+ options.startIndex + "&max-results="
						+ options.maxResults + "&callback=?";
						
					prepareBatchSearch(dataUrl);
					break;
				case "id" : 
					for(i = 0; i < options.ids.length; i++) {
						dataUrl = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=" 
							+ options.ids[i] + "&callback=?";	
							prepareBatchSearch(dataUrl);
					}
					
					break;
				case "tag" :
					dataUrl = "";
					
					prepareBatchSearch(dataUrl);
					break;
				case "multiple" :
					dataUrl = "http://gdata.youtube.com/feeds/api/users/" 
						+ options.userName + "/uploads?v=2&alt=jsonc&start-index="
						+ options.startIndex + "&max-results="
						+ options.maxResults + "&callback=?";
						
					prepareBatchSearch(dataUrl);
					break;
				case "none" :
					dataUrl = "";
					break;
			}
			
			$('#' + options.paginationID + ' li a').live('click', function() {
				//console.log('clicked');
				$('#' + options.paginationID + ' li a').removeAttr('class');
				$(this).attr('class', 'active');
				var theIndex = $(this).parent().index();
				$('div.group').css('display', 'none');
				$('div.group:eq(' + theIndex + ')').css('display', 'block');
				return false;
			});
			
			$('div.ytVideo').live('click', function() {
				loadYouTubeVideo($(this).attr('id'));
			});
		});
		
		function setSearchMethod() {
			if(options.userName === '' && options.ids.length === 0 && options.tags.length === 0) {
				searchMethod = "none";
			} else if(options.userName !== '' && options.ids.length === 0 && options.tags.length === 0) {
				searchMethod = "username";
			} else if(options.ids.length > 0 && options.userName === '' && options.tags.length === 0) {
				searchMethod = "id";
			} else if(options.tags.length > 0 && options.userName === '' && options.ids.length === 0) {
				searchMethod = "tag";
			} else {
				searchMethod = "multiple";
			}
		}
		
		function appendPlayerDiv(target) {
			target.append('<div id="' + options.playerID + 'wrapper" style="height: ' + options.playerOptions.playerHeight + 'px; width: ' + options.playerOptions.playerWidth + 'px;"><div id="' + options.playerID + '"></div></div>');
		}
		
		function appendThumbDiv(target) {
			target.append('<div id="' + options.thumbsID + '"></div>');
		}
		
		function appendPaginationDiv(target) {
			target.append('<ul id="' + options.paginationID + '"></ul>');
		}
		
		function prepareBatchSearch(url) {
			loadSWFObject();
			$.getJSON(url, function(data){
				processJSON(data.data);
			});
		}
		
		function prepareSingleSearch(url) {
			// search for id
		}
		
		function loadSWFObject() {
			if(typeof(swfobject) === 'undefined') {
				var head = document.getElementsByTagName('head')[0];
				var script = document.createElement('script');
				script.type = "text/javascript";
				script.src = "http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js";
				head.appendChild(script);
			}
		}
		
		function processJSON(data) {
			var idMatchPoints = 0;
			
			$.each(data.items, function(i, item) {
				if(searchMethod === "username") {
					//console.log("search method: username");
					matchArray.push(this);
				} else if(searchMethod === "id") {
						//console.log("search method: id");
						matchArray.push(this);
				} else if(searchMethod === "tag") {
					//console.log("search method: tag");
				} else if(searchMethod === "multiple") {
					//console.log("search method: multiple");
					if(options.tags.length > 0) {
						var responseTags = this.tags;
						var tagMatchPoints = 0;
						
						for(y = 0; y < options.tags.length; y++) {	
							if($.inArray(options.tags[y], responseTags) > -1) {
								tagMatchPoints++;
							} 
						}
						
						if(tagMatchPoints === options.tags.length) {
							matchArray.push(this);
						}
					} else {
						matchArray.push(this);	
					}
				} else if(searchMethod === "none") {
					//console.log("no search method");
				}
			});
			
			for(var x = 0; x < matchArray.length; x++) {
				getVideoData(matchArray[x]);
			}
			
			if(options.paginate === true) {
				$('div.group:gt(0)').css('display', 'none');
			}
			
			if(videoArray.length === 0) {
				//console.log("There are no matches!");
			} else {
				loadYouTubeVideo(videoArray[0]);
			}

			options.onComplete();
		}
		
		function getVideoData(obj) {
			viewCount = obj.viewCount;
			updated = obj.updated;
			var thumbUrl = obj.thumbnail.hqDefault;
			videoArray.push(obj.id);
			responseTags = obj.tags;
			//console.log(obj);
			
			if(obj.accessControl !== undefined && obj.accessControl.embed === 'denied') {
				// do nothing
			} else {
				$("#" + options.thumbsID).append('<div class="ytVideo" id="' + obj.id + '"></div>');
				$("div.ytVideo:last").append('<div class="imgWrap"><img src="' + thumbUrl + '" height="90" width="120" alt="" /></div>');
				
				$("div.ytVideo:last").append('<div class="videoInfo"><p class="title">' + obj.title + '</p><p class="viewCount">' + viewCount + ' Views</p></div>');
				
				counter++;

				if(counter % options.itemsPerRow === 0) {
					groupCounter++;
					//Wraps the last three div.ytVideo elements in a div.group
					$('#' + options.thumbsID + " > div.ytVideo").wrapAll('<div class="group clearfix"></div>');
					if(options.paginate === true) {
						$('#' + options.paginationID).append('<li><a href="#">' + groupCounter + '</a></li>');
					}
				}  else if(counter === matchArray.length) {
					groupCounter++;
					$("#" + options.thumbsID + " > div.ytVideo").wrapAll('<div class="group clearfix"></div>');
					
					if(options.paginate === true) {
						$('#' + options.paginationID).append('<li><a href="#">' + groupCounter + '</a></li>');
					}
				}
			}
			
			$('#' + options.paginationID).addClass("active");
		}

		function loadYouTubeVideo(videoID) {
			var theUrl = "http://www.youtube.com/v/" + videoID + "?f=user_uploads&app=youtube_data"+ "&rel=" + showRelated 
				+ "&autoplay=" + autoPlay 
				+ "&enablejsapi=" + enableJS
				+ "&disablekb=" + disableKB
				+ "&fs=" + fullScreen
				+ "&hd=" + enableHD
				+ "&showsearch=" + showSearch
				+ "&showinfo=" + showInfo;

			var flashvars = {};
			var params = {
				rel : showRelated,
				autoplay : autoPlay,
				enablejsapi : enableJS,
				playerapiid : videoID,
				disablekb : disableKB,
				fs : fullScreen,
				hd : enableHD,
				showsearch : showSearch,
				showinfo : showInfo,
				wmode : "opaque"
			};
			var attributes = {};

			swfobject.embedSWF(theUrl, options.playerID, options.playerOptions.playerWidth, options.playerOptions.playerHeight, "9.0.0","expressInstall.swf", flashvars, params, attributes);				
		}


		function reportComplete() {
			
		}

		function reportError(textStatus) {
			
		} 
	};
})(jQuery);
