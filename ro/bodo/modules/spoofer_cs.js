if (window.self === window.top) {
    chrome.runtime.sendMessage({
        action: "set_parent_location",
        host: parent.document.location.host,
    });
}

chrome.runtime.sendMessage({
    action: "get_web_identity"
}, function (webIdentity) {
    console.log(document.location.href);
    console.log(webIdentity);

    let actualCode = '(' + function (webIdentity) {
        'use strict';
        let navigator = window.navigator;
        let screen = window.screen;
        let modifiedNavigator;
        let modifiedScreen;
        if ('userAgent' in Navigator.prototype) {
            // Chrome 43+ moved all properties from navigator to the prototype,
            // so we have to modify the prototype instead of navigator.
            modifiedNavigator = Navigator.prototype;

        } else {
            // Chrome 42- defined the property on navigator.
            modifiedNavigator = Object.create(navigator);
            Object.defineProperty(window, 'navigator', {
                value: modifiedNavigator,
                configurable: false,
                enumerable: false,
                writable: false
            });
        }

        if ('width' in Screen.prototype) {
            // Chrome 43+ moved all properties from navigator to the prototype,
            // so we have to modify the prototype instead of navigator.
            modifiedScreen = Screen.prototype;

        } else {
            // Chrome 42- defined the property on navigator.
            modifiedScreen = Object.create(screen);
            Object.defineProperty(window, 'screen', {
                value: modifiedScreen,
                configurable: false,
                enumerable: false,
                writable: false
            });
        }

        //spoof navigator
        Object.defineProperties(modifiedNavigator, {
            userAgent: {
                value: webIdentity.user_agent,
                configurable: false,
                enumerable: true,
                writable: false
            },
            appVersion: {
                value: webIdentity.app_version,
                configurable: false,
                enumerable: true,
                writable: false
            },
            platform: {
                value: webIdentity.platform_spoof,
                configurable: false,
                enumerable: true,
                writable: false
            },
            vendor: {
                value: webIdentity.vendor_spoof,
                configurable: false,
                enumerable: true,
                writable: false
            },
            vendorSub: {
                value: webIdentity.vendorSub_spoof,
                configurable: false,
                enumerable: true,
                writable: false
            },
            language: {
                value: webIdentity.language,
                configurable: false,
                enumerable: true,
                writable: false
            },
            languages: {
                value: webIdentity.all_languages,
                configurable: false,
                enumerable: true,
                writable: false
            },
            appName: {
                value: webIdentity.app_name,
                configurable: false,
                enumerable: true,
                writable: false
            },
            battery: {
                value: undefined,
                configurable: false,
                enumerable: true,
                writable: false
            },
            getBattery: {
                value: undefined,
                configurable: false,
                enumerable: true,
                writable: false
            },
            plugins: {
                value: '',
                configurable: false,
                enumerable: true,
                writable: false
            },
            mimeTypes: {
                value: '',
                configurable: false,
                enumerable: true,
                writable: false
            }
        });

        //spoof screen
        Object.defineProperties(modifiedScreen, {
            availHeight: {
                value: webIdentity.height,
                configurable: false,
                enumerable: true,
                writable: false
            },
            availWidth: {
                value: webIdentity.width,
                configurable: false,
                enumerable: true,
                writable: false
            },
            height: {
                value: webIdentity.height,
                configurable: false,
                enumerable: true,
                writable: false
            },
            width: {
                value: webIdentity.width,
                configurable: false,
                enumerable: true,
                writable: false
            },
            colorDepth: {
                value: webIdentity.color_depth,
                configurable: false,
                enumerable: true,
                writable: false
            },
            pixelDepth: {
                value: webIdentity.pixel_depth,
                configurable: false,
                enumerable: true,
                writable: false
            }
        });

        Object.defineProperty(window, 'AudioContext', {
            get: function () {
                return null;
            }
        });

        Object.defineProperty(window, 'webkitAudioContext', {
            get: function () {
                return null;
            }
        });

        Date.prototype.getTimezoneOffset = function() {
            return webIdentity.timezoneOffset;
        };

        //adding noise in canvas element
        (function() {
            let r = webIdentity.zgomot;
            let g = webIdentity.zgomot + 1;
            let b = webIdentity.zgomot + 2;
            let a = webIdentity.zgomot + 3;

            function overrideCanvasProto(root) {
                function overrideCanvasInternal(name, old) {
                    Object.defineProperty(root.prototype, name, {
                        value: function() {
                            let width = this.width;
                            let height = this.height;
                            let context = this.getContext("2d");
                            let imageData = context.getImageData(0, 0, width, height);
                            for (let i = 0; i < height; i++) {
                                for (let j = 0; j < width; j++) {
                                    let index = ((i * (width * 4)) + (j * 4));
                                    imageData.data[index + 0] = imageData.data[index + 0] + r;
                                    imageData.data[index + 1] = imageData.data[index + 1] + g;
                                    imageData.data[index + 2] = imageData.data[index + 2] + b;
                                    imageData.data[index + 3] = imageData.data[index + 3] + a;
                                }
                            }
                            context.putImageData(imageData, 0, 0);
                            return old.apply(this, arguments);
                        }
                    });
                }
                overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
                overrideCanvasInternal("toBlob", root.prototype.toBlob);
            }
            function overrideCanvasRendProto(root) {
                const name = "getImageData";
                const getImageData = root.prototype.getImageData;
                Object.defineProperty(root.prototype, "getImageData", {
                    value: function() {
                        let imageData = getImageData.apply(this, arguments);
                        let height = imageData.height;
                        let width = imageData.width;
                        for (let i = 0; i < height; i++) {
                            for (let j = 0; j < width; j++) {
                                let index = ((i * (width * 4)) + (j * 4));
                                imageData.data[index + 0] = imageData.data[index + 0] + r;
                                imageData.data[index + 1] = imageData.data[index + 1] + g;
                                imageData.data[index + 2] = imageData.data[index + 2] + b;
                                imageData.data[index + 3] = imageData.data[index + 3] + a;
                            }
                        }
                        return imageData;
                    }
                });
            }
            function inject(element) {
                if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
                    try {
                        let hasAccess = element.contentWindow.HTMLCanvasElement;
                    } catch (e) {
                        console.log("can't access " + e);
                        return;
                    }
                    overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
                    overrideCanvasRendProto(element.contentWindow.CanvasRenderingContext2D);
                    overrideDocumentProto(element.contentWindow.Document);
                }
            }
            function overrideDocumentProto(root) {
                function doOverrideDocumentProto(old, name) {
                    Object.defineProperty(root.prototype, name, {
                        value: function() {
                            let element = old.apply(this, arguments);
                            if (element == null) {
                                return null;
                            }
                            if (Object.prototype.toString.call(element) === '[object HTMLCollection]' ||
                                Object.prototype.toString.call(element) === '[object NodeList]') {
                                for (let i = 0; i < element.length; ++i) {
                                    let el = element[i];
                                    inject(el);
                                }
                            } else {
                                inject(element);
                            }
                            return element;
                        }
                    });
                }
                doOverrideDocumentProto(root.prototype.createElement, "createElement");
                doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
                doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
                doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
                doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
                doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
                doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
            }
            overrideCanvasProto(HTMLCanvasElement);
            overrideCanvasRendProto(CanvasRenderingContext2D);
            overrideDocumentProto(Document);
        })();

        if(webIdentity.canvasVar == "blocked") {
            (function() {
                function overrideCanvasProto(root) {
                    function overrideCanvasInternal(name, old) {
                        Object.defineProperty(root.prototype, name, {
                            get: function () {
                                return null;
                            }
                        });
                    }
                    overrideCanvasInternal("toDataURL", root.prototype.toDataURL);
                    overrideCanvasInternal("toBlob", root.prototype.toBlob);
                }
                function overrideCanvasRendProto(root) {
                    const name = "getImageData";
                    const getImageData = root.prototype.getImageData;
                    Object.defineProperty(root.prototype, "getImageData", {
                        get: function () {
                            return null;
                        }
                    });
                }
                function inject(element) {
                    if (element.tagName.toUpperCase() === "IFRAME" && element.contentWindow) {
                        try {
                            let hasAccess = element.contentWindow.HTMLCanvasElement;
                        } catch (e) {
                            console.log("can't access " + e);
                            return;
                        }
                        overrideCanvasProto(element.contentWindow.HTMLCanvasElement);
                        overrideCanvasRendProto(element.contentWindow.CanvasRenderingContext2D);
                        overrideDocumentProto(element.contentWindow.Document);
                    }
                }
                function overrideDocumentProto(root) {
                    function doOverrideDocumentProto(old, name) {
                        Object.defineProperty(root.prototype, name, {
                            value: function() {
                                let element = old.apply(this, arguments);
                                if (element == null) {
                                    return null;
                                }
                                if (Object.prototype.toString.call(element) === '[object HTMLCollection]' ||
                                    Object.prototype.toString.call(element) === '[object NodeList]') {
                                    for (let i = 0; i < element.length; ++i) {
                                        let el = element[i];
                                        inject(el);
                                    }
                                } else {
                                    inject(element);
                                }
                                return element;
                            }
                        });
                    }
                    doOverrideDocumentProto(root.prototype.createElement, "createElement");
                    doOverrideDocumentProto(root.prototype.createElementNS, "createElementNS");
                    doOverrideDocumentProto(root.prototype.getElementById, "getElementById");
                    doOverrideDocumentProto(root.prototype.getElementsByName, "getElementsByName");
                    doOverrideDocumentProto(root.prototype.getElementsByClassName, "getElementsByClassName");
                    doOverrideDocumentProto(root.prototype.getElementsByTagName, "getElementsByTagName");
                    doOverrideDocumentProto(root.prototype.getElementsByTagNameNS, "getElementsByTagNameNS");
                }
                overrideCanvasProto(HTMLCanvasElement);
                overrideCanvasRendProto(CanvasRenderingContext2D);
                overrideDocumentProto(Document);
            })();

            /*
            Object.defineProperty(window, 'CanvasRenderingContext2D', {
                get: function () {
                    return null;
                }
            });
            */
        }

        window.disableGetContextFeatures = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (a, b) {
            let la = a.toLowerCase();
            if (la.indexOf("webgl") >= 0 ||
                la.indexOf("experimental-webgl") >= 0 ||
                la.indexOf("webgl2") >= 0 ||
                la.indexOf("experimental-webgl2") >= 0) {
                return null;
            }
            if (webIdentity.canvasVar === "blocked") {
                if (la.indexOf("2d") >= 0) {
                    return null;
                }
            }
            if (b) {
                return window.disableGetContextFeatures.call(this, a, b);
            } else {
                return window.disableGetContextFeatures.call(this, a);
            }
        };
    } + ')(' + JSON.stringify(webIdentity) + ');';

    let s = document.createElement('script');
    s.textContent = actualCode;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
});
