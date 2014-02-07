helpers = {};

(function($){
  /*
    * Decode utf-8 encoded string back into multi-byte Unicode characters
    *
    * @param {String} strUtf UTF-8 string to be decoded back to Unicode
    * @returns {String} decoded string
    */
    helpers.utf8Decode = function(strUtf) {
      // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
      var strUni = strUtf.replace (
                  /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
        function (c) {  // (note parentheses for precence)
          var cc = ((c.charCodeAt (0) & 0x0f) << 12) |
                ((c.charCodeAt (1) & 0x3f) << 6) |
                ( c.charCodeAt (2) & 0x3f);

          return String.fromCharCode (cc);
        }
      );

      strUni = strUni.replace (
              /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
        function (c) {  // (note parentheses for precence)
          var cc = (c.charCodeAt (0) & 0x1f) << 6 |
                c.charCodeAt (1) & 0x3f;

          return String.fromCharCode (cc);
        }
      );

      return strUni;
    }

    helpers.fetchContent = function(filename) {
      if(filename === undefined || filename === null)
        return void(0);

      var tokens = filename.split("/"),
          section,
          locale,
          b64,
          content,
          json;


      if (tokens.length > 0)
          locale = tokens[0];
      if (tokens.length > 1)
          section = tokens[1];

      b64 = application.content[locale][section];
      content = Base64.decode(b64);
      json = JSON.parse(helpers.utf8Decode(content))

      return json;
    }

  })(jQuery)