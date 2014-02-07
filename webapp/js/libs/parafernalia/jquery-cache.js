window.Endless = window.Endless || {};
Endless.api = Endless.api || {};

(function(window, document, $) {

	Endless.api.Module = function() {
		var jsonObject = [],
			storageFile = "KhanAcademyPlaylists",
			node = {},
			renewCache = false,

		   init = function() {
				//load json based on browser's language
				var jsonPath = Localization.Dictionary.lang + "/playlists.json";
				storageFile = storageFile + '.'+Localization.Dictionary.lang

				CachePlaylist(helpers.fetchContent(jsonPath));

			},

			/* 
				@desc main method for khan playlist local storage
			*/
			CachePlaylist = function(subjects) {
				renewCache = localStorage.getItem(storageFile) === null ? true : false

				if (renewCache === true) {
					localStorage.setItem(storageFile, JSON.stringify(subjects));
				} else {
					refreshPlayList(subjects);
				}
			},

			/* 
				@desc method to refresh playlists on localstorage
			*/
			refreshPlayList = function(subjects) {
				// Only refresh playlist once per week
				var timer = localStorage.getItem('timer');
				if (!timer) 
				{
					timer = new Date();
					localStorage.setItem('timer', timer.toString());
				}
				else 
				{
					var now = new Date();
					timer = new Date(timer);
					timer.setDate(timer.getDate() + 7);
					if (now < timer) return false;
				}
				
				// Compares json and localstorage data and add new videos to localstorage
				var storage = JSON.parse(localStorage.getItem(storageFile));
				
				_.each(subjects, function(subject, subject_index)
				{
					if (subject.has_subcategories === "true") 
					{
						_.each(subject.subcategories, function(sub, sub_index)
						{
							_.each(sub.playlist, function(video, video_index)
							{
								if (!isVideoInArray(video.vid, storage[subject_index].subcategories[sub_index].playlist)) 
								{
									storage[subject_index].subcategories[sub_index].playlist.unshift(video);
								}
							});
						});
					}
					else 
					{
						_.each(subject.playlist, function(video, video_index)
						{
							if (!isVideoInArray(video.vid, storage[subject_index].playlist)) 
							{
								storage[subject_index].playlist.unshift(video);
							}
						});
					}
				});
				localStorage.setItem(storageFile, JSON.stringify(storage));
			},

			/* 
				@desc method to check if video is already on playlist
			*/
			isVideoInArray = function(vid, playlist) {
				var len = playlist.length;
				for (i = 0; i < len; i++)
					if (playlist[i]['vid'] == vid)
						return true;
				return false;
			},

			reloadData = function() {
				localStorage.removeItem(storageFile);
				init();
			},

			/* 
			 *
			 * Format received params to strictly use the format [ISO 639-1]-[ISO 3166-1] according to RFC 3066
			 *
			 */
			get_browser_language = function(default_language) {
				if (typeof(navigator.userLanguage) == "string") {
					return normalize_language(navigator.userLanguage);
				} else if (typeof(navigator.language) == "string") {
					return normalize_language(navigator.language);
				}

				//return default language if there's no language variable in browser'
				return default_language;
			},

			/* 
			 *
			 * Format received params to strictly use the format [ISO 639-1]-[ISO 3166-1] according to RFC 3066
			 *
			 */
			normalize_language = function(language_code) {
				var l = language_code,
					normalized_param = l[0].toLowerCase() + l[1].toLowerCase() + "-" + l[3].toUpperCase() + l[4].toUpperCase();

				return normalized_param;
			};

		return {

			init: function() {
				init();
			},

			reloadData: function() {
				reloadData();
			}
		};
	};
}(window, document, jQuery));