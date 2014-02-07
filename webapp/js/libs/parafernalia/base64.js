(function () {
    var Base64 = window["Base64"] = {};

    // base64 characters, reverse mapping
    var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var BASE64_IDX = [
        /* 43 -43 = 0*/
        /* '+',  1,  2,  3,'/' */
            62, -1, -1, -1, 63,

        /* '0','1','2','3','4','5','6','7','8','9' */
            52, 53, 54, 55, 56, 57, 58, 59, 60, 61,

        /* 15, 16, 17,'=', 19, 20, 21 */
           -1, -1, -1, 64, -1, -1, -1,

        /* 65 - 43 = 22*/
        /*'A','B','C','D','E','F','G','H','I','J','K','L','M', */
           0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12,

        /* 'N','O','P','Q','R','S','T','U','V','W','X','Y','Z' */
            13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,

        /* 91 - 43 = 48 */
        /* 48, 49, 50, 51, 52, 53 */
           -1, -1, -1, -1, -1, -1,

        /* 97 - 43 = 54*/
        /* 'a','b','c','d','e','f','g','h','i','j','k','l','m' */
            26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,

        /* 'n','o','p','q','r','s','t','u','v','w','x','y','z' */
            39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
    ];

    /**
     * Base64 encodes a string of bytes.
     *
     * @param input the string of bytes to encode.
     * @param maxline the maximum number of encoded bytes per line to use,
     *           defaults to none.
     *
     * @return the base64-encoded output.
     */
    Base64.encode = function (input, maxline) {
        var line = '';
        var output = '';
        var chr1, chr2, chr3;
        var i = 0;
        while (i < input.length) {
            chr1 = input.charCodeAt (i++);
            chr2 = input.charCodeAt (i++);
            chr3 = input.charCodeAt (i++);

            // encode 4 character group
            line += BASE64.charAt (chr1 >> 2);
            line += BASE64.charAt (((chr1 & 3) << 4) | (chr2 >> 4));
            if (isNaN (chr2)) {
                line += '==';
            }
            else {
                line += BASE64.charAt (((chr2 & 15) << 2) | (chr3 >> 6));
                line += isNaN (chr3) ? '=' : BASE64.charAt (chr3 & 63);
            }

            if (maxline && line.length > maxline) {
                output += line.substr (0, maxline) + '\n';
                line = line.substr (maxline);
            }
        }

        output += line;

        return output;
    };

    /**
     * Base64 decodes a string into a string of bytes.
     *
     * @param input the base64-encoded input.
     *
     * @return the raw bytes.
     */
    Base64.decode = function (input) {
        // remove all non-base64 characters
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        var output = '';
        var enc1, enc2, enc3, enc4;
        var i = 0;

        while (i < input.length) {
            enc1 = BASE64_IDX[input.charCodeAt (i++) - 43];
            enc2 = BASE64_IDX[input.charCodeAt (i++) - 43];
            enc3 = BASE64_IDX[input.charCodeAt (i++) - 43];
            enc4 = BASE64_IDX[input.charCodeAt(i++) - 43];

            output += String.fromCharCode ((enc1 << 2) | (enc2 >> 4));
            if (enc3 !== 64) {
                // decoded at least 2 bytes
                output += String.fromCharCode (((enc2 & 15) << 4) | (enc3 >> 2));
                if (enc4 !== 64) {
                    // decoded 3 bytes
                    output += String.fromCharCode (((enc3 & 3) << 6) | enc4);
                }
            }
        }

        return output;
    };
}) ();
