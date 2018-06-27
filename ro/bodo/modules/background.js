chrome.runtime.onStartup.addListener(function () {
    console.log("onStartup");
    blockContentSettings();
    fetchDataAndProcess();
});

chrome.runtime.onInstalled.addListener(function (details) {
    console.log("onInstalled");
    blockContentSettings();
    fetchDataAndProcess();
});

chrome.windows.onCreated.addListener(function (window) {
    console.log("onCreated");
    blockContentSettings();
    fetchDataAndProcess();
});


function fetchDataAndProcess() {
    fetch('../database/webprofiles.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            main(myJson);
        });
}

function main(myJson) {
    //variables
    let PROFILES_DB = myJson;
    let parentLocation;
    let timezoneOffsets = ['720', '660', '600', '570', '540', '480', '420', '360', '300', '240', '210', '180', '120', '60', '0',
        '-60', '-120', '-180', '-210', '-240', '-270', '-300', '-330', '-345', '-360', '-390', '-420', '-480', '-510',
        '-525', '-540', '-570', '-600', '-630', '-660', '-720', '-765', '-780', '-840'];
    let domains = getItem('domains');
    //console.log("domains: " + domains);
    //check the values taken from the local storage
    if (typeof domains === "undefined") {
        domains = [];
    } else domains = JSON.parse(domains);
    //console.log("domains: " + domains);

    chrome.webRequest.onBeforeRequest.addListener(function (details) {
            if (details.method === "HEAD") {
                return;
            }
            //console.log(details);
            if (typeof details.initiator != "undefined" && details.initiator != "null") {
                if (details.initiator.indexOf("http") === 0) {

                    let baseDomainFrom = getBaseDomain(getHostFromInitiator(details.initiator));
                    let baseDomainTo = getBaseDomain(getHostFromURL(details.url));

                    if (!checkDomain(domains, baseDomainFrom)) {
                        WebIdentityBeforeRequest(domains, baseDomainFrom, PROFILES_DB, details.initiator, timezoneOffsets);
                        return;
                    }
                    if (checkDomain(domains, baseDomainFrom)) {

                        //daca nu gasim dom care emite in url pt care facem noul request
                        if (details.url.indexOf(baseDomainFrom) === -1) {
                            //inseamna ca facem catre un third-party - adaugam dom din url la requests si trimitem aceeasi identitate
                            //luam identitatea si adaugam dom
                            let webIdentity = JSON.parse(getItem(baseDomainFrom));
                            pushDomain(webIdentity.requests, baseDomainTo);
                            storeItem(baseDomainFrom, JSON.stringify(webIdentity));
                            /*
                            if (details.type === "script") {
                                return {cancel: true};
                            } else {
                                return;
                            }*/
                            return;
                        }
                    }
                } else {
                    WebIdentityBeforeRequest(domains, getBaseDomain(getHostFromURL(details.url)), PROFILES_DB, details.url, timezoneOffsets);
                }
            }

            if (typeof details.initiator === "undefined" || details.initiator === "null") {
                WebIdentityBeforeRequest(domains, getBaseDomain(getHostFromURL(details.url)), PROFILES_DB, details.url, timezoneOffsets);
            }

        },
        {
            urls: ["http://*/*",
                "https://*/*"]
        },
        ["blocking"]
    );

    chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
            return getHeadersForDomain(domains, details);
        },
        {
            urls: ["http://*/*",
                "https://*/*"]
        },
        ["blocking", "requestHeaders"]
    );

    chrome.webRequest.onHeadersReceived.addListener(function (details) {
            for (let i = 0; i < details.responseHeaders.length; ++i) {
                if (details.responseHeaders[i].name === 'etag') {
                    details.responseHeaders.splice(i, 1);
                    break;
                }
            }
            //console.log(details);
            return {requestHeaders: details.responseHeaders};
        },
        {
            urls: ["http://*/*",
                "https://*/*"]
        },
        ["blocking", "responseHeaders"]
    );

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

        if (request.action === "block_cookies") {
            blockCookies(true);
        }

        if (request.action === "unblock_cookies") {
            blockCookies(false);
        }

        if (request.action === "block_3rd") {
            block3rdCookies(false);
        }

        if (request.action === "unblock_3rd") {
            block3rdCookies(true);
        }

        if (request.action === "js_off_all") {
            blockJsOnAllDomains(domains, true);
        }

        if (request.action === "allow_js_on_domain") {
            blockAllowJsOnDomain(domains, request.domain, request.pattern, "allowed", false);
        }

        if (request.action === "block_js_on_domain") {
            blockAllowJsOnDomain(domains, request.domain, request.pattern, "blocked", true);
        }

        if (request.action === "canvas_off_all") {
            blockCanvasOnAllDomains(domains);
        }

        if (request.action === "allow_canvas_on_domain") {
            blockAllowCanvasOnDomain(domains, request.domain, "allowed");
        }

        if (request.action === "block_canvas_on_domain") {
            blockAllowCanvasOnDomain(domains, request.domain, "blocked");
        }

        if (request.action === "clear_web_identities") {
            clearWebIdentities(domains);
            domains = [];
            sendResponse("web identities cleared!");
        }

        if (request.action === "clear_web_identity") {
            clearWebIdentity(request.domain, domains);
            storeItem("domains", JSON.stringify(domains));
            console.log(domains);
        }

        if (request.action === "get_all_identities") {
            if (domains === null || typeof domains === "undefined") {
                sendResponse(null);
            } else {
                let identitiesArray = [];
                for (let i = 0; i < domains.length; i++) {
                    identitiesArray.push(getItem(domains[i]));
                }
                sendResponse(identitiesArray);
            }
        }

        if (request.action === "set_parent_location") {
            parentLocation = getBaseDomain(request.host);
        }

        if (request.action === "get_web_identity") {
            console.log("get_web_identity " + parentLocation);
            let domain = getBaseDomain(parentLocation);
            for (let i = 0; i < domains.length; i++) {
                if (domain === domains[i]) {
                    let jsonStringWebIdentity = getItem(domain);
                    console.log(jsonStringWebIdentity);
                    sendResponse(JSON.parse(jsonStringWebIdentity));
                    break;
                }
            }
            console.log(sender);
        }
    });
}

//--------------event fired when a cookie is changed
chrome.cookies.onChanged.addListener(function (changeInfo) {
    /*
    console.log('Cookie changed: ' +
        '\n * Cookie: ' + JSON.stringify(changeInfo.cookie) +
        '\n * Cause: ' + changeInfo.cause +
        '\n * Removed: ' + changeInfo.removed);
     */

    if (changeInfo.removed === true) {
        console.log("removed");
        chrome.runtime.sendMessage({
            action: "remove_cookie",
            cookie: changeInfo.cookie
        });
    }
});
