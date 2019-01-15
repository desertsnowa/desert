function getCookie(name) {
    'use strict';
    
    var dc = document.cookie,
        prefix = name + "=",
        begin = dc.indexOf("; " + prefix);
    
    if (begin === -1) {
        begin = dc.indexOf(prefix);
        if (begin !== 0) {
            return null;
        }
    } else {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end === -1) {
            end = dc.length;
        }
    }
    
    return unescape(dc.substring(begin + prefix.length, end));
}

function createCookie(cookieName, cookieValue, nDays) {
    'use strict';
    
    var today = new Date(),
        expire = new Date();
    
    if (nDays === null || nDays === 0) {
        nDays = 1;
    }
    
    expire.setTime(today.getTime() + 3600000 * 24 * nDays);
    var rsaCookie =cookieName + "=" + escape(cookieValue) + ";expires=" + expire.toGMTString() + ";domain=navyfederal.org;path=/";

    document.cookie = rsaCookie;
 }

function setAACookie() {
    'use strict';
	var aaCookie = getCookie("aatoken");

	if (aaCookie === null) {
        // Create a new AA Cookie
		createCookie("aatoken", makeRandomValue(), 1827);
    }
}

function makeRandomValue() {
    'use strict';
    
    var text = '',
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        i;

    for (i = 0; i < 50; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

//function to delete akamie cookie at logout
function deleteAkamiCookie(){
	'use strict';
	var cookieName = $('#Login #akamaiCookieName').val();
	console.log(" akkame cookie >> "+cookieName );
	var akaCookie = dc+'='+v+';expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	console.log(" akkame cookie >> "+akaCookie );
    document.cookie = akaCookie;
 
}

function setAkamiCookie(){
	'use strict';
	var cookieValue = $('#Login #akamaiCookieValue').val();
	var cookieName = $('#Login #akamaiCookieName').val();
	console.log(" akkame cookie >> "+cookieName +"--"+cookieValue);
	var today = new Date(),expire = new Date(),nDays = 2;
    expire.setTime(today.getTime() + 3600000 * 24 * nDays);
    var akaCookie = cookieName+"="+ escape(cookieValue)+";domain=navyfederal.org;path=/";
    console.log("akaCookie > "+akaCookie);
    document.cookie = akaCookie;
 
}
