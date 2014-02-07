/*
@codekit-prepend "libs/external/jquery.min.js", "libs/external/underscore.min.js", "libs/external/handlebars.min.js", "libs/parafernalia/pf_lightbox.js", "libs/parafernalia/dictionary.js", "libs/parafernalia/jquery-cache.js", "libs/external/videosub.js"
*/

/* global Endless, Handlebars, Localization, pf_js, _, YT, onYouTubePlayerAPIReady */
window.Endless = window.Endless || {};
Endless.app = Endless.app || {};

(function (window, document, $) {
	// "use strict";

	Endless.app.Module = function () { // BOF PRIVATE SECTION

		var $main_disciplines = $("#main-disciplines"),
			$main_wrapper = $('#main-wrapper'),
			$header_top = $("#header-top"),
			$input_search = $(".input-search"),
			$header_slogan = $('#header-slogan'),
			$icon_search = $(".icon-search"),
			$close_search = $(".close-search"),
			template_with_subcat,
			template_without_subcat,
			template_sublist = Handlebars.compile($("#sublist").html()),
			dataJson = {},
			player,
			entries = [],
			contentTitleVideo,
			contentIdVideo,
			total_watched_videos = 0,
			query = "",
			totalDisciplines,
			arrayAllDisciplines,
			stylesForDisciplines = [],
			$main_discipline_clicked,
			indexCurrentColumnClicked,
			indexCurrentSubcategoryClicked,
			t = Localization.Dictionary.t,
			total_videos_playlist = 0,
			$element_video_clicked,
			elementFocusOut = false,
			$loading = $("#loading-wheel"),

			loadTranslations = function () {
				$input_search.attr('placeholder', t('_search_placeholder'));
				$header_slogan.text(t('_slogan'));
				$icon_search.text(t('_search'));
				$close_search.text(t('_close'));
			},

			/*
			 * @desc instantiate lightbox
			 */
			instantiateLightBox = function () {
				var lightBox,
					videosList,
					allVideos;

				lightBox = new pf_js.util.LightBox({
					callbackContent: initPlayer,
					// callbackContent: window.videosub_main,
					source: initLightbox,
					resize: null,
					imageResize: true
				});
				videosList = $('.list-videos-youtube li');
				allVideos = $('.btn-all-videos');

				lightBox.init();

				videosList.off('click').on('click', function () {
					if (!navigator.onLine) {
						alert(t('_online'));
						return false;
					}
					$element_video_clicked = $(this);
					lightBox.open(videosList.index($(this)), videosList.length);
					elementFocusOut = true;
				});

				allVideos.off('click').on('click', function () {
					if (!navigator.onLine) {
						alert(t('_online'));
						return false;
					}
					lightBox.open(getVideoIndex($(".sublist-content ul li:first-child")), videosList.length);
				});
			},
			/*
			 * @desc bind events all over UI elements
			 */
			bindEvents = function () {

				$(window).resize(resizeApp);

				//when clicked in subcategory open list with videos of subcategory
				$main_disciplines.on("click", ".link-subcategories", function () {
					$(".discipline").addClass("not-clicked");
					$main_discipline_clicked = $(this).closest(".discipline");
					$main_discipline_clicked.removeClass("not-clicked");
					indexCurrentColumnClicked = $main_discipline_clicked.data("index");
					indexCurrentSubcategoryClicked = $(this).data("subcategory");
					reloadData();
					var data = dataJson[indexCurrentColumnClicked].subcategories[indexCurrentSubcategoryClicked];

					$main_disciplines.addClass("open-animation");
					$main_discipline_clicked.addClass("sublist-open");

					resizeColumnsWithClick();
					buildSubCategories(data, query);
					elementFocusOut = true;
				});

				//hover for others columns of animation
				$main_disciplines.on({
					mouseenter: function () {
						//$(this).css("-webkit-filter", "grayscale(0%)");
						$(this).children().hide();
					},
					mouseleave: function () {
						//$(this).css("-webkit-filter", "grayscale(100%)");
						$(this).children().show();
					}
				}, '.not-clicked');

				//click in other columns close column open
				$main_disciplines.on("click", ".not-clicked", function () {
					$(".discipline").children().show();
					$(".discipline").removeClass("not-clicked sublist-open");
					$main_disciplines.removeClass("open-animation");
					$(".discipline").each(function (i) {
						$(this).attr("style", stylesForDisciplines[i]);
					});
					resizeApp();
				});

				//click in button close sub-category 
				$main_disciplines.on("click", ".close-subcategory", function () {
					$(".discipline").removeClass("not-clicked");
					$main_disciplines.removeClass("open-animation");
					$(".discipline").removeClass("sublist-open");
					$(".discipline").each(function (i) {
						$(this).attr("style", stylesForDisciplines[i]);
					});
					resizeApp();
				});

				//clean val of input search
				$(".close-search").on("click", function () {
					$input_search.val("");
					return false;
				});

				//after user click enter this search is init
				$input_search.keyup(function () {
					elementFocusOut = false;
					if (event.keyCode === 13) {
						initSearch($(this).val());
					}
				});

				//click button close search all columns reset
				$("button.close-search").click(function () {
					elementFocusOut = false;
					resetSearch();
				});

				$input_search.focusout(function () {
					if ($(this).val() === "") {
						setTimeout(function () {
							resetSearch();
						}, 500);
					}
				});


				//for placeholder of search input
				$input_search.each(function () {
					var valuePrevious = $(this).attr("placeholder");

					$(this).focus(function () {
						var currentValue = $(this).attr("placeholder");
						if (valuePrevious === currentValue) $(this).attr("placeholder", "");
					}).blur(function () {
						var currentValue = $(this).attr("placeholder");
						if (currentValue === "" || currentValue === " ") $(this).attr("placeholder", valuePrevious);
					});
				});
			},

			/*
			 * @desc method to resize app
			 */
			resizeApp = function () {
				$main_wrapper.height($(window).height());
				$(".discipline").height($main_wrapper.height() - $header_top.outerHeight(true));
				$main_disciplines.height($main_wrapper.height() - $header_top.outerHeight(true));
				$('.list-content').height($(".discipline").outerHeight(true) - 180);
				$('.sublist-content ul').height($(".discipline").outerHeight(true) - 230);
			},

			/*
			 * @desc method to prepare the app using youtube player
			 */
			initAppForPlayer = function () {
				var tag = document.createElement('script'),
					firstScriptTag = document.getElementsByTagName('script')[0];

				tag.src = "http://www.youtube.com/iframe_api";
				firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			},



			getVideoIndex = function ($el) {
				var $list = $('.list-videos-youtube li');
				var index = 0;
				_.each($list, function ($li) {
					$li = $($li);

					if ($li.data('id-video') === $el.data('id-video')) {
						index = $list.index($li);
					}
				});

				return index;
			},

			/*
			 * @desc method to open lightbox and attach UI elements
			 */
			initLightbox = function (index) {
				getVideoDetails(index);

				// Player code
				$(".lightbox-left-arrow").html("<div class='title-youtube prev'></div>");
				$(".lightbox-right-arrow").html("<div class='title-youtube next'></div>");

				return '<div class="lightbox-youtube"><p>' + contentTitleVideo + '</p><iframe width="870" height="520" id="video-player" src="http://www.youtube.com/embed/' + contentIdVideo + '?autoplay=1" frameborder="0" allowfullscreen style="visibility:hidden;" onload="this.style.visibility=\'visible\';"></iframe></div>';
			},

			/*
			 * @desc create player object to display on lightbox
			 */
			initPlayer = function () {
				// Views
				if (contentIdVideo) addPlayedVideo(contentIdVideo);
				
				/*window.onYouTubePlayerAPIReady = function () {
					player = new YT.Player('video-player', {
						playerVars: {
							origin: 1,
							enablejsapi: 1,
							autoplay: 1
						}
					});
				};

				if (window.YT) {
					onYouTubePlayerAPIReady();
					player.addEventListener("onStateChange", getPlayerState);
				}*/
			},

			/*
			 * @desc get video details
			 */
			getVideoDetails = function (index) {
				var videosList = $('.list-videos-youtube li'),
					videoSingle = $(videosList.get(index));

				videoSingle.prev().data('title-video');
				videoSingle.next().data('title-video');

				contentIdVideo = videoSingle.data('id-video');
				contentTitleVideo = videoSingle.data('title-video');
			},

			/*
			 * @desc verify status of video and add videos watcheds
			 */
			getPlayerState = function (event) {
				var currentStatus;
				if (player) {
					currentStatus = event.data;
					if (currentStatus === 0) {
						addPlayedVideo(contentIdVideo);
					}
				}
			},

			/* 
				@desc mark played video
			*/
			addPlayedVideo = function (id) {
				var storageFile = 'KhanAcademyPlaylists.' + Localization.Dictionary.lang,
					data = JSON.parse(localStorage.getItem(storageFile));

				//update video when user watched video live
				var updateWatchedVideo = function (data, video) {
					if (video.vid === id) {
						var percent,
							$box_progress = $element_video_clicked.closest(".discipline").children(".bg-box-list-content").children(".list-content").children(".box-progress-bar"),
							$span_watched_videos = $box_progress.children(".result-videos").children(".watched_videos"),
							$span_total_videos = $box_progress.children(".result-videos").children(".total_videos"),
							$span_progress_videos = $box_progress.children(".progress-bar").children("span"),
							number_videos = parseInt($span_watched_videos.html(), 10),
							total_videos_column = $span_progress_videos.data("total-videos");
						video.status = 1;
						localStorage.setItem(storageFile, JSON.stringify(data));
						if ($element_video_clicked.hasClass("not-play")) {
							$element_video_clicked.removeClass("not-play").addClass("play");
						}
						if (isNaN(number_videos)) {
							$span_watched_videos.html("1");
							percent = 1 * (100 / total_videos_column);
							$span_total_videos.html(total_videos_column + ' ' + t('_videos_watched_label').toUpperCase());
							$span_progress_videos.css("width", percent + "%");
						} else {
							number_videos = number_videos + 1;
							$span_watched_videos.html(number_videos);
							percent = number_videos * (100 / total_videos_column);
							$span_progress_videos.css("width", percent + "%");
						}
					}
				};
				_.each(data, function (item) {
					if (item.has_subcategories === "false") {
						_.each(item.playlist, function (video) {
							updateWatchedVideo(data, video);
						});
					} else {
						_.each(item.subcategories, function (itemPlaylist) {
							_.each(itemPlaylist.playlist, function (video) {
								updateWatchedVideo(data, video);
							});
						});
					}

				});
			},

			/*
			 * @desc call fetch engine to check if exists or generate new data (synchronous), get from localStorage and then save this on module's domain.
			 */
			loadData = function () {
				// moduleApi.init();
				// Endless.app.data = jQuery.parseJSON(localStorage['KhanAcademyPlaylists.' + Localization.Dictionary.lang]);
				// dataJson = Endless.app.data;
			},
			reloadData = function () {
				// Endless.app.data = jQuery.parseJSON(localStorage['KhanAcademyPlaylists.' + Localization.Dictionary.lang]);
				// dataJson = Endless.app.data;
			},

			/*
			 * @desc build columns using data provided by api (khan academy)
			 */
			buildColumns = function (data, q) {

				//iterate through each main node on json
				_.each(data, function (data, index) {
					data.parentIndex = index;
					var filteredData = filterData(data.machine_name, q),
						compileArgs = {
							data: filteredData,
							subject_label: data.subject_label,
							has_subcategories: data.has_subcategories,
							machine_name: data.machine_name,
							parentIndex: data.parentIndex
						};

					compileTemplate(compileArgs);
				});
			},

			/*
			 * @desc build subCategories's columns using data provided by api (khan academy)
			 */
			buildSubCategories = function (data, q) {

				var results = [];
				results.playlist = [];
				results.subject = data.subject;

				if (q !== undefined) {
					_.each(data.playlist, function (item) {
						if (processSearch(item.title, q) === true) {
							results.playlist.push(item);
							if (item.status === 1) {
								total_watched_videos += 1;
							}
						}
					});
					$(".sublist-content").html(template_sublist(results));

				} else {
					$(".sublist-content").html(template_sublist(data));
				}

				instantiateLightBox();
				resizeApp();
			},

			/*
			 * @desc filter data based on subject and query, using as data source the data retrieved by loadData() method. this method is also used as search engine.
			 */
			filterData = function (filter, q) {
				var arrayVideos = [];
				entries = [];
				total_watched_videos = 0;

				_.each(dataJson, function (entry) {
					arrayVideos = entry.has_subcategories === "false" ? entry.playlist : entry.subcategories;
					if (entry.machine_name === filter) {
						entries = q !== undefined ? iteratorWithQuery(arrayVideos, q) : iteratorWithoutQuery(arrayVideos, entry);
					}
				});

				return entries;
			},

			/*
			 * @desc iterator json with search query
			 */
			iteratorWithQuery = function (arrayVideos, q) {
				//loop through an array with videos.
				var new_playlist = [];
				_.each(arrayVideos, function (item, index) {
					if (item.title) {
						if (processSearch(item.title, q) === true) {
							entries.push(item);
							if (item.status === 1) {
								total_watched_videos += 1;
							}
						}
					} else {
						new_playlist = [];
						item.index = index;
						_.each(item.playlist, function (video) {
							if (processSearch(video.title, q) === true) {
								entries.push(item);
								if (video.status === 1) {
									total_watched_videos += 1;
								}
								new_playlist.push(video);
							}
						});
						item.playlist = new_playlist;
						entries = _.uniq(entries);
					}
				});

				return entries;
			},

			/*
			 * @desc iterator json without search query
			 */
			iteratorWithoutQuery = function (arrayVideos, entry) {

				if (entry.has_subcategories === "false") {
					_.each(arrayVideos, function (item) {
						if (item.status === 1) {
							total_watched_videos += 1;
						}
					});
				} else {
					_.each(arrayVideos, function (item, index) {
						item.index = index;

						_.each(item.playlist, function (video) {
							if (video.status === 1) {
								total_watched_videos += 1;
							}
						});
					});
				}

				return arrayVideos;
			},

			/*
			 * @desc check if search query is valid and re-run search by subject using also the search query
			 */
			initSearch = function (q) {

				if ((q.length < 3) && (q.length !== 0)) return false;
				total_videos_playlist = 0;
				query = q;

				//var hasOpenedSubcategory = checkOpenedSubcategory();
				closeSubcategories();
				$main_disciplines.empty();

				reloadData();
				buildColumns(dataJson, q);
			},

			/*
			 * @desc check if search query is valid and run search engine
			 */
			processSearch = function (source, q) {
				source = stripAccents(source.toLowerCase());
				q = stripAccents(q.toLowerCase());

				if (source.search(q) > -1) return true;
				return false;
			},

			stripAccents = function (q) {
				//table containing hexadecimal codes based on ascii table with latin accents for vowels and 'c' with cedilla. 
				var charMap = [{
					regex: /[\xC0-\xC6]/g,
					chr: 'A'
				}, {
					regex: /[\xE0-\xE6]/g,
					chr: 'a'
				}, {
					regex: /[\xC8-\xCB]/g,
					chr: 'E'
				}, {
					regex: /[\xE8-\xEB]/g,
					chr: 'e'
				}, {
					regex: /[\xCC-\xCF]/g,
					chr: 'I'
				}, {
					regex: /[\xEC-\xEF]/g,
					chr: 'i'
				}, {
					regex: /[\xD2-\xD6]/g,
					chr: 'O'
				}, {
					regex: /[\xF2-\xF6]/g,
					chr: 'o'
				}, {
					regex: /[\xD9-\xDC]/g,
					chr: 'U'
				}, {
					regex: /[\xF9-\xFC]/g,
					chr: 'u'
				}, {
					regex: /[\xC7]/g,
					chr: 'C'
				}, {
					regex: /[\xE7]/g,
					chr: 'c'
				}];

				for (var i = 0, len = charMap.length; i < len; i++) {
					q = q.replace(charMap[i].regex, charMap[i].chr);
				}

				return q;
			},

			/*
			 * @desc clear the search and put entire content back in place
			 */
			resetSearch = function () {
				if (!(elementFocusOut)) {
					reloadData();
					query = "";
					total_videos_playlist = 0;
					closeSubcategories();
					buildColumns(dataJson);
				} else {
					return false;
				}
			},

			/*checkOpenedSubcategory = function () {
				var $openedSubcategory = $(".discipline.sublist-open");

				if ($openedSubcategory.length > 0) {
					return true;
				}

				return false;
			},*/

			/*
			 * @desc clear the search and put entire content back in place
			 */
			closeSubcategories = function () {
				$main_disciplines.removeClass("open-animation").empty();
				$(".discipline").removeClass("not-clicked");
			},

			/*
			 * @desc compile template with data
			 */
			compileTemplate = function (args) {

				template_with_subcat = Handlebars.compile($("#discipline-template-with-subcat").html());
				template_without_subcat = Handlebars.compile($("#discipline-template").html());

				//register partial for line loop
				Handlebars.registerPartial("line", $("#line-partial").html());
				Handlebars.registerPartial("line-subcat", $("#line-partial-with-subcat").html());

				//wrap data array into object. this format is the data format required to feed handlebars's templates
				var wrapper = {
					playlist: args.data
				};

				registerHandlebarsHelper(args);

				if (args.has_subcategories === "false") {
					$main_disciplines.append(template_without_subcat(wrapper));

				} else {
					$main_disciplines.append(template_with_subcat(wrapper));
				}

				resizeApp();
				resizeColumns();
				instantiateLightBox();
			},

			/*
			 * @desc register helpers used by handlebars's templates
			 */
			registerHandlebarsHelper = function (args) {

				var total_videos = args.data.length;

				if (args.has_subcategories === "true") {
					_.each(args.data, function (item) {
						total_videos_playlist = total_videos_playlist + item.playlist.length;
					});
					total_videos = total_videos_playlist;
				}

				Handlebars.registerHelper('total_videos_playlist', function () {
					if (total_watched_videos === 0) {
						return total_videos_playlist + ' ' + t('_videos_label').toUpperCase();
					} else {
						return +total_videos_playlist + ' ' + t('_videos_watched_label').toUpperCase();
					}
				});

				/*
				 * @desc return subject name
				 */
				Handlebars.registerHelper('subject_label', function () {
					return args.subject_label;
				});

				/*
				 * @desc return index for this.object
				 */
				Handlebars.registerHelper('parentIndex', function () {
					return args.parentIndex;
				});

				/*
				 * @desc return subject name
				 */
				Handlebars.registerHelper('machine_name', function () {
					return args.machine_name;
				});

				/*
				 * @desc return total videos
				 */
				Handlebars.registerHelper('total_videos', function () {
					return total_videos;
				});

				/*
				 * @desc return total videos caption
				 */
				Handlebars.registerHelper('total_videos_caption', function () {
					if (total_watched_videos === 0) {
						return total_videos + ' ' + t('_videos_label').toUpperCase();
					} else {
						return +total_videos + ' ' + t('_videos_watched_label').toUpperCase();
					}
				});

				/*
				 * @desc return watched caption
				 */
				Handlebars.registerHelper('total_watched_videos', function () {
					if (total_watched_videos === 0) {
						return t('_no_videos_watched').toUpperCase();
					} else {
						return total_watched_videos;
					}
				});

				/*
				 * @desc alias to call translation function directly from handlebar's templates with uppercase helper
				 */
				Handlebars.registerHelper('t', function (key_name, upper_case) {
					if (upper_case !== undefined && upper_case === 'true')
						return t(key_name).toUpperCase();
					else
						return t(key_name);
				});

				/*
				 * @desc return percentage watched videos
				 */
				Handlebars.registerHelper('percentage_watched_videos', function () {
					var percent_total = total_watched_videos * (100 / total_videos);
					return isNaN(percent_total) ? 0 : percent_total;
				});

				/*
				 * @desc return video watched video
				 */
				Handlebars.registerHelper('status_class', function (status) {
					return status === "0" ? "not-play" : "play";
				});

				/*
				 * @desc return title
				 */

				Handlebars.registerHelper('cleaned_title', function (title) {
					title = title.replace("(Khan Academy)", "");
					title = title.replace(args.subject_label + " - ", "");
					return title;
				});

				/*
				 * @desc return total videos by playlists
				 */
				Handlebars.registerHelper('total_playlists', function (playlist) {
					return playlist.length;
				});
			},

			/*
			 * @desc resize columns with %
			 */
			resizeColumns = function () {
				arrayAllDisciplines = $(".discipline");
				totalDisciplines = arrayAllDisciplines.length;
				var width_percente = 100 / totalDisciplines;
				var left = 0;
				for (var i = 0; totalDisciplines > i; i++) {
					$(arrayAllDisciplines[i]).css({
						"left": left + "%",
						"width": width_percente + "%"
					});
					left += width_percente;
				}
				saveStylesForDisciplines();
			},

			/*
			 * @desc save styles of disciplines for using after
			 */
			saveStylesForDisciplines = function () {
				$('.discipline').each(function (a) {
					stylesForDisciplines[a] = $(this).attr("style");
				});
			},

			/*
			 * @desc resize columns when column of subcategory open
			 */
			resizeColumnsWithClick = function () {
				$(".discipline").addClass("discipline-with-animate");
				$('.discipline').each(function (index) {
					var position_column,
						percent_spacer = 10 / (totalDisciplines - 1);
					if (index <= indexCurrentColumnClicked) {
						position_column = (index * percent_spacer);
						$(this).css({"left": position_column + "%"});
					} else {
						position_column = (index * percent_spacer) - percent_spacer;
						position_column = 90 + position_column;
						$(this).css({"left": position_column + "%"});
					}
				});
			},
			removeLoading = function () {
				$loading.removeClass("opacity");
			},

			/**
			 * Load and wait for loading images.
			 */
			loadImages = function (images, action) {
				var loaded_images = 0;
				var bad_tags = 0;

				$(images).each(function () {
					//alert($(this).get(0).tagName+" "+$(this).attr("id")+" "+$(this).css("display"));
					var image = new Image();
					var src = $(this).attr("src");
					var backgroundImage = $(this).css("backgroundImage");
					// Search for css background style
					if (!src && backgroundImage !== "none") {
						var pattern = /url\("{0,1}([^"]*)"{0,1}\)/;
						src = pattern.exec(backgroundImage)[1];
					} else {
						bad_tags++;
					}
					// Load images
					$(image).load(function () {
						loaded_images++;
						if (loaded_images === ($(images).length - bad_tags)) action();
					}).attr("src", src);
				});
			};

		return { //BOF PUBLIC SECTION

			init: function (json) {
				loadTranslations();
				dataJson = json;
				bindEvents();
				buildColumns(dataJson);
				resizeApp();
				resizeColumns();
				loadImages($(".discipline"), removeLoading);
			}

		};
	};

}(window, document, jQuery));

window.init_online = function(json) {
	var module = new Endless.app.Module();
	module.init(json);
}
