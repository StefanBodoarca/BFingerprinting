var trashClassActive = false;
var trashClicked = false;

$(document).ready(function () {
    //variables
    let bkg = chrome.extension.getBackgroundPage();

    //enable tooltips
    $('body').tooltip({
        selector: '[data-toggle = tooltip]',
        trigger: 'hover'
    });

    $('body').on('click', '.my-href', function () {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });

    getAllIdentities();
    setTimeout(function () {
        checkState();
    }, 500);
    checkCookiesState(bkg);
    getAllCookies();
    manageToggles(bkg);
    checkProxyState();

    $("#sync-identities").click(function () {
        $('.card-identity').remove();
        getAllIdentities();
        setTimeout(function () {
            checkState();
        }, 500);
    });

    $("#search-identities").keyup(filterIdentities);
    $("#search-cookies").keyup(filterCookies);

    $("#sync-cookies").click(function () {
        $('.cookie-card').remove();
        getAllCookies();
    });

    $("#torButtonCheck").click(function () {
        if ($(this).prop('checked')) {
            storeItem('torVar', 'torON');
            chrome.proxy.settings.set({
                "scope": "regular",
                "value": {
                    "mode": "fixed_servers",
                    "rules": {
                        "bypassList": [],
                        "singleProxy": {
                            "scheme": "socks5",
                            "host": "127.0.0.1",
                            "port": 9050
                        }
                    }
                }
            });

            $("#proxyLabel").text("127.0.0.1:9050");
        }

        if (!$(this).prop('checked')) {
            storeItem('torVar', 'torOFF');
            chrome.proxy.settings.set({
                "scope": "regular",
                "value": {
                    "mode": "system"
                }
            });

            $("#proxyLabel").text("Turn on Tor Proxy");
        }
    });

    $("#checkALL").click(function () {
        $('.browsing-checkbox').prop('checked', true);
    });

    $("#uncheckALL").click(function () {
        $('.browsing-checkbox').prop('checked', false);
    });
    
    $("#deleteBrowsingData").click(function () {
        $("#checkALL").prop('disabled', true);
        $("#uncheckALL").prop('disabled', true);
        $("#checkALL").addClass('my-disabled');
        $("#uncheckALL").addClass('my-disabled');
        $('.browsing-checkbox').prop('disabled', true);
        $('.browsing-checkbox').addClass('my-disabled');
        $("#deleteBrowsingData").prop('disabled', true);
        $("#deleteBrowsingData").addClass('my-disabled');
        chrome.browsingData.remove({}, {
            "appcache": $("#customAppCache").prop('checked'),
            "cache": $("#customCache").prop('checked'),
            "cookies": $("#customCookies").prop('checked'),
            "downloads": $("#customDownloads").prop('checked'),
            "fileSystems": $("#customFileSystem").prop('checked'),
            "formData": $("#customFormData").prop('checked'),
            "history": $("#customHistory").prop('checked'),
            "indexedDB": $("#customIndexedDB").prop('checked'),
            "localStorage": $("#customLocalStorage").prop('checked'),
            "pluginData": $("#customPluginData").prop('checked'),
            "passwords": $("#customStoredPasswords").prop('checked'),
            "serviceWorkers" : $("#customServiceWorkers").prop('checked'),
            "webSQL": $("#customWebSql").prop('checked')
        }, function () {
            $("#checkALL").prop('disabled', false);
            $("#uncheckALL").prop('disabled', false);
            $("#checkALL").removeClass('my-disabled');
            $("#uncheckALL").removeClass('my-disabled');
            $('.browsing-checkbox').prop('disabled', false);
            $('.browsing-checkbox').removeClass('my-disabled');
            $("#deleteBrowsingData").prop('disabled', false);
            $("#deleteBrowsingData").removeClass('my-disabled');
            $('.browsing-checkbox').prop('checked', false);
        });
    });

    $("#toggle-cookie").click(function () {
        if ($(this).prop('checked')) {
            $("#toggle-3rd").prop('checked', true);
            $("#toggle-3rd").prop('disabled', true);
            $("#toggle-3rd-wrapper").addClass('my-disabled');
            storeItem('cookieVar', 'cookieOFF');
            storeItem('thirdVar', 'thirdOFF');
            chrome.runtime.sendMessage({
                action: "block_3rd",
            }, function (response) {
            });
            chrome.runtime.sendMessage({
                action: "block_cookies",
            }, function (response) {
            });
        }

        if (!$(this).prop('checked')) {
            $("#toggle-3rd").prop('disabled', false);
            $("#toggle-3rd-wrapper").removeClass('my-disabled');
            storeItem('cookieVar', 'cookieON');
            chrome.runtime.sendMessage({
                action: "unblock_cookies",
            }, function (response) {
            });
        }
    });

    $("#toggle-3rd").click(function () {
        if ($(this).prop('checked')) {
            storeItem('thirdVar', 'thirdOFF');
            chrome.runtime.sendMessage({
                action: "block_3rd",
            }, function (response) {
            });
        }

        if (!$(this).prop('checked')) {
            storeItem('thirdVar', 'thirdON');
            chrome.runtime.sendMessage({
                action: "unblock_3rd",
            }, function (response) {
            });
        }
    });
});

function checkProxyState() {
    let torVar = getItem('torVar');
    if (typeof torVar === "undefined") {
        torVar = 'torOFF';
    }
    if (torVar === "torON") {
        $("#torButtonCheck").prop('checked', true);
        $("#proxyLabel").text("127.0.0.1:9050");
    } else if (torVar === "torOFF") {
        $("#torButtonCheck").prop('checked', false);
        $("#proxyLabel").text("Turn on Tor Proxy");
    }
}

function checkCookiesState(bkg) {
    let cookieVar = getItem('cookieVar');
    let thirdVar = getItem('thirdVar');
    bkg.console.log("thirdVar " + thirdVar);
    bkg.console.log("cookieVar " + cookieVar);
    if (typeof cookieVar === "undefined") {
        cookieVar = 'cookieON';
    }
    if (typeof thirdVar === "undefined") {
        thirdVar = 'thirdOFF';
    }
    if (thirdVar === "thirdON") {
        $("#toggle-3rd").prop('checked', false);
    } else if (thirdVar === "thirdOFF") {
        $("#toggle-3rd").prop('checked', true);
    }
    if (cookieVar === "cookieON") {
        $("#toggle-cookie").prop('checked', false);
    } else if (cookieVar === "cookieOFF") {
        $("#toggle-cookie").prop('checked', true);
        $("#toggle-3rd").prop('checked', true);
        $("#toggle-3rd").prop('disabled', true);
        $("#toggle-3rd-wrapper").addClass('my-disabled');
    }
}

function manageToggles(bkg) {
    let jsALL = getItem('jsALL');
    let canvasALL = getItem('canvasALL');

    if (typeof jsALL === "undefined") {
        jsALL = 'jsON';
    }

    if (typeof canvasALL === "undefined") {
        canvasALL = 'canvasOFF';
    }

    $('#toggle-js').click(function () {
        //if true
        if ($(this).prop('checked')) {

            storeItem('jsALL', 'jsON');

            $('#toggle-canvas-wrapper').removeClass('my-disabled');
            $('#toggle-canvas').prop('disabled', false);
            jsOnAll();

            if (canvasALL === "canvasON") {
                canvasOnAll();
            }

            if (canvasALL === "canvasOFF") {
                canvasOffAll();
            }
        }

        //if false
        if (!$(this).prop('checked')) {

            storeItem('jsALL', 'jsOFF');

            $('#toggle-canvas-wrapper').addClass('my-disabled');
            $('#toggle-canvas').prop('disabled', true);
            $('#toggle-canvas').prop('checked', false);
            jsOffAll();
            canvasOffAll();

            chrome.runtime.sendMessage({
                action: "js_off_all",
            }, function (response) {
            });
        }
    });

    $('#toggle-canvas').click(function () {
        //if true
        if ($(this).prop('checked')) {
            storeItem('canvasALL', 'canvasON');
            canvasOnAll();
        }

        //if false
        if (!$(this).prop('checked')) {
            storeItem('canvasALL', 'canvasOFF');
            canvasOffAll();
            chrome.runtime.sendMessage({
                action: "canvas_off_all",
            }, function (response) {
            });
        }
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let bkg = chrome.extension.getBackgroundPage();

    if (request.action === "remove_cookie") {
        let cookieString = JSON.stringify(request.cookie);
        //bkg.console.log("deleted cookie --> " + cookieString);
        let objString;
        let idDomain;
        let idReplaceAnchor;
        let cookieObjReplaceElemStr;
        let cookieObjReplaceElem;
        let cookiesNumber;
        let nrCopy;
        let $parent;
        $('.anchor').each(function () {
            objString = $("#" + this.id + " .hidden-json").text();
            if (CryptoJS.SHA256(cookieString).toString() === CryptoJS.SHA256(objString).toString()) {
                cookiesNumber = parseInt(getCookiesNumberFromAnchor(this));
                nrCopy = cookiesNumber;
                cookiesNumber = cookiesNumber - 1;

                setCookiesNumberFromAnchor(this, cookiesNumber);
                idDomain = getIdDomainFromAnchor(this);
                $(this).children("i").eq(0).tooltip('hide');

                if (cookiesNumber == 0) {
                    $parent = $(this).parent().parent().parent().parent().parent();
                    $parent.children("i").eq(0).tooltip('hide');
                    $parent.remove();
                    return;
                } else {
                    $(this).parent().remove();
                }

                for (let i = 0; i < nrCopy; i++) {
                    idReplaceAnchor = idDomain + i;
                    if ($("#" + idReplaceAnchor).length) {
                        break;
                    }
                }

                if (trashClassActive === true) {
                    $("#" + idReplaceAnchor).addClass("active");
                    cookieObjReplaceElemStr = $("#" + idReplaceAnchor + " .hidden-json").text();
                    cookieObjReplaceElem = JSON.parse(cookieObjReplaceElemStr);
                    changeTable(cookieObjReplaceElem, idDomain);
                    trashClassActive = false;
                }
                trashClicked = false;
            }
        });
    }
});

function getItem(key) {
    return localStorage[key];
}

function storeItem(key, value) {
    localStorage[key] = value;
}