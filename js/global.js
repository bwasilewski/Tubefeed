if(typeof(console) === 'undefined') {
    var console = {}
    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
}

/* QUIZ VARS */
var quizUrl = "xml/questions.xml";
var currentQuestion = 1;
var xmlData;
var selected = false;
var positionArray = new Array("0px 25px", "0px 51px", "0px 78px", "0px 104px");
var currentVideo = "";
var thumbArray = new Array("AT001553_CRUZE_INTRO_VIDEO.jpg");
var thumbTitleArray = new Array("Intro");

/* YOUTUBE VARS */
//var youtubeUrl = "http://gdata.youtube.com/feeds/api/users/chevrolet/uploads?max-results=24";
var youtubeUrl = "xml/feed.xml";
var theId = '';
var theTitle = '';
var videoUrl = '';
var thumbUrl= '';
var counter = 0;
var groupCounter = 0;
var videoArray = new Array();
var ready = false;
var player = new Object();
var currentVideo = 0;
var videoId = 0;
var viewCount = 0;
var updated = '';

var currentVid = 'AT001553_CRUZE_INTRO_VIDEO.mp4';

preloadImages();
createSwf("flash", "AT001553_CRUZE_INTRO_VIDEO.mp4", "onVideoComplete");
loadQuizXML();
loadYouTubeXML();

if($("select#ddl_userMarket").length == 0) {
	$("body").css("overflow", "auto");
} else {
	$("body").css("overflow", "hidden");
	$("#container").css("height", $(window).height());
	$("div#pnl_getMarkets").css("height", $(window).height());
	$("div#pnl_getMarkets div").css("height", $(window).height());
}




if($("#uc_form_ValidationSummary1").text().replace(/ /g, '') == '') {
	$("#uc_form_ValidationSummary1").hide();
}

$("#uc_form_p_myForm br").remove();

$("#brc label#STATE_Text").parent("div.formP").addClass("small");
$("#brc label#ZIP_Text").parent("div.formP").addClass("small").addClass("zip");
$("#brc div.formP").slice(9, 14).wrapAll("<div class=\"formColumn second\"></div>");
$("#brc div.formP").slice(0, 9).wrapAll("<div class=\"formColumn\"></div>");


$("div#q1 a.enter").click(function() {
	displayQuestion(xmlData);
	return false;
});

$("div#interact a.enter").click(function() {
	animateOut();
	displayQuestion(xmlData);
	$("#videoOverlay").remove();
	return false;
});

$("div#q1 li").mouseover(function() {
	if(selected) {
	} else {
		$("div#q1 ol").css("background", "url(images/answer_bg.png) no-repeat");
		if($(this).index() == 0) {
			$("div#q1 ol").css("background-position", positionArray[0]);
		} else if($(this).index() == 1) {
			$("div#q1 ol").css("background-position", positionArray[1]);
		} else if($(this).index() == 2) {
			$("div#q1 ol").css("background-position", positionArray[2]);
		} else if($(this).index() == 3) {
			$("div#q1 ol").css("background-position", positionArray[3]);
		}
	}
}); 

$("div#q1 ol").mouseout(function() {
	if(selected) {
	} else {
		$("div#q1 ol").css("background-image", "none");
	}
});

$("div#q1 li").click(function() {
	if(selected) {
	} else {
		selected = true;
		$("div#q1 a.next").css("display", "block");
		if($(this).hasClass("correct")) {
			$("div#q1 ol").css({
				"background" : "url(images/answer_correct_bg.png) no-repeat",
				"backgroundPosition" : positionArray[$(this).index()]
			});
		} else {
			$("div#q1 ol").css({
				"background" : "url(images/answer_correct_bg.png) no-repeat",
				"backgroundPosition" : positionArray[$(".correct").index()]
			});
		}
	}
});

$("div#q1 a.next").click(function() {
	selected = false;
	$("div#q1 ol").css("background-image", "none");
	$("div#q1 ol li").removeClass("correct");
	$(this).fadeOut('fast');
	displayQuestion(xmlData);
	return false;
});

$("#ytPagination li a").live('click', function() {
	$("#ytPagination li a").removeClass("active");
	$(this).addClass("active");
	var theIndex = $(this).parent().index();
	$("div.group").css("display", "none");
	$("div.group:eq(" + theIndex + ")").css("display", "block");
	return false;
}); 

$("#ytPagination a.next").click(function() {
	var indicator = 0;
	$("#ytRotator").find("div.group").each(function() {
		if($(this).attr("style") == "display: block;") {
			indicator = $(this).index();
		} 
	});
	if(indicator == $("div.group").size() - 1) {
	} else {
		$("div.group").attr("style", "");
		$("div.group:eq(" + (indicator + 1) + ")").attr("style", "display: block");
	}
	return false;
});

$("#ytPagination a.prev").click(function() {
	var indicator = 0;
	$("#ytRotator").find("div.group").each(function() {
		if($(this).attr("style") == "display: block;") {
			indicator = $(this).index();
		} 
	});
	if(indicator == 0) {
	} else {
		$("div.group").attr("style", "");
		$("div.group:eq(" + (indicator - 1) + ")").attr("style", "display: block");
	}
	return false;
});

$("div.ytVideo").live('click', function() {
	loadYouTubeVideo('http://www.youtube.com/v/' + $(this).attr('id') + '?f=user_uploads&app=youtube_gdata&enablejsapi=1&autoplay=1');
});

$("#videoOverlay a").live('click', function() {
	var thisVid = $(this).find("img").attr("src");
	thisVid = thisVid.replace("images/", "");
	thisVid = thisVid.replace(".jpg", ".mp4");
	createSwf("flash", thisVid, "onVideoComplete");
	$("#videoOverlay").css("display", "none");
	return false;
});

//$("input#uc_form_cb_moreInfo").click

function loadQuizXML() {
	$.ajax({
		type: "GET",									// The request type. Can also be "POST"
		url: quizUrl,									// Location of the xml
		dataType:($.browser.msie) ? "text" : "xml",		// If IE, grab data as text instead of xml
		success: processQuizXML,						// Function to run on success
		complete: reportComplete,						// Function to run on complete
		error: reportError,								// Function to run on error
		cache: false,									// Prevents caching of the page
		timeout: 5000									// Time limit for the call
	});
}

function processQuizXML(data) {
	if($.browser.msie) {
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.loadXML(data);
		data = xmlDoc;
	}
	
	xmlData = data;
	
	$(data).find("question").each(function() {
		var thumb = $(this).find("video").attr("thumb");
		var thumbTitle = $(this).find("video").attr("title");
		thumbTitleArray.push(thumbTitle);
		thumbArray.push(thumb);
	});
	
	setupVideoOverlay();
}

function loadYouTubeXML() {
	$.ajax({
		type: "GET",									// The request type. Can also be "POST"
		url: youtubeUrl,										// Location of the xml
		dataType:($.browser.msie) ? "text" : "xml",		// If IE, grab data as text instead of xml
		success: processYouTubeXML,							// Function to run on success
		complete: reportComplete,						// Function to run on complete
		error: reportError,								// Function to run on error
		cache: false,									// Prevents caching of the page
		timeout: 5000									// Time limit for the call
	});
}

function processYouTubeXML(data) {
	
	if($.browser.msie) {
		var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.loadXML(data);
		data = xmlDoc;
	}
	
	$(data).find('entry').each(function() {
		counter++;
		theId = $(this).find('id').text();
		theId = theId.substr(theId.lastIndexOf("/") + 1, theId.length);
		theTitle = $(this).find('title:first').text();	
		viewCount = $(this).find('[nodeName=yt:statistics]').attr('viewCount');
		updated = String($(this).find('updated').text());
		
		$("#ytRotator").append("<div class=\"ytVideo\" id=\"" + theId + "\"></div>");
		
		$(this).find('[nodeName=media:group]').each(function() {
			$(this).find('[nodeName=media:content]').each(function() {
				if($(this).attr('type') == 'application/x-shockwave-flash') {
					videoUrl = $(this).attr('url') + "&enablejsapi=1";
				}
			});

			$(this).find('[nodeName=media:thumbnail]:eq(2)').each(function() {
				thumbUrl = $(this).attr('url');
				$("div.ytVideo:last").append("<div class=\"imgWrap\"><img src=\"" + thumbUrl + "\" height=\"90\" width=\"120\" alt=\"\" /></div>");
			});

			videoArray.push(videoUrl);
		});
		
		//Adds all info to the div.ytVideo
		$("div.ytVideo:last").append("<div class=\"videoInfo\"><h3>" + theTitle + "</h3><p class=\"viewCount\">" + viewCount + " Views&nbsp;&nbsp;-</p><p class=\"updated\">" + $.timeago(updated) + "</p></div>");
		
		if(counter % 4 === 0) {
			groupCounter++;
			//Wraps the last three div.ytVideo elements in a div.group
			$("div.ytVideo").slice($("div.ytVideo").size() - 4, $("div.ytVideo").size()).wrapAll("<div class=\"group\"></div>");
			$("#ytPagination ul").append("<li><a href=\"#\">" + groupCounter + "</a></li>");
		}
	});

	$("div.group:first").css("display", "block");
	
	loadYouTubeVideo(videoArray[0]);
}



function displayQuestion(xmlData) {
	if(currentQuestion < 5) {
		var theAnswers = new Array();
		$(xmlData).find('question').each(function() {
			if ($(this).attr('id') == currentQuestion) {
				var theTitle = $(this).find('title').text();
				var theVideo = String($(this).find('video').attr('src'));
				$("div#q1 h2").text("Question " + currentQuestion);
				$("div#q1 div.copy p").text(theTitle);
				$(this).find('options').each(function() {
					$(this).find('option').each(function() {
						var index = $(this).index();
						if($(this).attr("answer") == "true") {
							$("div#q1 ol li:eq(" + index + ") span").text($(this).text());	
							$("div#q1 ol li:eq(" + index + ")").addClass("correct");
						} else {
							$("div#q1 ol li:eq(" + index + ") span").text($(this).text());	
						}	
					});
				});
				createSwf("flash2", theVideo);
			}
		});
		
		currentQuestion++;
	} else if(currentQuestion == 5) {
		swfobject.removeSWF("flash2");
		$("div#q1").fadeOut('fast', function() {
			$("div#brc").fadeIn('fast');
		});
	}
}

function createSwf(divName, videoSrc, onComplete) {
	//Set Flashvars
	var flashvars = {}
		flashvars.xmlPath = "xml/";
		flashvars.xmlFile = "config.xml";
		flashvars.videoFile = videoSrc;
		flashvars.stillFile = "AT001548H_PERFORMANCE_1_replay.jpg";
		flashvars.jsOnComplete = onComplete;

	//Set Params	
	var params = {}
		params.allowFullScreen = "true";
		params.bgcolor = "#000000";
		params.wmode = "transparent";

	//Embed Flash
	swfobject.embedSWF("swfs/videoPlayer.swf", divName, "480", "270", "9.0.115", "swfs/expressInstall.swf", flashvars, params);
	currentVid = videoSrc;
}

function onVideoComplete() {
	$("#videoOverlay").css("display", "block");
	
	/* var newVidArray = videoArray;
	newVidArray.splice(0, 0, ""); */
}

function setupVideoOverlay() {
	for(y = 0; y <= thumbArray.length - 1; y++) {
		if(thumbArray[y].replace(".jpg", ".mp4") != currentVid) {
			$("div#videoOverlay div").append("<a href=\"#\"><img src=\"images/" + thumbArray[y] + "\" height=\"70\" width=\"125\" alt=\"\" /><h4> " + thumbTitleArray[y] + "  </h4></a>");
		} else {
			$("div#videoOverlay div").append("<a style=\"display: none;\" href=\"#\"><img src=\"images/" + thumbArray[y] + "\" height=\"70\" width=\"125\" alt=\"\" /><h4> " + thumbTitleArray[y] + "  </h4></a>");
		}
	}
}

function loadYouTubeVideo(target) {
	var flashvars = {};
	var params = {
		allowScriptAccess: "always"
	};
	var attributes = {};
	
	swfobject.embedSWF(target, "ytPlayer", "640", "385", "9.0.0","expressInstall.swf", flashvars, params, attributes);
}

function animateOut() {
	$("img.car").fadeOut('fast');	
	$("img.challengeLogo").fadeOut('fast');
	$("div.video").fadeOut('fast');	
	$("p.contestIntro").fadeOut('fast', function() {
		$("div#screen1").fadeOut('fast', function() {
			$("div#q1").fadeIn('fast', function() {
				//createSwf("flash2", "demo.flv");
			});
		});
	});
}

function preloadImages() {
	var imageObj = new Image();
	var images = new Array();
	images[0] = "images/nextButton.png";
	images[1] = "images/interact_sceen2_bg.jpg";
	images[2] = "images/answer_correct_bg.png";
	images[3] = "images/answer_incorrect_bg.png";
	images[4] = "images/interact_sceen3_bg.jpg";
	
	for(var i=0; i<=5; i++) {
		imageObj.src = images[i];
	}
}

function reportComplete() {
	//alert("complete!");
}

function reportError(textStatus) {
	/*
	This function is passed three arguments:
		XMLHttpRequest, (the XMLHttpRequest object)
		textStatus, 	(text string of the error type)
		errorThrown		(exception object)
	*/
	//alert(textStatus);
}



