/* global Localization */
window.Localization = window.Localization || {};
Localization.Dictionary = Localization.Dictionary || {};
Localization.Dictionary.key = Localization.Dictionary.key || {};

(function () {
	"use strict";

	Localization.Dictionary.lang = "pt-BR";
	Localization.Dictionary.key._search_placeholder = {
		'en-US': 'Search here for topics and subjects',
		'pt-BR': 'Digite aqui um assunto ou tópico',
		'es-GT': 'Escriba aquí una cuestión o tema'
	};
	Localization.Dictionary.key._slogan = {
		'en-US': 'Free lessons about any theme',
		'pt-BR': 'Lições gratuitas sobre qualquer tema',
		'es-GT': 'Lecciones gratuitas sobre cualquier tema'
	};
	Localization.Dictionary.key._no_videos_watched = {
		'en-US': 'No videos watched',
		'pt-BR': 'Nenhum vídeo assistido',
		'es-GT': 'No hay videos vistos'
	};
	Localization.Dictionary.key._play_all = {
		'en-US': 'Play all',
		'pt-BR': 'Reproduzir todos',
		'es-GT': 'Escuchar todo'
	};
	Localization.Dictionary.key._videos_label = {
		'en-US': 'Videos',
		'pt-BR': 'Vídeos',
		'es-GT': 'Videos'
	};
	Localization.Dictionary.key._videos_watched_label = {
		'en-US': 'Watched videos',
		'pt-BR': 'Vídeos assistidos',
		'es-GT': 'Videos vistos'
	};
	Localization.Dictionary.key._browse = {
		'en-US': 'Browse',
		'pt-BR': 'Navegar',
		'es-GT': 'Explorar'
	};
	Localization.Dictionary.key._search = {
		'en-US': 'Search',
		'pt-BR': 'Buscar',
		'es-GT': 'Buscar'
	};
	Localization.Dictionary.key._close = {
		'en-US': 'Close',
		'pt-BR': 'Fechar',
		'es-GT': 'Cerrar'
	};
	Localization.Dictionary.key._online = {
		'en-US': 'The Internet connection has been lost.',
		'pt-BR': 'A conexão com a Internet foi perdida.',
		'es-GT': 'La conexión a Internet se ha perdido.'
	};

	Localization.Dictionary.t = function (key_name) {
		if (key_name !== undefined) {
			if (Localization.Dictionary.key[key_name] !== undefined) {
				if (Localization.Dictionary.key[key_name][Localization.Dictionary.lang] !== undefined) {
					return Localization.Dictionary.key[key_name][Localization.Dictionary.lang];
				} else {
					console.log("The key " + key_name + " is not available in requested language");
					return Localization.Dictionary.key[key_name]['pt-BR'];
				}
			} else {
				console.log("The key " + key_name + " is not defined");
			}
		} else {
			console.log("You must provide a key to translation");
		}
	};

	Localization.Dictionary.defineLang = function (lang_code) {
		Localization.Dictionary.lang = lang_code;
	};

	/* 
	 * Format received params to strictly use the format [ISO 639-1]-[ISO 3166-1] according to RFC 3066
	 */
	Localization.Dictionary.normalize_language = function (language_code) {
		var l = (language_code.substr(0, 2) === 'es') ? 'es-GT' : language_code;
		return l[0].toLowerCase() + l[1].toLowerCase() + "-" + l[3].toUpperCase() + l[4].toUpperCase();
	};

	/* 
	 * Format received params to strictly use the format [ISO 639-1]-[ISO 3166-1] according to RFC 3066
	 */
	Localization.Dictionary.get_browser_language = function (default_language) {
		if (typeof (navigator.userLanguage) === "string") {
			return Localization.Dictionary.normalize_language(navigator.userLanguage);
		} else if (typeof (navigator.language) === "string") {
			return Localization.Dictionary.normalize_language(navigator.language);
		}
		return default_language;
	};

})();

Localization.Dictionary.defineLang(Localization.Dictionary.get_browser_language(Localization.Dictionary.lang));