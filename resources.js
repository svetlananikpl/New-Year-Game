(function() {
    let resourceCache = {};
    let loading = [];
    let readyCallbacks = [];
    let context;

    function load(urlImgOrArr) {
        if(urlImgOrArr instanceof Array) {
            urlImgOrArr.forEach(function(url) {
                _load(url);
            });
        }
        else {
            _load(urlImgOrArr);
        }
    }

    function _load(url) {
        if(resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            let img = new Image();
            img.onload = function() {
                resourceCache[url] = img;

                if(isReady()) {
                    readyCallbacks.forEach(function (func) {
                        func.call(context);
                    });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        let ready = true;
        for(var k in resourceCache) {
            if(resourceCache.hasOwnProperty(k) &&
                !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func,funcContext) {
        context = funcContext;
        readyCallbacks.push(func);
    }

    window.resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();