(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) : 
	typeof define === 'function' && (define.cmd || define.hjs) ? define(function(require,exports,module){module.exports = factory()}) :
    (global.index = factory());
}(this, (function () { 'use strict';

    var isArrary = function (array) {
        return array && array.length !== undefined;
    }, 
    // 检查是否支持该事件
    isSupportEvent = function (obj, type) {
        return "on" + type in obj;
    }, eventKey = "__event__", getEventStatusKey = function (type) { return "__eventStatus__" + type; }, event = {
        add: function (obj, type, fn) {
            var eventStatusKey = getEventStatusKey(type), isSupportType = isSupportEvent(obj, type);
            // 如果从未使用过事件绑定，则给元素添加一个事件对象
            if (obj[eventKey] === undefined) {
                obj[eventKey] = {};
            }
            // 如果该事件还没有进行过添加，则初始化事件列表
            if (!isArrary(obj[eventKey][type])) {
                obj[eventKey][type] = [];
            }
            // 将事件添加到执行列表
            obj[eventKey][type].push(fn);
            // 如果事件未绑定过则进行绑定并且支持该事件的
            if (obj[eventKey][eventStatusKey] === undefined && isSupportType) {
                obj[eventKey][eventStatusKey] = true;
                var run = function () {
                    var arg = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        arg[_i] = arguments[_i];
                    }
                    // arg[0] = arg[0] || window.event;
                    for (var i = 0, len = obj[eventKey][type].length; i < len; i++) {
                        var item = obj[eventKey][type][i];
                        item.call.apply(item, [obj].concat(arg));
                    }
                };
                if (typeof obj['addEventListener'] === 'function') {
                    obj['addEventListener'](type, run, false);
                }
                else if (typeof obj['attachEvent'] === 'object') {
                    obj['attachEvent']("on" + type, run);
                }
            }
            return isSupportType;
        },
        remove: function (obj, type, fn) {
            if (obj[eventKey] && isArrary(obj[eventKey][type])) {
                var fnList = obj[eventKey][type];
                for (var i = 0, len = fnList.length; i < len; i++) {
                    var item = fnList[i];
                    if (item === fn) {
                        fnList.splice(i, 1);
                        i--;
                        len = fnList.length;
                    }
                }
                // 当方法都被删除了，则删除整个类型的事件列表和事件绑定状态
                if (!fnList.length) {
                    event.removeAll(obj, type);
                }
            }
        },
        // 移除元素上所有指定类型的事件
        removeAll: function (obj, type) {
            var eventStatusKey = getEventStatusKey(type);
            if (obj[eventKey]) {
                delete obj[eventKey][type];
            }
            if (obj[eventKey] && obj[eventKey][eventStatusKey]) {
                delete obj[eventKey][eventStatusKey];
            }
        },
        // 阻止默认事件的方法（例如：链接不会被打开），但是会发生冒泡行为
        preventDefault: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            else {
                window.event.returnValue = false;
            }
        },
        // 阻止事件冒泡，不让事件向上（document）蔓延，但默认事件依然会执行
        stopPropagation: function (event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            else {
                window.event.cancelBubble = true;
            }
        }
    };

    /// <reference path="./_cookie.d.ts" />
    /**
     * 获取cookie值
     * @param  {string} name 需要获取的cookie名称
     * @return {string} 对应的cookie值或''
     */
    var get = function (name) {
        if (typeof name !== 'string' || !name) {
            throw new Error('Invalid cookie name');
        }
        var obj = toJson();
        return obj[name];
    }, 
    /**
     * 将cookie转为Json
     * @returns Object  返回一个Json对象
     */
    toJson = function () {
        var obj = {}, cookieVal = document.cookie, cookieList = cookieVal ? cookieVal.split('; ') : [];
        if (cookieList.length) {
            for (var i = 0, len = cookieList.length; i < len; i++) {
                var item = cookieList[i], aItem = item.split('='), key = aItem[0], val = aItem[1];
                obj[key] = val;
            }
        }
        return obj;
    }, 
    // 设置cookie选项
    setDefaultOption = {
        // 默认路径为根目录
        path: '/',
        // 域名如果有
        domain: location.hostname.indexOf('www') > -1 ? location.hostname.replace('www', '') : location.hostname,
        expires: 0
    }, 
    /**
     * 设置cookie
     * @param  {string} name    cookie名称
     * @param  {string} val     cookie值
     * @param  {SetOption=setDefaultOption} option  选项
     */
    set = function (name, val, option) {
        if (option === void 0) { option = setDefaultOption; }
        // 遍历选项，如果未被传入参数则使用默认参数代替
        for (var i in setDefaultOption) {
            var item = setDefaultOption[i];
            if (option[i] === undefined) {
                option[i] = item;
            }
        }
        var date = (function () {
            var time = new Date;
            time.setDate(time.getDate() + option.expires);
            return time.toString();
        })(), domain = option.domain, path = option.path, expires = date, cookie = name + "=" + val + "; domain=" + domain + "; path=" + path + "; expires=" + expires;
        //name=val; domain=.1x3x.com; path=/; expires=Thu, 01-Jan-70 00:00:01 GMT
        document.cookie = cookie;
    }, 
    /**
     * 删除cookie
     * @param  {string} name    需要删除的cookie名称
     * @param  {SetOption=setDefaultOption} option  cookie选项
     */
    del = function (name, option) {
        if (option === void 0) { option = setDefaultOption; }
        var setOption = {};
        for (var key in option) {
            setOption[key] = option[key];
        }
        setOption.expires = -1;
        set(name, '', setOption);
    };
    var $cookie = { get: get, toJson: toJson, set: set, del: del };

    /**
     * 创建HTML元素
     * @param  {string} html html字符串
     * @returns Array   返回html元素
     */ var element = {
        create: function (html) {
            var result = [], box = document.createElement('div'), nodeList;
            box.innerHTML = html;
            nodeList = box.childNodes;
            for (var i = 0, len = nodeList.length; i < len; i++) {
                if (nodeList[i] && nodeList[i].tagName) {
                    result.push(nodeList[i]);
                }
            }
            return result;
        },
        /**
         * 获取HTML元素
         * @param  {string} selector 选择器（'.class'、'#id'、'tag'），父级元素
         * @param  {Document|Element=document} parent 父元素以提升低版本下元素获取速度
         * @returns Array 返回一个数组元素
         */
        get: function (selector, parent) {
            if (parent === void 0) { parent = document; }
            var type = selector.substr(0, 1), selectorName = /^(\.|#)/i.test(selector) ? selector.substr(1) : selector, re = new RegExp('(^|\\s)' + selectorName + '(\\s|$)'), result = [];
            switch (type) {
                // 获取ID
                case '#':
                    result.push(document.getElementById(selectorName));
                    break;
                // 获取类名
                case '.':
                    if (typeof parent.getElementsByClassName === 'function') {
                        var oList_1 = parent.getElementsByClassName(selectorName);
                        for (var i = 0, len = oList_1.length; i < len; i++) {
                            result.push(oList_1[i]);
                        }
                    }
                    else {
                        var allList = parent.getElementsByTagName('*');
                        for (var i = 0, len = allList.length; i < len; i++) {
                            var item = allList[i];
                            if (re.test(item.className)) {
                                result.push(item);
                            }
                        }
                    }
                    break;
                // 获取标签名
                default:
                    var oList = document.getElementsByTagName(selectorName);
                    for (var i = 0, len = oList.length; i < len; i++) {
                        result.push(oList[i]);
                    }
                    break;
            }
            return result;
        }
    };

    var log = function () {
        var arg = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            arg[_i] = arguments[_i];
        }
        try {
            console.log.apply(console, arg);
        }
        catch (error) { }
    }, defaultOption = {
        timeout: 5000,
        data: {},
        callback: 'jsoncallback',
        success: function (data) {
            log(data);
        },
        fail: function (err) {
            log(err);
        }
    }, 
    // 将json数据格式化为url参数
    formatParams = function (data) {
        var arr = [];
        for (var key in data) {
            arr.push(key + "=" + encodeURIComponent(data[key]));
        }
        return arr.join('&');
    }, 
    // 
    header = document.getElementsByTagName('head')[0], jsonp = function (option) {
        option = option || {};
        // 将默认参数传入到配置中
        for (var i in defaultOption) {
            var key = i, item = defaultOption[i];
            if (option[key] === undefined) {
                option[key] = item;
            }
        }
        if (typeof option['url'] !== 'string') {
            throw new Error('option.url 不合法');
        }
        var script = document.createElement('script'), callbackName = (function () {
            var num = (Math.random() + '').substr(2);
            return "ydEffectJsonp_" + num;
        })(), data = (function () {
            var data = {};
            for (var i in option.data) {
                data[i] = option.data[i];
            }
            data[option.callback] = callbackName;
            data['_t'] = (Math.random() + '').substr(2);
            return data;
        })(), url = option.url + "?" + formatParams(data);
        // 定义回调
        window[callbackName] = function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i] = arguments[_i];
            }
            option.success.apply(option, arg);
            header.removeChild(script);
            clearTimeout(script['timer']);
            window[callbackName] = null;
        };
        // 将脚本添加到页面
        script.src = url;
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        header.appendChild(script);
        // 请求超时
        script['timer'] = setTimeout(function () {
            option.fail(url + " Request timed out!");
            header.removeChild(script);
            window[callbackName] = null;
        }, option.timeout);
        // 请求错误
        script.onerror = function (err) {
            throw new Error("Request error");
        };
    };

    /**
     * 获取url参数
     * @function get
     * @param  {type} name:string {参数名称}
     * @return {string} {对应的参数}
     */
    var get$1 = function (name) {
        var parameter = toJson$1();
        return parameter[name];
    };
    /**
     * 设置url参数
     * @function set
     * @param  {type} name:string {参数名称}
     * @param  {type} val:string  {参数值}
     * @return {undefined} {description}
     */
    var set$1 = function (name, val) {
        var parameter = toJson$1();
        parameter[name] = val;
        var search = parse(parameter);
        location.search = search;
    };
    /**
     * 将url参数转为Json对象
     * @function toJson
     * @param  {type} search:string {url参数，即location.search参数部分}
     * @return {Object} {返回转换出的json对象}
     */
    var toJson$1 = function (search) {
        if (search === void 0) { search = location.search; }
        search = search.indexOf('?') > -1 ? search.substr(1, search.length) : search;
        var list = search.split('&'), obj = {};
        for (var i = 0, len = list.length; i < len; i++) {
            var items = list[i].split('=');
            if (items[0] && items[1]) {
                obj[items[0]] = decodeURIComponent(items[1]);
            }
        }
        return obj;
    };
    /**
     * 将Json对象转换为url参数
     * @function parse
     * @param  {type} obj:Object {一个有效的json对象}
     * @return {string} {返回url参数字符串}
     */
    var parse = function (obj) {
        if (obj === void 0) { obj = {}; }
        var search = '?';
        for (var i in obj) {
            var item = obj[i];
            search += i + "=" + encodeURIComponent(item) + "&";
        }
        search = search.substr(0, search.length - 1);
        return search;
    };
    var $url = {
        get: get$1,
        set: set$1,
        toJson: toJson$1,
        parse: parse
    };

    var index = {
        event: event,
        cookie: $cookie,
        element: element,
        jsonp: jsonp,
        url: $url
    };

    return index;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,bnVsbA==