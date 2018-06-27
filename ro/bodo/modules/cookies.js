function removeCookie(cookie) {
    let bkg = chrome.extension.getBackgroundPage();
    //bkg.console.log("i m in my removeCookie; i should remove " + JSON.stringify(cookie));
    chrome.cookies.remove({
        url: "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain + cookie.path,
        name: cookie.name,
        storeId: cookie.storeId
    }, function (details) {
        if (details === null) {
            bkg.console.log(chrome.runtime.lastError);
        } else {
            bkg.console.log(details.url + " - " + details.name + " - " + details.storeId + " -- deleted!");
        }
    });
}

function getAllCookies() {
    chrome.cookies.getAll({}, function (all_cookies) {
        let myObj = {};
        let domains = [];
        for (let i = 0; i < all_cookies.length; i++) {
            if (typeof myObj[all_cookies[i].domain] === "undefined") {
                myObj[all_cookies[i].domain] = [];

                pushDomain(domains, all_cookies[i].domain);
            }
            myObj[all_cookies[i].domain].push(all_cookies[i]);
        }

        let size = Object.keys(myObj).length;
        for (let i = 0; i < size; i++) {
            appendStructureCookies(myObj[domains[i]], i, domains[i]);
        }
    });
}

function appendStructureCookies(cookieList, i, domain) {
    //temp vars
    let bkg = chrome.extension.getBackgroundPage();

    //--------------

    let structure = "";
    let insideStructure = "";
    let insideTable = "";
    let idDomain = changeIdDomain(domain, i);
    structure += "<div class=\"card cookie-card\" id=" + "card" + i + ">\n" +
        "                         <div class=\"card-header equal-align\">\n" +
        "                              <a class=\"card-link first-three\" data-toggle=\"collapse\" href=\"#collapse" + i + "\">\n" +
        "                                 <i class=\"fa fa-angle-double-down cookie-area sageata\"></i>\n" +
        "                              </a>\n" +
        "                           <div class=\"equal-align-inside\">\n" +
        "                              <p class=\"first-three\">" + domain + "<span hidden class='cookie-area domain-search'>" + domain + ";" + i + "</span></p>\n" +
        "                              <p class=\"first-three\"><span>" + cookieList.length + "</span></p>\n" +
        "                           </div>\n" +
        "                              <i class=\"fas fa-trash cookie-area\" data-toggle=\"tooltip\" title=\"Delete on this domain\"></i>\n" +
        "                          </div>\n" +
        "                          <div>\n" +
        "                             <div id=\"collapse" + i + "\" class=\"collapse cookie-list\" data-parent=\"#accordion\">\n" +
        "                             </div>\n" +
        "                          </div>\n" +
        "           </div>";
    $("#accordion").append(structure);

    insideStructure += "<ul>";
    for (let j = 0; j < cookieList.length; j++) {
        if (j === 0) {
            insideStructure += "<li><a href=\"#\" class=\"active anchor cookie-area\" id=" + idDomain + j + ">" + cookieList[j].name + "\n" +
                "<i class=\"fas fa-trash trash-single-cookie cookie-area\" data-toggle=\"tooltip\" title=\"Delete this cookie\"></i>" +
                "<span hidden class='hidden-json'>" + JSON.stringify(cookieList[j]) + "</span> </a></li>";
        } else {
            insideStructure += "<li><a href=\"#\" class=\"anchor cookie-area\" id=" + idDomain + j + ">" + cookieList[j].name + "\n" +
                "<i class=\"fas fa-trash trash-single-cookie cookie-area\" data-toggle=\"tooltip\" title=\"Delete this cookie\"></i>" +
                "<span hidden class='hidden-json'>" + JSON.stringify(cookieList[j]) + "</span> </a></li>";
        }
    }
    insideStructure += "</ul>";
    $("#collapse" + i).append(insideStructure);

    insideTable += "               <div class=\"table-container\">\n" +
        "                            <table class=\"table table-hover cookie-table\" id=" + idDomain + ">\n" +
        "                                <tbody>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Expiration date</td>\n" +
        "                                    <td id=" + "expDate" + idDomain + ">" + formatTime(cookieList[0].expirationDate) + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">HostOnly</td>\n" +
        "                                    <td id=" + "hostOnly" + idDomain + ">" + cookieList[0].hostOnly + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">HttpOnly</td>\n" +
        "                                    <td id=" + "httpOnly" + idDomain + ">" + cookieList[0].httpOnly + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Path</td>\n" +
        "                                    <td id=" + "path" + idDomain + ">" + cookieList[0].path + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Same site</td>\n" +
        "                                    <td id=" + "sameSite" + idDomain + ">" + cookieList[0].sameSite + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Secure</td>\n" +
        "                                    <td id=" + "secure" + idDomain + ">" + cookieList[0].secure + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Session</td>\n" +
        "                                    <td id=" + "session" + idDomain + ">" + cookieList[0].session + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">StoreId</td>\n" +
        "                                    <td id=" + "storeId" + idDomain + ">" + cookieList[0].storeId + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Value</td>\n" +
        "                                    <td id=" + "value" + idDomain + ">" + cookieList[0].value + "</td>\n" +
        "                                </tr>\n" +
        "                                </tbody>\n" +
        "                            </table>\n" +
        "                            </div>\n";
    $("#collapse" + i).append(insideTable);
}

function changeTable(elem, idDomain) {
    //let bkg = chrome.extension.getBackgroundPage();
    /*
    bkg.console.log(" --> in change table: " + idDomain);
    bkg.console.log("#expDate" + idDomain);
    bkg.console.log("#hostOnly" + idDomain);
    bkg.console.log("#path" + idDomain);
    bkg.console.log($("#expDate" + idDomain).text());
    bkg.console.log($("#hostOnly" + idDomain).text());
    */
    if (typeof elem.expirationDate === "undefined") {
        $("#expDate" + idDomain).text(elem.expirationDate);
    } else {
        $("#expDate" + idDomain).text(formatTime(elem.expirationDate));
    }

    $("#hostOnly" + idDomain).text(elem.hostOnly);
    $("#httpOnly" + idDomain).text(elem.httpOnly);
    $("#path" + idDomain).text(elem.path);
    $("#sameSite" + idDomain).text(elem.sameSite);
    $("#secure" + idDomain).text(elem.secure);
    $("#session" + idDomain).text(elem.session);
    $("#storeId" + idDomain).text(elem.storeId);
    $("#value" + idDomain).text(elem.value);
}

function getCookiesNumberFromAnchor(anchorElem) {
    let $equalAlign = $(anchorElem).parent().parent().parent().parent().parent().children("div").eq(0);
    let number = $equalAlign.children("div").eq(0).children("p").eq(1).children("span").eq(0).text();
    return number;
}

function setCookiesNumberFromAnchor(anchorElem, number) {
    let $equalAlign = $(anchorElem).parent().parent().parent().parent().parent().children("div").eq(0);
    $equalAlign.children("div").eq(0).children("p").eq(1).children("span").eq(0).text(number);
}

function getIdDomainFromAnchor(anchorElem) {
    let $equalAlign = $(anchorElem).parent().parent().parent().parent().parent().children("div").eq(0);
    let arr = $equalAlign.children("div").eq(0).children("p").eq(0).children("span").eq(0).text().split(";");
    let idDomain = changeIdDomain(arr[0], arr[1]);
    return idDomain;
}


$(document).on('click', '.cookie-area.anchor', function () {
    let bkg = chrome.extension.getBackgroundPage();
    let idDomain = getIdDomainFromAnchor(this);

    if (trashClassActive === false && trashClicked === false) {
        $('.anchor.active').each(function () {
            if (idDomain === getIdDomainFromAnchor(this)) {
                $("#" + this.id).removeClass("active");
            }
        });


        $("#" + this.id).addClass("active");
        let objString = $("#" + this.id + " .hidden-json").text();
        let obj = JSON.parse(objString);
        changeTable(obj, idDomain);
    }

});

$(document).on('click', '.cookie-area.sageata', function () {
    trashClicked = false;
    trashClassActive = false;
});

$(document).on('click', '.cookie-area.fa-trash', function () {
    let bkg = chrome.extension.getBackgroundPage();
    let cookieString;
    let cookie;
    if ($(this).attr('data-original-title') === "Delete ALL Cookies") {
        $('.anchor').each(function () {
            cookieString = $("#" + this.id + " .hidden-json").text();
            cookie = JSON.parse(cookieString);
            removeCookie(cookie);
        });
    }

    if ($(this).attr('data-original-title') === "Delete on this domain") {
        $(this).tooltip('hide');
        let arr = $(this).parent().children("div").eq(0).children("p").eq(0).children("span").eq(0).text().split(";");
        let idDomain = changeIdDomain(arr[0], arr[1]);
        bkg.console.log(idDomain);
        $('.anchor').each(function () {
            if (idDomain === getIdDomainFromAnchor(this)) {
                cookieString = $("#" + this.id + " .hidden-json").text();
                cookie = JSON.parse(cookieString);
                removeCookie(cookie);
            }
        });
    }

    if ($(this).attr('data-original-title') === "Delete this cookie") {
        trashClicked = true;
        if ($(this).parent().hasClass("active")) {
            trashClassActive = true;
        }

        bkg.console.log("Delete this cookie");
        let idCookie = $(this).parent().attr('id');
        bkg.console.log(idCookie);
        $('.anchor').each(function () {
            if (idCookie === this.id) {
                bkg.console.log("i m in --> this.id:" + this.id);
                cookieString = $("#" + this.id + " .hidden-json").text();
                cookie = JSON.parse(cookieString);
                removeCookie(cookie);
            }
        });
    }
});

function changeIdDomain(domain, i) {
    let x = domain.split(".");
    let str = "";
    for (let i = 0; i < x.length; i++) {
        str += x[i];
    }

    str += i;

    return str;
}

function filterCookies() {
    if (!$('.cookie-card')[0]) {
        return;
    }

    let filter = $("#search-cookies").val().toLowerCase();
    $(".cookie-area.domain-search").each(function () {
        let arr = $(this).text().split(";");
        if (arr[0].toLowerCase().indexOf(filter) === -1) {
            $("#card" + arr[1]).hide();
        } else {
            $("#card" + arr[1]).show();
        }
    });
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

function formatTime(a) {
    function b(a) {
        return a.toString().length < 2 ? "0" + a : a
    }

    let c = a + "";
    let ts = parseInt(c.slice(0, -3));
    let d = c.slice(-3),
        e = new Date(1e3 * ts),
        f = b(e.getHours()),
        g = b(e.getMinutes()),
        h = b(e.getSeconds());
    return e.getUTCFullYear() + "-" + b(e.getUTCMonth() + 1) + "-" + b(e.getUTCDate()) + "  " + f + ":" + g + ":" + h + "." + d
}