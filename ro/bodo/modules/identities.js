function getAllIdentities() {
    chrome.runtime.sendMessage({
        action: "get_all_identities",
    }, function (identitiesArray) {
        if (identitiesArray === null) {
            return;
        }

        let objIdentity;
        fetch('../database/tablecontent.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                //console.log(myJson);
                for (let i = 0; i < identitiesArray.length; i++) {
                    objIdentity = JSON.parse(identitiesArray[i]);
                    myJson.domain.value = objIdentity.base_domain;
                    myJson.description.value = objIdentity.description;
                    myJson.profile_id.value = objIdentity.profile_id;
                    myJson.user_agent.value = objIdentity.user_agent;
                    myJson.accept_default.value = objIdentity.accept_default;
                    myJson.accept_encoding.value = objIdentity.accept_encoding;
                    myJson.accept_language.value = objIdentity.accept_lang;
                    myJson.platform.value = objIdentity.platform_spoof;
                    myJson.screen_resolution.value = objIdentity.screen_resolution;
                    myJson.app_version.value = objIdentity.app_version;
                    myJson.app_name.value = objIdentity.app_name;
                    myJson.pixel_depth.value = objIdentity.pixel_depth;
                    myJson.color_depth.value = objIdentity.color_depth;
                    myJson.vendor_spoof.value = objIdentity.vendor_spoof;
                    myJson.vendorSub_spoof.value = objIdentity.vendorSub_spoof;
                    myJson.protocol.value = objIdentity.protocol;
                    myJson.JS.action = objIdentity.jsVar;
                    myJson.canvas2D.action = objIdentity.canvasVar;
                    myJson.Requests.value = buildRequestsString(objIdentity.requests);
                    myJson.timezoneOffset.value = objIdentity.timezoneOffset;

                    appendStructureIdentity(myJson, i);
                }
            });
    });
}

function appendStructureIdentity(myJson, i) {
    //temp vars
    let bkg = chrome.extension.getBackgroundPage();

    //--------------

    let structure = "";
    let insideStructure = "";
    let insideTable = "";
    structure += "<div class=\"card card-identity\" id=" + "card-identity" + i + ">\n" +
        "                         <div class=\"card-header equal-align\">\n" +
        "                            <a class=\"card-link first-three\" data-toggle=\"collapse\" href=\"#collapse-identity" + i + "\">\n" +
        "                                <i class=\"fa fa-angle-double-down identity-area sageata\"></i>\n" +
        "                            </a>\n" +
        "                            <div class=\"first-three equal-align-inside\">\n" +
        "                                <div class=\"equal-align-inside\">\n" +
        "                                   <p>" + myJson.domain.value + "<span hidden class='identity-area domain-search'>" + myJson.domain.value + ";" + i + "</span></p>\n" +
        "                                   <div style='margin-right: 20px;'>\n" +
        "                                        <label class=\"label wrapper-toggle-js\">\n" +
        "                                           <div class=\"toggle\">\n" +
        "                                               <input class=\"toggle-state dynamic-toggle-js\" id=\"toggle-js" + i + "\" type=\"checkbox\" name=\"check\" value=\"check\"/>\n" +
        "                                                <div class=\"toggle-inner\">\n" +
        "                                                   <div class=\"indicator\"></div>\n" +
        "                                                </div>\n" +
        "                                               <div class=\"active-bg\"></div>\n" +
        "                                           </div>\n" +
        "                                        </label>\n" +
        "                                   </div>\n" +
        "                                 </div>\n" +
        "                                 <div style='margin-right: 34px;'>\n" +
        "                                        <label class=\"label wrapper-toggle-canvas\">\n" +
        "                                           <div class=\"toggle\">\n" +
        "                                               <input class=\"toggle-state dynamic-toggle-canvas\" id=\"toggle-canvas" + i + "\" type=\"checkbox\" name=\"check\" value=\"check\"/>\n" +
        "                                               <div class=\"toggle-inner\">\n" +
        "                                                   <div class=\"indicator\"></div>\n" +
        "                                               </div>\n" +
        "                                               <div class=\"active-bg\"></div>\n" +
        "                                           </div>\n" +
        "                                       </label>\n" +
        "                                 </div>\n" +
        "                             </div>\n" +
        "                             <i class=\"fas fa-trash identity-area\" data-toggle=\"tooltip\" title=\"Delete on this domain\"></i>\n" +
        "                          </div>\n" +
        "                          <div>\n" +
        "                             <div id=\"collapse-identity" + i + "\" class=\"collapse table-constraints\" data-parent=\"#accordion-identity\">\n" +
        "                             </div>\n" +
        "                          </div>\n" +
        "           </div>";
    $("#accordion-identity").append(structure);

    insideTable += "               <div class=\"table-container identity-table-container\">\n" +
        "                            <table class=\"table table-hover identity-table\" id=" + "table-identity" + i + ">\n" +
        "                                <thead class=\"thead-light\">\n" +
        "                                 <tr>\n" +
        "                                     <th>Attribute</th>\n" +
        "                                     <th>Value</th>\n" +
        "                                     <th>Action</th>\n" +
        "                                 </tr>\n" +
        "                                </thead>\n" +
        "                                <tbody>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Description</td>\n" +
        "                                    <td>" + myJson.description.value + "</td>\n" +
        "                                    <td>" + myJson.description.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Profile ID</td>\n" +
        "                                    <td>" + myJson.profile_id.value + "</td>\n" +
        "                                    <td>" + myJson.profile_id.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">User Agent</td>\n" +
        "                                    <td>" + myJson.user_agent.value + "</td>\n" +
        "                                    <td>" + myJson.user_agent.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Accept</td>\n" +
        "                                    <td>" + myJson.accept_default.value + "</td>\n" +
        "                                    <td>" + myJson.accept_default.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Content encoding</td>\n" +
        "                                    <td>" + myJson.accept_encoding.value + "</td>\n" +
        "                                    <td>" + myJson.accept_encoding.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Content language</td>\n" +
        "                                    <td>" + myJson.accept_language.value + "</td>\n" +
        "                                    <td>" + myJson.accept_language.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Mime Types</td>\n" +
        "                                    <td>" + myJson.mimeTypes.value + "</td>\n" +
        "                                    <td>" + myJson.mimeTypes.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">List of plugins</td>\n" +
        "                                    <td>" + myJson.navigator_plugins.value + "</td>\n" +
        "                                    <td>" + myJson.navigator_plugins.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Timezone Offset</td>\n" +
        "                                    <td>" + myJson.timezoneOffset.value + "</td>\n" +
        "                                    <td>" + myJson.timezoneOffset.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Battery</td>\n" +
        "                                    <td>" + myJson.navigator_battery.value + "</td>\n" +
        "                                    <td>" + myJson.navigator_battery.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Get_Battery</td>\n" +
        "                                    <td>" + myJson.navigator_getBattery.value + "</td>\n" +
        "                                    <td>" + myJson.navigator_getBattery.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">AudioContext</td>\n" +
        "                                    <td>" + myJson.window_AudioContext.value + "</td>\n" +
        "                                    <td>" + myJson.window_AudioContext.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">WebKit-AudioContext</td>\n" +
        "                                    <td>" + myJson.window_webkitAudioContext.value + "</td>\n" +
        "                                    <td>" + myJson.window_webkitAudioContext.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Platform</td>\n" +
        "                                    <td>" + myJson.platform.value + "</td>\n" +
        "                                    <td>" + myJson.platform.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Screen resolution</td>\n" +
        "                                    <td>" + myJson.screen_resolution.value + "</td>\n" +
        "                                    <td>" + myJson.screen_resolution.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Canvas</td>\n" +
        "                                    <td>" + myJson.canvas2D.value + "</td>\n" +
        "                                    <td>" + myJson.canvas2D.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">WebGl</td>\n" +
        "                                    <td>" + myJson.webgl_api.webgl.value + "</td>\n" +
        "                                    <td>" + myJson.webgl_api.webgl.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Experimental-WebGl</td>\n" +
        "                                    <td>" + myJson.webgl_api.experimentalWebgl.value + "</td>\n" +
        "                                    <td>" + myJson.webgl_api.experimentalWebgl.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">WebGl2</td>\n" +
        "                                    <td>" + myJson.webgl_api.webgl2.value + "</td>\n" +
        "                                    <td>" + myJson.webgl_api.webgl2.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Experimentl-WebGl2</td>\n" +
        "                                    <td>" + myJson.webgl_api.experimentalWebgl2.value + "</td>\n" +
        "                                    <td>" + myJson.webgl_api.experimentalWebgl2.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Flash</td>\n" +
        "                                    <td>" + myJson.content_settings.flash.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.flash.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Location</td>\n" +
        "                                    <td>" + myJson.content_settings.location.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.location.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Popups</td>\n" +
        "                                    <td>" + myJson.content_settings.popups.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.popups.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Notifications</td>\n" +
        "                                    <td>" + myJson.content_settings.notifications.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.notifications.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Camera</td>\n" +
        "                                    <td>" + myJson.content_settings.camera.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.camera.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">Microphone</td>\n" +
        "                                    <td>" + myJson.content_settings.microphone.value + "</td>\n" +
        "                                    <td>" + myJson.content_settings.microphone.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\">JS</td>\n" +
        "                                    <td>" + myJson.JS.value + "</td>\n" +
        "                                    <td>" + myJson.JS.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\" id=\"protocol" + i + "\">Protocol</td>\n" +
        "                                    <td>" + myJson.protocol.value + "</td>\n" +
        "                                    <td>" + myJson.protocol.action + "</td>\n" +
        "                                </tr>\n" +
        "                                <tr>\n" +
        "                                    <td class=\"first-td\" id=\"requests" + i + "\">Requests</td>\n" +
        "                                    <td>" + myJson.Requests.value + "</td>\n" +
        "                                    <td>" + myJson.Requests.action + "</td>\n" +
        "                                </tr>\n" +
        "                                </tbody>\n" +
        "                            </table>\n" +
        "                            </div>\n";
    $("#collapse-identity" + i).append(insideTable);

    if (myJson.canvas2D.action === "allowed") {
        $("#toggle-canvas" + i).prop('checked', true);
    } else if (myJson.canvas2D.action === "blocked") {
        $("#toggle-canvas" + i).prop('checked', false);
    }

    if (myJson.JS.action === "allowed") {
        $("#toggle-js" + i).prop('checked', true);

        $("#toggle-canvas" + i).parent().parent().prop('disabled', false);
        $("#toggle-canvas" + i).parent().parent().removeClass('my-disabled');
        $("#toggle-canvas" + i).prop('disabled', false);

    } else if (myJson.JS.action === "blocked") {
        $("#toggle-js" + i).prop('checked', false);

        $("#toggle-canvas" + i).parent().parent().prop('disabled', true);
        $("#toggle-canvas" + i).parent().parent().addClass('my-disabled');
        $("#toggle-canvas" + i).prop('disabled', true);
    }
}

function checkState() {
    let jsALL = getItem('jsALL');
    let canvasALL = getItem('canvasALL');

    if (typeof jsALL === "undefined") {
        jsALL = 'jsON';
    }

    if (typeof canvasALL === "undefined") {
        canvasALL = 'canvasOFF';
    }

    if (jsALL === "jsON") {
        $('#toggle-js').prop('checked', true);
        $('#toggle-canvas-wrapper').removeClass('my-disabled');
        $('#toggle-canvas').prop('disabled', false);
        jsOnAll();

        if (canvasALL === "canvasON") {
            $('#toggle-canvas').prop('checked', true);
            canvasOnAll();
        }

        if (canvasALL === "canvasOFF") {
            $('#toggle-canvas').prop('checked', false);
            canvasOffAll();
        }
    }

    if (jsALL === "jsOFF") {
        $('#toggle-js').prop('checked', false);
        $('#toggle-canvas-wrapper').addClass('my-disabled');
        $('#toggle-canvas').prop('disabled', true);
        jsOffAll();
        canvasOffAll();
    }
}

function canvasOffAll() {
    $('.dynamic-toggle-canvas').prop('checked', false);
    $('.wrapper-toggle-canvas').prop('disabled', true);
    $('.wrapper-toggle-canvas').addClass('my-disabled');
    $('.dynamic-toggle-canvas').prop('disabled', true);
}

function canvasOnAll() {
    //let bkg = chrome.extension.getBackgroundPage();
    $('.wrapper-toggle-canvas').each(function () {
        let $inputToggle = $(this).children("div").eq(0).children("input").eq(0);
        //bkg.console.log($inputToggle);
        let id = $inputToggle.attr('id');
        //bkg.console.log(id);
        let n = id.indexOf("s");
        let i = id.substr(n + 1, id.length -1);
        //bkg.console.log(i);
        if ($("#toggle-js" + i).prop('checked')) {
            $(this).prop('disabled', false);
            $(this).removeClass('my-disabled');
            $("#" + id).prop('disabled', false);
            //bkg.console.log("#" + id);
        }
    });
}

function jsOffAll() {
    $('.dynamic-toggle-js').prop('checked', false);
    $('.wrapper-toggle-js').prop('disabled', true);
    $('.wrapper-toggle-js').addClass('my-disabled');
    $('.dynamic-toggle-js').prop('disabled', true);
}

function jsOnAll() {
    $('.wrapper-toggle-js').prop('disabled', false);
    $('.wrapper-toggle-js').removeClass('my-disabled');
    $('.dynamic-toggle-js').prop('disabled', false);
}

function filterIdentities() {
    if (!$('.card-identity')[0]) {
        return;
    }

    let filter = $("#search-identities").val().toLowerCase();
    $(".identity-area.domain-search").each(function () {
        let arr = $(this).text().split(";");
        if (arr[0].toLowerCase().indexOf(filter) === -1) {
            $("#card-identity" + arr[1]).hide();
        } else {
            $("#card-identity" + arr[1]).show();
        }
    });
}

function getDomainFromWebIdentity(toggleElem, string) {
    let $equalAlignInside;
    let arr;

    if (string === "js") {
        $equalAlignInside = $(toggleElem).parent().parent().parent().parent().children("p").eq(0);
    }

    if (string === "canvas") {
        $equalAlignInside = $(toggleElem).parent().parent().parent().parent().children("div").eq(0).children("p").eq(0);
    }

    arr = $equalAlignInside.children("span").eq(0).text().split(";");
    return arr;
}

$(document).on('click', '.dynamic-toggle-js', function () {

    //idToggle e this.id
    let canvasALL = getItem('canvasALL');
    if (typeof canvasALL === "undefined") {
        canvasALL = "canvasOFF";
    }

    let bkg = chrome.extension.getBackgroundPage();
    let arr = getDomainFromWebIdentity(this, "js");
    bkg.console.log(arr);
    let urlPattern =  "*://*." + arr[0] + ":*/*";

    //if checked
    if ($("#" + this.id).prop('checked')) {

        if (canvasALL === "canvasON") {
            $("#toggle-canvas" + arr[1]).parent().parent().prop('disabled', false);
            $("#toggle-canvas" + arr[1]).parent().parent().removeClass('my-disabled');
            $("#toggle-canvas" + arr[1]).prop('disabled', false);
        }

        chrome.runtime.sendMessage({
            action: "allow_js_on_domain",
            pattern: urlPattern,
            domain: arr[0]
        }, function (response) {
        });
        return;
    }

    //if not checked - if false
    if (!$("#" + this.id).prop('checked')) {

        $("#toggle-canvas" + arr[1]).parent().parent().prop('disabled', true);
        $("#toggle-canvas" + arr[1]).parent().parent().addClass('my-disabled');
        $("#toggle-canvas" + arr[1]).prop('disabled', true);
        $("#toggle-canvas" + arr[1]).prop('checked', false);

        chrome.runtime.sendMessage({
            action: "block_js_on_domain",
            pattern: urlPattern,
            domain: arr[0]
        }, function (response) {
        });

        chrome.runtime.sendMessage({
            action: "block_canvas_on_domain",
            domain: arr[0]
        }, function (response) {
        });

        return;
    }
});

$(document).on('click', '.dynamic-toggle-canvas', function () {

    //idToggle e this.id

    let bkg = chrome.extension.getBackgroundPage();
    let arr = getDomainFromWebIdentity(this, "canvas");
    bkg.console.log(arr);

    //if checked
    if ($("#" + this.id).prop('checked')) {
        chrome.runtime.sendMessage({
            action: "allow_canvas_on_domain",
            domain: arr[0]
        }, function (response) {
        });
        return;
    }

    //if not checked - if false
    if (!$("#" + this.id).prop('checked')) {
        chrome.runtime.sendMessage({
            action: "block_canvas_on_domain",
            domain: arr[0]
        }, function (response) {
        });
        return;
    }
});

$(document).on('click', '.identity-area.fa-trash', function () {
    let bkg = chrome.extension.getBackgroundPage();
    if ($(this).attr('data-original-title') === "Delete ALL Identities") {
        $('.card-identity').remove();
        chrome.runtime.sendMessage({
            action: "clear_web_identities",
        }, function (response) {
            bkg.console.log(response);
        });
    }

    if ($(this).attr('data-original-title') === "Delete on this domain") {
        $(this).tooltip('hide');
        let arr = $(this).parent().children("div").eq(0).children("div").eq(0).children("p").eq(0).children("span").eq(0).text().split(";");
        bkg.console.log(arr);
        $("#card-identity" + arr[1]).remove();
        chrome.runtime.sendMessage({
            action: "clear_web_identity",
            domain: arr[0]
        }, function (response) {
            bkg.console.log(response);
        });
    }
});

function buildRequestsString(requests) {
    if (requests === null){
        return "";
    }

    let str = "";
    for (let i = 0; i < requests.length; i++) {
        str += requests[i] + "; ";
    }
    return str;
}