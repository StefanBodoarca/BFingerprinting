//constructor for web identity
function WebIdentity(
    base_domain, user_agent, accept_default,
    accept_encoding, accept_lang, platform,
    screen_resolution, app_version, app_name,
    oscpu_string, pixel_depth, color_depth,
    vendor_spoof, vendorSub_spoof, description,
    profile_id, protocol, jsToggle, timezoneOffset) {

    this.base_domain = base_domain;
    this.user_agent = user_agent;
    this.accept_default = accept_default;
    this.accept_encoding = accept_encoding;
    this.accept_lang = accept_lang;
    this.platform_spoof = platform;
    this.description = description;
    this.color_depth = color_depth;
    this.pixel_depth = pixel_depth;
    this.app_version = app_version;
    this.app_name = app_name;
    this.oscpu_string = oscpu_string;
    this.vendor_spoof = vendor_spoof;
    this.vendorSub_spoof = vendorSub_spoof;
    this.profile_id = profile_id;
    this.screen = screen_resolution;
    this.first_language = "";
    this.all_languages = [];
    this.screen_resolution = "";
    this.width = "";
    this.height = "";
    this.jsVar = jsToggle;
    this.canvasVar = "blocked"; //default value
    this.protocol = protocol;
    this.requests = [];
    this.timezoneOffset = timezoneOffset;
    this.zgomot = getRandomInt(10, 40);

    //console.log("jsToggle in webIdentity constructor - this.jsVar " + jsToggle + "  -  " + this.jsVar);

    Object.defineProperty(this, "first_language", {
        get: function () {
            return this.accept_lang.split(",")[0];
        }
    });

    Object.defineProperty(this, "all_languages", {
        get: function () {
            let array = this.accept_lang.split(",");
            let res = [];
            res[0] = array[0];
            let i;
            for (i = 1; i < array.length; i++) {
                res[i] = array[i].split(";")[0];
            }

            return res;
        }
    });

    Object.defineProperties(this, {
        "screen_resolution": {
            get: function () {
                let mStr = "";
                mStr += this.screen;
                mStr += "x" + this.pixel_depth;

                return mStr;
            }
        },
        "width": {
            get: function () {
                return this.screen.split("x")[0];
            }
        },
        "height": {
            get: function () {
                return this.screen.split("x")[1];
            }
        }
    });
}

function getNewWebIdentity(PROFILES_DB, lastIdentityUsed, base_domain, protocol, jsToggle, timezoneOffsets) {
    let user_agent;
    let accept_default;
    let accept_encoding;
    let accept_lang;
    let platform;
    let screen_resolution;
    let app_version;
    let app_name;
    let oscpu_string;
    let pixel_depth;
    let color_depth;
    let vendor_spoof;
    let vendorSub_spoof;
    let description;
    let profile_id;
    let timezone;

    //pentru a identifica o clasa de browsere
    let clasa = -1;

    for (let i = 0; i < PROFILES_DB.length; i++) {

        if (lastIdentityUsed === null) {
            console.log("first time in");
            clasa = 0;
            description = PROFILES_DB[clasa].description;
            break;
        }
        //aleg din fiecare clasa de browsere pe rand - windows, mac, linux, unix
        if (lastIdentityUsed.description === PROFILES_DB[i].description) {
            clasa = i;
            clasa++;
            if (clasa > 3) {
                clasa = 0;
                description = PROFILES_DB[clasa].description;
            } else description = PROFILES_DB[clasa].description;

            break;
        }
    }

    //aleg un profil (pentru o clasa - windows, mac, linux, unix) random intre 1 si nr de profiluri disponibile pentru clasa aleasa
    //cu conditia sa fie diferit de ultimul folosit

    let nrProfil = -1;

    if (lastIdentityUsed === null) {
        nrProfil = 1;
    } else {
        do {
            nrProfil = getRandomInt(1, PROFILES_DB[clasa].useragents.length);
        } while (getNumberOfProfile(lastIdentityUsed.profile_id) === nrProfil);
    }


    //identitatea web pentru spoofing e data de nrProfil
    user_agent = PROFILES_DB[clasa].useragents[nrProfil - 1].useragent;
    app_name = PROFILES_DB[clasa].useragents[nrProfil - 1].appname;
    app_version = PROFILES_DB[clasa].useragents[nrProfil - 1].appversion;
    platform = PROFILES_DB[clasa].useragents[nrProfil - 1].platform;
    vendor_spoof = PROFILES_DB[clasa].useragents[nrProfil - 1].vendor;
    vendorSub_spoof = PROFILES_DB[clasa].useragents[nrProfil - 1].vendorsub;
    oscpu_string = PROFILES_DB[clasa].useragents[nrProfil - 1].oscpu;
    accept_default = PROFILES_DB[clasa].useragents[nrProfil - 1].accept_default;
    accept_encoding = PROFILES_DB[clasa].useragents[nrProfil - 1].accept_encoding;

    let arr_languages = getArrayLanguages(PROFILES_DB[clasa].useragents[nrProfil - 1].accept_lang);
    accept_lang = arr_languages[getRandomInt(0, arr_languages.length - 1)];
    pixel_depth = PROFILES_DB[clasa].useragents[nrProfil - 1].pixeldepth;
    color_depth = PROFILES_DB[clasa].useragents[nrProfil - 1].colordepth;
    profile_id = PROFILES_DB[clasa].useragents[nrProfil - 1].profileID;

    let screens = PROFILES_DB[clasa].useragents[nrProfil - 1].screens.split(",");
    screen_resolution = screens[getRandomInt(0, screens.length - 1)];

    timezone = timezoneOffsets[getRandomInt(0, timezoneOffsets.length - 1)];

    return new WebIdentity(base_domain, user_agent, accept_default,
        accept_encoding, accept_lang, platform,
        screen_resolution, app_version, app_name,
        oscpu_string, pixel_depth, color_depth, vendor_spoof,
        vendorSub_spoof, description, profile_id, protocol, jsToggle, timezone);
}

function WebIdentityBeforeRequest(domains, domain, PROFILES_DB, url, timezoneOffsets) {
    if (pushDomain(domains, domain)) {
        //daca adaug un nou domeniu
        let jsALL = getItem('jsALL');
        let urlPattern;
        let jsToggle;
        let protocol;
        let webIdentity;
        let lastIdentityUsed = getItem('lastIdentityUsed');

        if (typeof lastIdentityUsed === "undefined") {
            lastIdentityUsed = null;
        } else {
            lastIdentityUsed = JSON.parse(lastIdentityUsed);
        }

        if (typeof jsALL === "undefined") {
            jsToggle = "allowed";
        } else if (jsALL === "jsON") {
            jsToggle = "allowed";
        } else if (jsALL === "jsOFF") {
            jsToggle = "blocked";
        }
        console.log("jsALL bkg script " + jsALL);

        if (url.substr(0,5) === "https") {
            protocol = "https";
        } else if (url.substr(0,4) === "http") {
            protocol = "http";
        }

        webIdentity = getNewWebIdentity(PROFILES_DB, lastIdentityUsed, domain, protocol, jsToggle, timezoneOffsets);
        lastIdentityUsed = webIdentity;
        //store item in localstorage
        storeItem(domain, JSON.stringify(webIdentity));
        storeItem('domains', JSON.stringify(domains));
        storeItem('lastIdentityUsed', JSON.stringify(lastIdentityUsed));
        //console.log(domains);

        //dupa ce am adaugat domeniul verificam JS
        urlPattern = "*://*." + domain + ":*/*";
        //console.log("inside if --> " + getBaseDomain(request.host));
        if (jsToggle === "blocked") {
            blockAllowJsOnDomain(domains, domain, urlPattern, "blocked", true);
            console.log("am executat blocked!!!!");
        } else if (jsToggle === "allowed") {
            blockAllowJsOnDomain(domains, domain, urlPattern, "allowed", false);
            console.log("am executat allowed!!!!");
        }
    }
}

function getArrayLanguages(obj) {
    return Object.keys(obj).map(function (k) {
        return obj[k]
    });
}

function getNumberOfProfile(profile) {
    let nr = "";
    if (profile.length === 3) {
        nr = profile[1] + profile[2];
    } else nr = profile[1];

    nr = parseInt(nr);
    return nr;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pushDomain(domains, dom) {
    for (let i = 0; i < domains.length; i++) {
        if (dom === domains[i]) {
            return false;
        }
    }

    domains.push(dom);
    return true;
}

function checkDomain(domains, dom) {
    if (typeof domains === "undefined" || domains === null) {
        return false;
    }
    for (let i = 0; i < domains.length; i++) {
        if (dom === domains[i]) {
            return true;
        }
    }
    return false;
}


function getItem(key) {
    return localStorage[key];
}

function storeItem(key, value) {
    localStorage[key] = value;
}

function clearWebIdentities(domains) {
    if (typeof domains === "undefined" || domains === null) {
        return;
    }

    for (let i = 0; i < domains.length; i++) {
        localStorage.removeItem(domains[i]);
    }

    localStorage.removeItem("domains");
    localStorage.removeItem("lastIdentityUsed");
}

function clearWebIdentity(domain, domains) {
    if (typeof domains === "undefined" || domains === null) {
        return;
    }

    if (typeof domain === "undefined" || domain === null) {
        return;
    }

    for (let i = 0; i < domains.length; i++) {
        if (domain === domains[i]) {
            localStorage.removeItem(domains[i]);
            break;
        }
    }

    let index = domains.indexOf(domain);
    if (index > -1) {
        domains.splice(index, 1);
    }
}

function getHostFromURL(url) {
    let str = url;
    let subSTR = str.substr(str.indexOf("//") + 2, str.length -1);
    let n = subSTR.indexOf("/");
    let host = subSTR.substr(0, n);
    return host;
}

function getHostFromInitiator(initiator) {
    let str = initiator;
    let host = str.substr(str.indexOf("//") + 2, str.length -1);
    return host;
}

function getBaseDomain(host) {
    let vector = host.split(".");
    let baseDomain = "";
    if (vector[vector.length - 1].length === 2) {
        if (typeof vector[vector.length - 3] === "undefined" || vector[vector.length - 3] === "www") {

            baseDomain = vector[vector.length - 2] + "." + vector[vector.length - 1];

        } else {
            baseDomain = vector[vector.length - 3] + "." + vector[vector.length - 2] + "." + vector[vector.length - 1];
        }
    } else {
        baseDomain = vector[vector.length - 2] + "." + vector[vector.length - 1];
    }

    return baseDomain;
}

function replaceHeaderMethodHEAD(requestHeaders) {
    // Replace the User-Agent header
    let headers = requestHeaders;
    headers.forEach(function (header) {
        if (header.name === "User-Agent") {
            header.value = "Mozilla/5.0 (Windows NT 6.1; rv:52.0) Gecko/20100101 Firefox/52.0";
        }
    });
    return {requestHeaders: headers};
}

function replaceHeader(webIdentity, requestHeaders) {
    if (typeof webIdentity === "undefined" || webIdentity === null)
        return requestHeaders;

    let headers = requestHeaders;
    headers.forEach(function (header) {
        if (header.name === "User-Agent") {
            header.value = webIdentity.user_agent;
        }

        if (header.name === "Accept") {
            header.value = webIdentity.accept_default;
        }

        if (header.name === "Accept-Language") {
            header.value = webIdentity.accept_lang;
        }

        if (header.name === "Accept-Encoding") {
            header.value = webIdentity.accept_encoding;
        }
    });
    return {requestHeaders: headers};
}

function getHeadersForDomain(domains, details) {
    let pattern;
    let webIdentity;
    let header_map = {
        requestHeaders: details.requestHeaders
    };

    if (typeof domains === "undefined" || domains === null) {
        return header_map;
    }

    if (details.method === "HEAD") {
        header_map = replaceHeaderMethodHEAD(details.requestHeaders);
        //console.log("details: -> ");
        //console.log(details);
        return header_map;
    }

    if (details && details.url && details.requestHeaders && details.requestHeaders.length > 0) {

        for (let i = 0; i < domains.length; i++) {
            pattern = new RegExp(domains[i]);

            if (typeof details.initiator != "undefined" && details.initiator != "null") {
                if (details.initiator.indexOf("http") === 0) {
                    if (pattern.test(details.initiator)) {
                        webIdentity = JSON.parse(getItem(domains[i]));
                        header_map = replaceHeader(webIdentity, details.requestHeaders);
                        //console.log(header_map);
                        break;
                    }
                }
            }

            //daca nu am avut un initiator de tip http/https
            if (pattern.test(details.url)) {
                webIdentity = JSON.parse(getItem(domains[i]));
                header_map = replaceHeader(webIdentity, details.requestHeaders);
                //console.log(header_map);
                break;
            }
        }
    }

    //console.log("details: -> ");
    //console.log(details);
    return header_map;
}

function blockContentSettings() {
    blockPlugins(true);
    blockLocation(true);
    blockNotifications(true);
    blockPopups(true);
    blockCamera(true);
    blockMicrophone(true);
}

function blockPlugins(block) {
    chrome.contentSettings.plugins.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockLocation(block) {
    chrome.contentSettings.location.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockNotifications(block) {
    chrome.contentSettings.notifications.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockPopups(block) {
    chrome.contentSettings.popups.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockCookies(block) {
    chrome.contentSettings.cookies.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function block3rdCookies(block) {
    chrome.privacy.websites.thirdPartyCookiesAllowed.set({value: block});
}

function blockCamera(block) {
    chrome.contentSettings.camera.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockMicrophone(block) {
    chrome.contentSettings.microphone.set({
        primaryPattern: '<all_urls>',
        setting: block ? 'block' : 'allow'
    });
}

function blockJavascript(block, pattern) {
    chrome.contentSettings.javascript.set({
        primaryPattern: pattern,
        setting: block ? 'block' : 'allow'
    });
}

function blockJsOnAllDomains(domains, boolean) {
    let jsonStringWebIdentity;
    let jsonObjWebIdentity;
    let urlPattern;
    for (let i = 0; i < domains.length; i++) {
        urlPattern = "*://*." + domains[i] + ":*/*";
        jsonStringWebIdentity = getItem(domains[i]);
        jsonObjWebIdentity = JSON.parse(jsonStringWebIdentity);
        jsonObjWebIdentity.jsVar = "blocked";
        storeItem(domains[i], JSON.stringify(jsonObjWebIdentity));
        blockJavascript(boolean, urlPattern);
    }
}

function blockAllowJsOnDomain(domains, domain, pattern, string, boolean) {
    let jsonStringWebIdentity;
    let jsonObjWebIdentity;
    for (let i = 0; i < domains.length; i++) {
        if (domain === domains[i]) {
            jsonStringWebIdentity = getItem(domain);
            jsonObjWebIdentity = JSON.parse(jsonStringWebIdentity);
            jsonObjWebIdentity.jsVar = string;
            storeItem(domain, JSON.stringify(jsonObjWebIdentity));
        }
    }

    blockJavascript(boolean, pattern);
}


function blockCanvasOnAllDomains(domains) {
    let jsonStringWebIdentity;
    let jsonObjWebIdentity;
    for (let i = 0; i < domains.length; i++) {
        jsonStringWebIdentity = getItem(domains[i]);
        jsonObjWebIdentity = JSON.parse(jsonStringWebIdentity);
        jsonObjWebIdentity.canvasVar = "blocked";
        storeItem(domains[i], JSON.stringify(jsonObjWebIdentity));
    }
}

function blockAllowCanvasOnDomain(domains, domain, string) {
    for (let i = 0; i < domains.length; i++) {
        if (domain === domains[i]) {
            let jsonStringWebIdentity = getItem(domain);
            let jsonObjWebIdentity = JSON.parse(jsonStringWebIdentity);
            jsonObjWebIdentity.canvasVar = string;
            storeItem(domain, JSON.stringify(jsonObjWebIdentity));
        }
    }
}