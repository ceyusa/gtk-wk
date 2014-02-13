window.Khan = window.Khan || {};
Khan = Khan || {};

(function (window, document, $) {
    "use strict";

    Khan.app = function () {
	var entries = [], player, lightBox, current = 0,
	
	instantiateLightBox = function () {
	    lightBox = new pf_js.util.LightBox({
		callbackContent: initPlayer,
		source: initLightbox,
	    });

	    lightBox.init();
	    lightBox.open(current, entries.length, entries);
	},

	initAppForPlayer = function () {
	    var tag = document.createElement('script'),
	    firstScriptTag = document.getElementsByTagName('script')[0];
	    
	    tag.src = "http://www.youtube.com/iframe_api";
	    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	    
	    window.onYouTubePlayerAPIReady = function () {
		instantiateLightBox();
	    };
	    
	    window.onPlayerReady = function(event) {
		event.target.playVideo();
	    }	
    
	},
	
	initLightbox = function (index) {
	    player = null;

	    $(".lightbox-left-arrow").html("<P>PREV</P>");
	    $(".lightbox-right-arrow").html("<P>NEXT</P>");
	    
	    return '<div class="lightbox-youtube"><div id="video-player"></div></div>';
	},

	initPlayer = function () {
	    if (window.YT) {
		player = new YT.Player('video-player', {
		    videoId: entries[current],
		    events: { 'onReady': onPlayerReady, }
		});

		current = current + 1;
	    }
	};
	
	return {
	    init: function (json) {
		entries = json;
		initAppForPlayer();
	    }
	};
    };

}(window, document, jQuery));

window.init_online = function(json) {
    var khan = new Khan.app();
    khan.init(json);
}
