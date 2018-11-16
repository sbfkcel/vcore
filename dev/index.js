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
                    if (obj && obj[eventKey] && obj[eventKey][type] && obj[eventKey][type].length) {
                        for (var i = 0, len = obj[eventKey][type].length; i < len; i++) {
                            var item = obj[eventKey][type][i];
                            // 让IE的event.target不为空
                            if (arg && arg[0] && !arg[0].target) {
                                arg[0].target = arg[0].srcElement;
                            }
                            item.call.apply(item, [obj].concat(arg));
                        }
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
        if (option === void 0) {
            option = setDefaultOption;
        }
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
        if (option === void 0) {
            option = setDefaultOption;
        }
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
            if (parent === void 0) {
                parent = document;
            }
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
        if (search === void 0) {
            search = location.search;
        }
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
        if (obj === void 0) {
            obj = {};
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9iaW4vX2V2ZW50LnRzIiwic3JjL2Jpbi9fY29va2llLnRzIiwic3JjL2Jpbi9fZWxlbWVudC50cyIsInNyYy9iaW4vX2pzb25wLnRzIiwic3JjL2Jpbi9fdXJsLnRzIiwic3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBpc0FycmFyeTpGdW5jdGlvbiA9IChhcnJheSk6Ym9vbGVhbj0+e1xuICAgIHJldHVybiBhcnJheSAmJiBhcnJheS5sZW5ndGggIT09IHVuZGVmaW5lZDtcbn0sXG5cbi8vIOajgOafpeaYr+WQpuaUr+aMgeivpeS6i+S7tlxuaXNTdXBwb3J0RXZlbnQ6RnVuY3Rpb24gPSAob2JqLHR5cGUpOmJvb2xlYW49PntcbiAgICByZXR1cm4gYG9uJHt0eXBlfWAgaW4gb2JqO1xufSxcblxuZXZlbnRLZXk6c3RyaW5nID0gYF9fZXZlbnRfX2AsXG5cbmdldEV2ZW50U3RhdHVzS2V5OkZ1bmN0aW9uID0gKHR5cGUpOnN0cmluZz0+e3JldHVybiBgX19ldmVudFN0YXR1c19fJHt0eXBlfWB9LFxuXG5ldmVudCA9IHtcbiAgICBhZGQ6KG9iajpvYmplY3QsdHlwZTpzdHJpbmcsZm46RnVuY3Rpb24pOmJvb2xlYW49PntcbiAgICAgICAgbGV0IGV2ZW50U3RhdHVzS2V5OnN0cmluZyA9IGdldEV2ZW50U3RhdHVzS2V5KHR5cGUpLFxuICAgICAgICAgICAgaXNTdXBwb3J0VHlwZTpib29sZWFuID0gaXNTdXBwb3J0RXZlbnQob2JqLHR5cGUpO1xuXG4gICAgICAgIC8vIOWmguaenOS7juacquS9v+eUqOi/h+S6i+S7tue7keWumu+8jOWImee7meWFg+e0oOa3u+WKoOS4gOS4quS6i+S7tuWvueixoVxuICAgICAgICBpZihvYmpbZXZlbnRLZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XSA9IHt9O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOWmguaenOivpeS6i+S7tui/mOayoeaciei/m+ihjOi/h+a3u+WKoO+8jOWImeWIneWni+WMluS6i+S7tuWIl+ihqFxuICAgICAgICBpZighaXNBcnJhcnkob2JqW2V2ZW50S2V5XVt0eXBlXSkpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XVt0eXBlXSA9IFtdO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOWwhuS6i+S7tua3u+WKoOWIsOaJp+ihjOWIl+ihqFxuICAgICAgICBvYmpbZXZlbnRLZXldW3R5cGVdLnB1c2goZm4pO1xuXG4gICAgICAgIC8vIOWmguaenOS6i+S7tuacque7keWumui/h+WImei/m+ihjOe7keWumuW5tuS4lOaUr+aMgeivpeS6i+S7tueahFxuICAgICAgICBpZihvYmpbZXZlbnRLZXldW2V2ZW50U3RhdHVzS2V5XSA9PT0gdW5kZWZpbmVkICYmIGlzU3VwcG9ydFR5cGUpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XVtldmVudFN0YXR1c0tleV0gPSB0cnVlO1xuXG4gICAgICAgICAgICBsZXQgcnVuOkZ1bmN0aW9uID0gZnVuY3Rpb24oLi4uYXJnKXtcbiAgICAgICAgICAgICAgICAvLyBhcmdbMF0gPSBhcmdbMF0gfHwgd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgICAgIGlmKG9iaiAmJiBvYmpbZXZlbnRLZXldICYmIG9ialtldmVudEtleV1bdHlwZV0gJiYgb2JqW2V2ZW50S2V5XVt0eXBlXS5sZW5ndGgpe1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk9MCxsZW49b2JqW2V2ZW50S2V5XVt0eXBlXS5sZW5ndGg7IGk8bGVuOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW06RnVuY3Rpb24gPSBvYmpbZXZlbnRLZXldW3R5cGVdW2ldO1xuICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g6K6pSUXnmoRldmVudC50YXJnZXTkuI3kuLrnqbpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGFyZyAmJiBhcmdbMF0gJiYgIWFyZ1swXS50YXJnZXQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZ1swXS50YXJnZXQgPSBhcmdbMF0uc3JjRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FsbChvYmosLi4uYXJnKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9OyBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiBvYmpbJ2FkZEV2ZW50TGlzdGVuZXInXSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICAgICAgb2JqWydhZGRFdmVudExpc3RlbmVyJ10odHlwZSxydW4sZmFsc2UpO1xuICAgICAgICAgICAgfWVsc2UgaWYodHlwZW9mIG9ialsnYXR0YWNoRXZlbnQnXSA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIG9ialsnYXR0YWNoRXZlbnQnXShgb24ke3R5cGV9YCxydW4pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzU3VwcG9ydFR5cGU7XG4gICAgfSxcbiAgICByZW1vdmU6KG9iajpvYmplY3QsdHlwZTpzdHJpbmcsZm46RnVuY3Rpb24pPT57XG4gICAgICAgIGlmKG9ialtldmVudEtleV0gJiYgaXNBcnJhcnkob2JqW2V2ZW50S2V5XVt0eXBlXSkpe1xuICAgICAgICAgICAgbGV0IGZuTGlzdDpBcnJheTxGdW5jdGlvbj4gPSBvYmpbZXZlbnRLZXldW3R5cGVdO1xuICAgICAgICAgICAgZm9yKGxldCBpOm51bWJlcj0wLGxlbjpudW1iZXI9Zm5MaXN0Lmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW06RnVuY3Rpb24gPSBmbkxpc3RbaV07XG5cbiAgICAgICAgICAgICAgICBpZihpdGVtID09PSBmbil7XG4gICAgICAgICAgICAgICAgICAgIGZuTGlzdC5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICBsZW4gPSBmbkxpc3QubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyDlvZPmlrnms5Xpg73ooqvliKDpmaTkuobvvIzliJnliKDpmaTmlbTkuKrnsbvlnovnmoTkuovku7bliJfooajlkozkuovku7bnu5HlrprnirbmgIFcbiAgICAgICAgICAgIGlmKCFmbkxpc3QubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBldmVudC5yZW1vdmVBbGwob2JqLHR5cGUpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLy8g56e76Zmk5YWD57Sg5LiK5omA5pyJ5oyH5a6a57G75Z6L55qE5LqL5Lu2XG4gICAgcmVtb3ZlQWxsOihvYmo6b2JqZWN0LHR5cGU6c3RyaW5nKT0+e1xuICAgICAgICBsZXQgZXZlbnRTdGF0dXNLZXk6c3RyaW5nID0gZ2V0RXZlbnRTdGF0dXNLZXkodHlwZSk7XG4gICAgICAgIGlmKG9ialtldmVudEtleV0pe1xuICAgICAgICAgICAgZGVsZXRlIG9ialtldmVudEtleV1bdHlwZV07XG4gICAgICAgIH07XG4gICAgICAgIGlmKG9ialtldmVudEtleV0gJiYgb2JqW2V2ZW50S2V5XVtldmVudFN0YXR1c0tleV0pe1xuICAgICAgICAgICAgZGVsZXRlIG9ialtldmVudEtleV1bZXZlbnRTdGF0dXNLZXldO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyDpmLvmraLpu5jorqTkuovku7bnmoTmlrnms5XvvIjkvovlpoLvvJrpk77mjqXkuI3kvJrooqvmiZPlvIDvvInvvIzkvYbmmK/kvJrlj5HnlJ/lhpLms6HooYzkuLpcbiAgICBwcmV2ZW50RGVmYXVsdDooZXZlbnQ6RXZlbnQpPT57XG4gICAgICAgIGlmKGV2ZW50LnByZXZlbnREZWZhdWx0KXtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2luZG93LmV2ZW50LnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIOmYu+atouS6i+S7tuWGkuazoe+8jOS4jeiuqeS6i+S7tuWQkeS4iu+8iGRvY3VtZW5077yJ6JST5bu277yM5L2G6buY6K6k5LqL5Lu25L6d54S25Lya5omn6KGMXG4gICAgc3RvcFByb3BhZ2F0aW9uOihldmVudDpFdmVudCk9PntcbiAgICAgICAgaWYoZXZlbnQuc3RvcFByb3BhZ2F0aW9uKXtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdpbmRvdy5ldmVudC5jYW5jZWxCdWJibGUgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH1cbn07XG5leHBvcnQgZGVmYXVsdCBldmVudDsiLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9fY29va2llLmQudHNcIiAvPlxuXG4vKipcbiAqIOiOt+WPlmNvb2tpZeWAvFxuICogQHBhcmFtICB7c3RyaW5nfSBuYW1lIOmcgOimgeiOt+WPlueahGNvb2tpZeWQjeensFxuICogQHJldHVybiB7c3RyaW5nfSDlr7nlupTnmoRjb29raWXlgLzmiJYnJ1xuICovXG5sZXQgZ2V0ID0gKG5hbWU6c3RyaW5nKTpzdHJpbmd8dW5kZWZpbmVkPT57XG4gICAgICAgIGlmKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyB8fCAhbmFtZSl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29va2llIG5hbWUnKTtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IG9iajpPYmplY3QgPSB0b0pzb24oKTtcbiAgICAgICAgcmV0dXJuIG9ialtuYW1lXTsgXG4gICAgfSxcblxuICAgIFxuICAgIC8qKlxuICAgICAqIOWwhmNvb2tpZei9rOS4ukpzb25cbiAgICAgKiBAcmV0dXJucyBPYmplY3QgIOi/lOWbnuS4gOS4qkpzb27lr7nosaFcbiAgICAgKi9cbiAgICAgXG4gICAgdG9Kc29uID0gKCk6T2JqZWN0PT57XG4gICAgICAgIGxldCBvYmo6T2JqZWN0ID0ge30sXG4gICAgICAgICAgICBjb29raWVWYWw6c3RyaW5nID0gZG9jdW1lbnQuY29va2llLFxuICAgICAgICAgICAgY29va2llTGlzdDpBcnJheTxzdHJpbmc+ID0gY29va2llVmFsID8gY29va2llVmFsLnNwbGl0KCc7ICcpIDogW107XG4gICAgICAgIGlmKGNvb2tpZUxpc3QubGVuZ3RoKXtcbiAgICAgICAgICAgIGZvcihsZXQgaT0wLGxlbj1jb29raWVMaXN0Lmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgbGV0IGl0ZW06c3RyaW5nID0gY29va2llTGlzdFtpXSxcbiAgICAgICAgICAgICAgICAgICAgYUl0ZW06QXJyYXk8c3RyaW5nPiA9IGl0ZW0uc3BsaXQoJz0nKSxcbiAgICAgICAgICAgICAgICAgICAga2V5OnN0cmluZyA9IGFJdGVtWzBdLFxuICAgICAgICAgICAgICAgICAgICB2YWw6c3RyaW5nID0gYUl0ZW1bMV07XG4gICAgICAgICAgICAgICAgb2JqW2tleV0gPSB2YWw7IFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG5cbiAgICAvLyDorr7nva5jb29raWXpgInpoblcbiAgICBzZXREZWZhdWx0T3B0aW9uOlNldE9wdGlvbiA9IHtcbiAgICAgICAgLy8g6buY6K6k6Lev5b6E5Li65qC555uu5b2VXG4gICAgICAgIHBhdGg6Jy8nLFxuXG4gICAgICAgIC8vIOWfn+WQjeWmguaenOaciVxuICAgICAgICBkb21haW46bG9jYXRpb24uaG9zdG5hbWUuaW5kZXhPZignd3d3JykgPiAtMSA/IGxvY2F0aW9uLmhvc3RuYW1lLnJlcGxhY2UoJ3d3dycsJycpIDogbG9jYXRpb24uaG9zdG5hbWUsXG4gICAgICAgIGV4cGlyZXM6MFxuICAgIH0sXG5cblxuICAgIC8qKlxuICAgICAqIOiuvue9rmNvb2tpZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSAgICBjb29raWXlkI3np7BcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHZhbCAgICAgY29va2ll5YC8XG4gICAgICogQHBhcmFtICB7U2V0T3B0aW9uPXNldERlZmF1bHRPcHRpb259IG9wdGlvbiAg6YCJ6aG5XG4gICAgICovXG4gICAgc2V0ID0gKG5hbWU6c3RyaW5nLHZhbDpzdHJpbmcsb3B0aW9uOlNldE9wdGlvbiA9IHNldERlZmF1bHRPcHRpb24pPT57XG5cbiAgICAgICAgLy8g6YGN5Y6G6YCJ6aG577yM5aaC5p6c5pyq6KKr5Lyg5YWl5Y+C5pWw5YiZ5L2/55So6buY6K6k5Y+C5pWw5Luj5pu/XG4gICAgICAgIGZvcihsZXQgaSBpbiBzZXREZWZhdWx0T3B0aW9uKXtcbiAgICAgICAgICAgIGxldCBpdGVtOnN0cmluZ3xudW1iZXIgPSBzZXREZWZhdWx0T3B0aW9uW2ldO1xuICAgICAgICAgICAgaWYob3B0aW9uW2ldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIG9wdGlvbltpXSA9IGl0ZW07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkYXRlOnN0cmluZyA9ICgoKT0+e1xuICAgICAgICAgICAgICAgIGxldCB0aW1lOkRhdGUgPSBuZXcgRGF0ZTtcbiAgICAgICAgICAgICAgICB0aW1lLnNldERhdGUodGltZS5nZXREYXRlKCkgKyBvcHRpb24uZXhwaXJlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRpbWUudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBkb21haW46c3RyaW5nID0gb3B0aW9uLmRvbWFpbixcbiAgICAgICAgICAgIHBhdGg6c3RyaW5nID0gb3B0aW9uLnBhdGgsXG4gICAgICAgICAgICBleHBpcmVzOnN0cmluZyA9IGRhdGUsXG4gICAgICAgICAgICBjb29raWU6c3RyaW5nID0gYCR7bmFtZX09JHt2YWx9OyBkb21haW49JHtkb21haW59OyBwYXRoPSR7cGF0aH07IGV4cGlyZXM9JHtleHBpcmVzfWA7XG4gICAgICAgIC8vbmFtZT12YWw7IGRvbWFpbj0uMXgzeC5jb207IHBhdGg9LzsgZXhwaXJlcz1UaHUsIDAxLUphbi03MCAwMDowMDowMSBHTVRcbiAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llO1xuICAgIH0sXG4gICAgXG4gICAgLyoqXG4gICAgICog5Yig6ZmkY29va2llXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lICAgIOmcgOimgeWIoOmZpOeahGNvb2tpZeWQjeensFxuICAgICAqIEBwYXJhbSAge1NldE9wdGlvbj1zZXREZWZhdWx0T3B0aW9ufSBvcHRpb24gIGNvb2tpZemAiemhuVxuICAgICAqL1xuICAgIGRlbCA9IChuYW1lOnN0cmluZyxvcHRpb246U2V0T3B0aW9uID0gc2V0RGVmYXVsdE9wdGlvbik9PntcbiAgICAgICAgbGV0IHNldE9wdGlvbjpTZXRPcHRpb24gPSB7fTtcbiAgICAgICAgZm9yKGxldCBrZXkgaW4gb3B0aW9uKXtcbiAgICAgICAgICAgIHNldE9wdGlvbltrZXldID0gb3B0aW9uW2tleV07XG4gICAgICAgIH07XG4gICAgICAgIHNldE9wdGlvbi5leHBpcmVzID0gLTE7XG4gICAgICAgIHNldChuYW1lLCcnLHNldE9wdGlvbik7XG4gICAgfTtcblxuZXhwb3J0IGRlZmF1bHQge2dldCx0b0pzb24sc2V0LGRlbH07IiwiICAgIC8qKlxuICAgICAqIOWIm+W7ukhUTUzlhYPntKBcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGh0bWwgaHRtbOWtl+espuS4slxuICAgICAqIEByZXR1cm5zIEFycmF5ICAg6L+U5ZueaHRtbOWFg+e0oFxuICAgICAqL2xldCBlbGVtZW50ID0ge1xuICAgIGNyZWF0ZTooaHRtbDpzdHJpbmcpOkFycmF5PEhUTUxFbGVtZW50Pj0+e1xuICAgICAgICBsZXQgcmVzdWx0OkFycmF5PEhUTUxFbGVtZW50PiA9IFtdLFxuICAgICAgICAgICAgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgICAgICBub2RlTGlzdDpOb2RlTGlzdDtcbiAgICAgICAgYm94LmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIFxuICAgICAgICBub2RlTGlzdCA9IGJveC5jaGlsZE5vZGVzO1xuICAgICAgICBmb3IobGV0IGk6bnVtYmVyPTAsbGVuOm51bWJlcj1ub2RlTGlzdC5sZW5ndGg7aTxsZW47IGkrKyl7XG4gICAgICAgICAgICBpZihub2RlTGlzdFtpXSAmJiAobm9kZUxpc3RbaV0gYXMgSFRNTEVsZW1lbnQpLnRhZ05hbWUpe1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGVMaXN0W2ldIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIOiOt+WPlkhUTUzlhYPntKBcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNlbGVjdG9yIOmAieaLqeWZqO+8iCcuY2xhc3Mn44CBJyNpZCfjgIEndGFnJ++8ie+8jOeItue6p+WFg+e0oFxuICAgICAqIEBwYXJhbSAge0RvY3VtZW50fEVsZW1lbnQ9ZG9jdW1lbnR9IHBhcmVudCDniLblhYPntKDku6Xmj5DljYfkvY7niYjmnKzkuIvlhYPntKDojrflj5bpgJ/luqZcbiAgICAgKiBAcmV0dXJucyBBcnJheSDov5Tlm57kuIDkuKrmlbDnu4TlhYPntKBcbiAgICAgKi9cbiAgICBnZXQ6KHNlbGVjdG9yOnN0cmluZyxwYXJlbnQ6RG9jdW1lbnR8RWxlbWVudCA9IGRvY3VtZW50KTpBcnJheTxIVE1MRWxlbWVudD49PntcbiAgICAgICAgbGV0IHR5cGU6c3RyaW5nID0gc2VsZWN0b3Iuc3Vic3RyKDAsMSksXG4gICAgICAgICAgICBzZWxlY3Rvck5hbWUgPSAvXihcXC58IykvaS50ZXN0KHNlbGVjdG9yKSA/IHNlbGVjdG9yLnN1YnN0cigxKSA6IHNlbGVjdG9yLFxuICAgICAgICAgICAgcmU6UmVnRXhwID0gbmV3IFJlZ0V4cCgnKF58XFxcXHMpJytzZWxlY3Rvck5hbWUrJyhcXFxcc3wkKScpLFxuICAgICAgICAgICAgcmVzdWx0OkFycmF5PEhUTUxFbGVtZW50PiA9IFtdO1xuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICAgIC8vIOiOt+WPlklEXG4gICAgICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzZWxlY3Rvck5hbWUpIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDojrflj5bnsbvlkI1cbiAgICAgICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBwYXJlbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvTGlzdCA9IHBhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaTpudW1iZXIgPSAwLGxlbjpudW1iZXIgPSBvTGlzdC5sZW5ndGg7IGk8bGVuOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob0xpc3RbaV0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBsZXQgYWxsTGlzdCA9IHBhcmVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuICAgICAgICAgICAgICAgICAgICBmb3IobGV0IGk6bnVtYmVyID0gMCxsZW46bnVtYmVyID0gYWxsTGlzdC5sZW5ndGg7IGk8bGVuOyBpKyspe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW06RWxlbWVudCA9IGFsbExpc3RbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihyZS50ZXN0KGl0ZW0uY2xhc3NOYW1lKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goaXRlbSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8g6I635Y+W5qCH562+5ZCNXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGxldCBvTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbGVjdG9yTmFtZSk7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBpOm51bWJlciA9IDAsbGVuOm51bWJlciA9IG9MaXN0Lmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG9MaXN0W2ldIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZWxlbWVudDsiLCJsZXQgbG9nOkZ1bmN0aW9uID0gKC4uLmFyZyk9PntcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKC4uLmFyZyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH0sXG4gICAgZGVmYXVsdE9wdGlvbjpvYmplY3QgPSB7XG4gICAgICAgIHRpbWVvdXQ6NTAwMCxcbiAgICAgICAgZGF0YTp7fSxcbiAgICAgICAgY2FsbGJhY2s6J2pzb25jYWxsYmFjaycsXG4gICAgICAgIHN1Y2Nlc3M6KGRhdGEpPT57XG4gICAgICAgICAgICBsb2coZGF0YSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZhaWw6KGVycik9PntcbiAgICAgICAgICAgIGxvZyhlcnIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vIOWwhmpzb27mlbDmja7moLzlvI/ljJbkuLp1cmzlj4LmlbBcbiAgICBmb3JtYXRQYXJhbXM6RnVuY3Rpb24gPSBmdW5jdGlvbiAoZGF0YSk6c3RyaW5nIHtcbiAgICAgICAgdmFyIGFycjpBcnJheTxzdHJpbmc+ID0gW107XG4gICAgICAgIGZvciAobGV0IGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICBhcnIucHVzaChgJHtrZXl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KGRhdGFba2V5XSl9YCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBhcnIuam9pbignJicpO1xuICAgIH0sXG5cbiAgICAvLyBcbiAgICBoZWFkZXI6SFRNTEhlYWRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSxcbiAgICBcbiAgICBqc29ucCA9IChvcHRpb24pPT57XG4gICAgICAgIG9wdGlvbiA9IG9wdGlvbiB8fCB7fTtcblxuICAgICAgICAvLyDlsIbpu5jorqTlj4LmlbDkvKDlhaXliLDphY3nva7kuK1cbiAgICAgICAgZm9yKGxldCBpIGluIGRlZmF1bHRPcHRpb24pe1xuICAgICAgICAgICAgbGV0IGtleTpzdHJpbmcgPSBpLFxuICAgICAgICAgICAgICAgIGl0ZW06c3RyaW5nfG51bWJlciA9IGRlZmF1bHRPcHRpb25baV07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKG9wdGlvbltrZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIG9wdGlvbltrZXldID0gaXRlbTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYodHlwZW9mIG9wdGlvblsndXJsJ10gIT09ICdzdHJpbmcnKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignb3B0aW9uLnVybCDkuI3lkIjms5UnKTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgc2NyaXB0OkhUTUxTY3JpcHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksXG4gICAgICAgICAgICBjYWxsYmFja05hbWU6c3RyaW5nID0gKCgpPT57XG4gICAgICAgICAgICAgICAgbGV0IG51bTpzdHJpbmcgPSAoTWF0aC5yYW5kb20oKSsnJykuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBgeWRFZmZlY3RKc29ucF8ke251bX1gO1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGRhdGE6b2JqZWN0ID0gKCgpPT57XG4gICAgICAgICAgICAgICAgbGV0IGRhdGE6b2JqZWN0ID0ge307XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvcihsZXQgaSBpbiBvcHRpb24uZGF0YSl7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaV0gPSBvcHRpb24uZGF0YVtpXTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGRhdGFbb3B0aW9uLmNhbGxiYWNrXSA9IGNhbGxiYWNrTmFtZTtcbiAgICAgICAgICAgICAgICBkYXRhWydfdCddID0gKE1hdGgucmFuZG9tKCkrJycpLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICB1cmwgPSBgJHtvcHRpb24udXJsfT8ke2Zvcm1hdFBhcmFtcyhkYXRhKX1gO1xuICAgICAgICBcbiAgICAgICAgLy8g5a6a5LmJ5Zue6LCDXG4gICAgICAgIHdpbmRvd1tjYWxsYmFja05hbWVdID0gKC4uLmFyZyk9PntcbiAgICAgICAgICAgIG9wdGlvbi5zdWNjZXNzKC4uLmFyZyk7XG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChzY3JpcHRbJ3RpbWVyJ10pO1xuICAgICAgICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgLy8g5bCG6ISa5pys5re75Yqg5Yiw6aG16Z2iXG4gICAgICAgIHNjcmlwdC5zcmMgPSB1cmw7XG4gICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgIHNjcmlwdC5jaGFyc2V0ID0gJ3V0Zi04JztcbiAgICAgICAgaGVhZGVyLmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cbiAgICAgICAgLy8g6K+35rGC6LaF5pe2XG4gICAgICAgIHNjcmlwdFsndGltZXInXSA9IHNldFRpbWVvdXQoKCk9PntcbiAgICAgICAgICAgIG9wdGlvbi5mYWlsKGAke3VybH0gUmVxdWVzdCB0aW1lZCBvdXQhYCk7XG4gICAgICAgICAgICBoZWFkZXIucmVtb3ZlQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIHdpbmRvd1tjYWxsYmFja05hbWVdID0gbnVsbDtcbiAgICAgICAgfSxvcHRpb24udGltZW91dCk7XG4gICAgICAgIFxuICAgICAgICAvLyDor7fmsYLplJnor69cbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBlcnIgPT4ge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1ZXN0IGVycm9yYCk7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgIH07XG5cbmV4cG9ydCBkZWZhdWx0IGpzb25wOyIsIlxuLyoqXG4gKiDojrflj5Z1cmzlj4LmlbBcbiAqIEBmdW5jdGlvbiBnZXRcbiAqIEBwYXJhbSAge3R5cGV9IG5hbWU6c3RyaW5nIHvlj4LmlbDlkI3np7B9XG4gKiBAcmV0dXJuIHtzdHJpbmd9IHvlr7nlupTnmoTlj4LmlbB9XG4gKi9cbmxldCBnZXQgPSAobmFtZTpzdHJpbmcpOnN0cmluZyA9PiB7XG4gICAgICAgIGxldCBwYXJhbWV0ZXI6T2JqZWN0ID0gdG9Kc29uKCk7XG4gICAgICAgIHJldHVybiBwYXJhbWV0ZXJbbmFtZV07XG4gICAgfTtcblxuLyoqXG4gKiDorr7nva51cmzlj4LmlbBcbiAqIEBmdW5jdGlvbiBzZXRcbiAqIEBwYXJhbSAge3R5cGV9IG5hbWU6c3RyaW5nIHvlj4LmlbDlkI3np7B9XG4gKiBAcGFyYW0gIHt0eXBlfSB2YWw6c3RyaW5nICB75Y+C5pWw5YC8fVxuICogQHJldHVybiB7dW5kZWZpbmVkfSB7ZGVzY3JpcHRpb259XG4gKi9cbmxldCBzZXQgPSAobmFtZTpzdHJpbmcsdmFsOnN0cmluZykgPT4ge1xuICAgICAgICBsZXQgcGFyYW1ldGVyOk9iamVjdCA9IHRvSnNvbigpO1xuICAgICAgICBwYXJhbWV0ZXJbbmFtZV0gPSB2YWw7XG5cbiAgICAgICAgbGV0IHNlYXJjaDpzdHJpbmcgPSBwYXJzZShwYXJhbWV0ZXIpO1xuICAgICAgICBsb2NhdGlvbi5zZWFyY2ggPSBzZWFyY2g7XG4gICAgfTtcblxuLyoqXG4gKiDlsIZ1cmzlj4LmlbDovazkuLpKc29u5a+56LGhXG4gKiBAZnVuY3Rpb24gdG9Kc29uXG4gKiBAcGFyYW0gIHt0eXBlfSBzZWFyY2g6c3RyaW5nIHt1cmzlj4LmlbDvvIzljbNsb2NhdGlvbi5zZWFyY2jlj4LmlbDpg6jliIZ9XG4gKiBAcmV0dXJuIHtPYmplY3R9IHvov5Tlm57ovazmjaLlh7rnmoRqc29u5a+56LGhfVxuICovXG5sZXQgdG9Kc29uID0gKHNlYXJjaDpzdHJpbmcgPSBsb2NhdGlvbi5zZWFyY2gpOk9iamVjdCA9PiB7XG4gICAgICAgIHNlYXJjaCA9IHNlYXJjaC5pbmRleE9mKCc/JykgPiAtMSA/IHNlYXJjaC5zdWJzdHIoMSwgc2VhcmNoLmxlbmd0aCkgOiBzZWFyY2g7XG4gICAgICAgIGxldCBsaXN0OkFycmF5PHN0cmluZz4gPSBzZWFyY2guc3BsaXQoJyYnKSxcbiAgICAgICAgICAgIG9iajpPYmplY3QgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIGZvcihsZXQgaT0wLGxlbj1saXN0Lmxlbmd0aDtpPGxlbjtpKyspe1xuICAgICAgICAgICAgbGV0IGl0ZW1zOkFycmF5PHN0cmluZz4gPSBsaXN0W2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICBpZihpdGVtc1swXSAmJiBpdGVtc1sxXSl7XG4gICAgICAgICAgICAgICAgb2JqW2l0ZW1zWzBdXSA9IGRlY29kZVVSSUNvbXBvbmVudChpdGVtc1sxXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG5cbi8qKlxuICog5bCGSnNvbuWvueixoei9rOaNouS4unVybOWPguaVsFxuICogQGZ1bmN0aW9uIHBhcnNlXG4gKiBAcGFyYW0gIHt0eXBlfSBvYmo6T2JqZWN0IHvkuIDkuKrmnInmlYjnmoRqc29u5a+56LGhfVxuICogQHJldHVybiB7c3RyaW5nfSB76L+U5ZuedXJs5Y+C5pWw5a2X56ym5LiyfVxuICovXG5sZXQgcGFyc2UgPSAob2JqOk9iamVjdCA9IHt9KSA9PiB7XG4gICAgICAgIGxldCBzZWFyY2g6c3RyaW5nID0gJz8nO1xuICAgICAgICBmb3IobGV0IGkgaW4gb2JqKXtcbiAgICAgICAgICAgIGxldCBpdGVtOnN0cmluZyA9IG9ialtpXTtcbiAgICAgICAgICAgIHNlYXJjaCArPSBgJHtpfT0ke2VuY29kZVVSSUNvbXBvbmVudChpdGVtKX0mYFxuICAgICAgICB9O1xuICAgICAgICBzZWFyY2ggPSBzZWFyY2guc3Vic3RyKDAsc2VhcmNoLmxlbmd0aCAtIDEpO1xuICAgICAgICByZXR1cm4gc2VhcmNoO1xuICAgIH07XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBnZXQsXG4gICAgc2V0LFxuICAgIHRvSnNvbixcbiAgICBwYXJzZVxufSIsImltcG9ydCAkZXZlbnQgZnJvbSAnLi9iaW4vX2V2ZW50J1xuaW1wb3J0ICRjb29raWUgZnJvbSAnLi9iaW4vX2Nvb2tpZSdcbmltcG9ydCAkZWxlbWVudCBmcm9tICcuL2Jpbi9fZWxlbWVudCdcbmltcG9ydCAkanNvbnAgZnJvbSAnLi9iaW4vX2pzb25wJ1xuaW1wb3J0ICR1cmwgZnJvbSAnLi9iaW4vX3VybCdcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGV2ZW50OiRldmVudCxcbiAgICBjb29raWU6JGNvb2tpZSxcbiAgICBlbGVtZW50OiRlbGVtZW50LFxuICAgIGpzb25wOiRqc29ucCxcbiAgICB1cmw6JHVybFxufTtcblxuXG4iXSwibmFtZXMiOlsiZ2V0IiwidG9Kc29uIiwic2V0IiwiJGV2ZW50IiwiJGVsZW1lbnQiLCIkanNvbnAiXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFBLElBQUksUUFBUSxHQUFZLFVBQUMsS0FBSztRQUMxQixPQUFPLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQztJQUMvQyxDQUFDO0lBRUQ7SUFDQSxjQUFjLEdBQVksVUFBQyxHQUFHLEVBQUMsSUFBSTtRQUMvQixPQUFPLE9BQUssSUFBTSxJQUFJLEdBQUcsQ0FBQztJQUM5QixDQUFDLEVBRUQsUUFBUSxHQUFVLFdBQVcsRUFFN0IsaUJBQWlCLEdBQVksVUFBQyxJQUFJLElBQVcsT0FBTyxvQkFBa0IsSUFBTSxDQUFBLEVBQUMsRUFFN0UsS0FBSyxHQUFHO1FBQ0osR0FBRyxFQUFDLFVBQUMsR0FBVSxFQUFDLElBQVcsRUFBQyxFQUFXO1lBQ25DLElBQUksY0FBYyxHQUFVLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUMvQyxhQUFhLEdBQVcsY0FBYyxDQUFDLEdBQUcsRUFBQyxJQUFJLENBQUMsQ0FBQzs7WUFHckQsSUFBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssU0FBUyxFQUFDO2dCQUMzQixHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO2FBQ3RCOztZQUdELElBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUM7Z0JBQzlCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDNUI7O1lBR0QsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzs7WUFHN0IsSUFBRyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssU0FBUyxJQUFJLGFBQWEsRUFBQztnQkFDNUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQztnQkFFckMsSUFBSSxHQUFHLEdBQVk7b0JBQVMsYUFBTTt5QkFBTixVQUFNLEVBQU4scUJBQU0sRUFBTixJQUFNO3dCQUFOLHdCQUFNOzs7b0JBRTlCLElBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBQzt3QkFDekUsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsR0FBRyxHQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBQzs0QkFDbkQsSUFBSSxJQUFJLEdBQVksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs0QkFHM0MsSUFBRyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQztnQ0FDL0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDOzZCQUNyQzs0QkFFRCxJQUFJLENBQUMsSUFBSSxPQUFULElBQUksR0FBTSxHQUFHLFNBQUksR0FBRyxHQUFFO3lCQUN6QjtxQkFDSjtpQkFDSixDQUFDO2dCQUVGLElBQUcsT0FBTyxHQUFHLENBQUMsa0JBQWtCLENBQUMsS0FBSyxVQUFVLEVBQUM7b0JBQzdDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksRUFBQyxHQUFHLEVBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzNDO3FCQUFLLElBQUcsT0FBTyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssUUFBUSxFQUFDO29CQUM1QyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBSyxJQUFNLEVBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3ZDO2FBQ0o7WUFDRCxPQUFPLGFBQWEsQ0FBQztTQUN4QjtRQUNELE1BQU0sRUFBQyxVQUFDLEdBQVUsRUFBQyxJQUFXLEVBQUMsRUFBVztZQUN0QyxJQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUM7Z0JBQzlDLElBQUksTUFBTSxHQUFtQixHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pELEtBQUksSUFBSSxDQUFDLEdBQVEsQ0FBQyxFQUFDLEdBQUcsR0FBUSxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUM7b0JBQ3BELElBQUksSUFBSSxHQUFZLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFOUIsSUFBRyxJQUFJLEtBQUssRUFBRSxFQUFDO3dCQUNYLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuQixDQUFDLEVBQUUsQ0FBQzt3QkFDSixHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztxQkFDdkI7aUJBQ0o7O2dCQUdELElBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDO29CQUNkLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxDQUFDO2lCQUM3QjthQUNKO1NBQ0o7O1FBR0QsU0FBUyxFQUFDLFVBQUMsR0FBVSxFQUFDLElBQVc7WUFDN0IsSUFBSSxjQUFjLEdBQVUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEQsSUFBRyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUM7Z0JBQ2IsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUI7WUFDRCxJQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUM7Z0JBQzlDLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0o7O1FBR0QsY0FBYyxFQUFDLFVBQUMsS0FBVztZQUN2QixJQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUM7Z0JBQ3BCLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzthQUMxQjtpQkFBSTtnQkFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7YUFDcEM7U0FDSjs7UUFHRCxlQUFlLEVBQUMsVUFBQyxLQUFXO1lBQ3hCLElBQUcsS0FBSyxDQUFDLGVBQWUsRUFBQztnQkFDckIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQzNCO2lCQUFJO2dCQUNELE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzthQUNwQztTQUNKO0tBQ0osQ0FBQzs7SUMzR0Y7SUFFQTs7Ozs7SUFLQSxJQUFJLEdBQUcsR0FBRyxVQUFDLElBQVc7UUFDZCxJQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDMUM7UUFDRCxJQUFJLEdBQUcsR0FBVSxNQUFNLEVBQUUsQ0FBQztRQUMxQixPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBR0Q7Ozs7SUFLQSxNQUFNLEdBQUc7UUFDTCxJQUFJLEdBQUcsR0FBVSxFQUFFLEVBQ2YsU0FBUyxHQUFVLFFBQVEsQ0FBQyxNQUFNLEVBQ2xDLFVBQVUsR0FBaUIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RFLElBQUcsVUFBVSxDQUFDLE1BQU0sRUFBQztZQUNqQixLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxHQUFHLEdBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFDO2dCQUMxQyxJQUFJLElBQUksR0FBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQzNCLEtBQUssR0FBaUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDckMsR0FBRyxHQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFDckIsR0FBRyxHQUFVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUNsQjtTQUNKO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBR0Q7SUFDQSxnQkFBZ0IsR0FBYTs7UUFFekIsSUFBSSxFQUFDLEdBQUc7O1FBR1IsTUFBTSxFQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsUUFBUTtRQUN0RyxPQUFPLEVBQUMsQ0FBQztLQUNaO0lBR0Q7Ozs7OztJQU1BLEdBQUcsR0FBRyxVQUFDLElBQVcsRUFBQyxHQUFVLEVBQUMsTUFBbUM7UUFBbkMsdUJBQUE7WUFBQSx5QkFBbUM7OztRQUc3RCxLQUFJLElBQUksQ0FBQyxJQUFJLGdCQUFnQixFQUFDO1lBQzFCLElBQUksSUFBSSxHQUFpQixnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDcEI7U0FDSjtRQUVELElBQUksSUFBSSxHQUFVLENBQUM7WUFDWCxJQUFJLElBQUksR0FBUSxJQUFJLElBQUksQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDMUIsR0FBRyxFQUNKLE1BQU0sR0FBVSxNQUFNLENBQUMsTUFBTSxFQUM3QixJQUFJLEdBQVUsTUFBTSxDQUFDLElBQUksRUFDekIsT0FBTyxHQUFVLElBQUksRUFDckIsTUFBTSxHQUFhLElBQUksU0FBSSxHQUFHLGlCQUFZLE1BQU0sZUFBVSxJQUFJLGtCQUFhLE9BQVMsQ0FBQzs7UUFFekYsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7OztJQUtBLEdBQUcsR0FBRyxVQUFDLElBQVcsRUFBQyxNQUFtQztRQUFuQyx1QkFBQTtZQUFBLHlCQUFtQzs7UUFDbEQsSUFBSSxTQUFTLEdBQWEsRUFBRSxDQUFDO1FBQzdCLEtBQUksSUFBSSxHQUFHLElBQUksTUFBTSxFQUFDO1lBQ2xCLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDaEM7UUFDRCxTQUFTLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQztBQUVOLGtCQUFlLEVBQUMsR0FBRyxLQUFBLEVBQUMsTUFBTSxRQUFBLEVBQUMsR0FBRyxLQUFBLEVBQUMsR0FBRyxLQUFBLEVBQUMsQ0FBQzs7SUM1RmhDOzs7O1FBSUcsSUFBSSxPQUFPLEdBQUc7UUFDakIsTUFBTSxFQUFDLFVBQUMsSUFBVztZQUNmLElBQUksTUFBTSxHQUFzQixFQUFFLEVBQzlCLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUNuQyxRQUFpQixDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBRXJCLFFBQVEsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQzFCLEtBQUksSUFBSSxDQUFDLEdBQVEsQ0FBQyxFQUFDLEdBQUcsR0FBUSxRQUFRLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3JELElBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFLLFFBQVEsQ0FBQyxDQUFDLENBQWlCLENBQUMsT0FBTyxFQUFDO29CQUNuRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQWdCLENBQUMsQ0FBQztpQkFDM0M7YUFDSjtZQUNELE9BQU8sTUFBTSxDQUFDO1NBQ2pCOzs7Ozs7O1FBUUQsR0FBRyxFQUFDLFVBQUMsUUFBZSxFQUFDLE1BQWtDO1lBQWxDLHVCQUFBO2dCQUFBLGlCQUFrQzs7WUFDbkQsSUFBSSxJQUFJLEdBQVUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQ2xDLFlBQVksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxFQUN4RSxFQUFFLEdBQVUsSUFBSSxNQUFNLENBQUMsU0FBUyxHQUFDLFlBQVksR0FBQyxTQUFTLENBQUMsRUFDeEQsTUFBTSxHQUFzQixFQUFFLENBQUM7WUFDbkMsUUFBUSxJQUFJOztnQkFFUixLQUFLLEdBQUc7b0JBQ0osTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBZ0IsQ0FBQyxDQUFDO29CQUN0RSxNQUFNOztnQkFHTixLQUFLLEdBQUc7b0JBQ0osSUFBRyxPQUFPLE1BQU0sQ0FBQyxzQkFBc0IsS0FBSyxVQUFVLEVBQUM7d0JBQ25ELElBQUksT0FBSyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDeEQsS0FBSSxJQUFJLENBQUMsR0FBVSxDQUFDLEVBQUMsR0FBRyxHQUFVLE9BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBQzs0QkFDdkQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFLLENBQUMsQ0FBQyxDQUFnQixDQUFDLENBQUM7eUJBQ3hDO3FCQUNKO3lCQUFJO3dCQUNELElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDL0MsS0FBSSxJQUFJLENBQUMsR0FBVSxDQUFDLEVBQUMsR0FBRyxHQUFVLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBQzs0QkFDekQsSUFBSSxJQUFJLEdBQVcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM5QixJQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDO2dDQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQW1CLENBQUMsQ0FBQzs2QkFDcEM7eUJBQ0o7cUJBQ0o7b0JBQ0wsTUFBTTs7Z0JBR047b0JBQ0ksSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN4RCxLQUFJLElBQUksQ0FBQyxHQUFVLENBQUMsRUFBQyxHQUFHLEdBQVUsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFDO3dCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQWdCLENBQUMsQ0FBQztxQkFDeEM7b0JBQ0wsTUFBTTthQUNUO1lBQ0QsT0FBTyxNQUFNLENBQUM7U0FDakI7S0FDSixDQUFDOztJQ2pFRixJQUFJLEdBQUcsR0FBWTtRQUFDLGFBQU07YUFBTixVQUFNLEVBQU4scUJBQU0sRUFBTixJQUFNO1lBQU4sd0JBQU07O1FBQ2xCLElBQUk7WUFDQSxPQUFPLENBQUMsR0FBRyxPQUFYLE9BQU8sRUFBUSxHQUFHLEVBQUU7U0FDdkI7UUFBQyxPQUFPLEtBQUssRUFBRSxHQUFFO0lBQ3RCLENBQUMsRUFDRCxhQUFhLEdBQVU7UUFDbkIsT0FBTyxFQUFDLElBQUk7UUFDWixJQUFJLEVBQUMsRUFBRTtRQUNQLFFBQVEsRUFBQyxjQUFjO1FBQ3ZCLE9BQU8sRUFBQyxVQUFDLElBQUk7WUFDVCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDYjtRQUNELElBQUksRUFBQyxVQUFDLEdBQUc7WUFDTCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDWjtLQUNKO0lBRUQ7SUFDQSxZQUFZLEdBQVksVUFBVSxJQUFJO1FBQ2xDLElBQUksR0FBRyxHQUFpQixFQUFFLENBQUM7UUFDM0IsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDbEIsR0FBRyxDQUFDLElBQUksQ0FBSSxHQUFHLFNBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUMsQ0FBQztTQUN2RDtRQUNELE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQ7SUFDQSxNQUFNLEdBQW1CLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFFakUsS0FBSyxHQUFHLFVBQUMsTUFBTTtRQUNYLE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDOztRQUd0QixLQUFJLElBQUksQ0FBQyxJQUFJLGFBQWEsRUFBQztZQUN2QixJQUFJLEdBQUcsR0FBVSxDQUFDLEVBQ2QsSUFBSSxHQUFpQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFMUMsSUFBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxFQUFDO2dCQUN6QixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQ3RCO1NBQ0o7UUFFRCxJQUFHLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLFFBQVEsRUFBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDckM7UUFFRCxJQUFJLE1BQU0sR0FBcUIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDM0QsWUFBWSxHQUFVLENBQUM7WUFDbkIsSUFBSSxHQUFHLEdBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxPQUFPLG1CQUFpQixHQUFLLENBQUM7U0FDakMsR0FBRyxFQUNKLElBQUksR0FBVSxDQUFDO1lBQ1gsSUFBSSxJQUFJLEdBQVUsRUFBRSxDQUFDO1lBRXJCLEtBQUksSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksRUFBQztnQkFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7WUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxPQUFPLElBQUksQ0FBQztTQUNmLEdBQUcsRUFDSixHQUFHLEdBQU0sTUFBTSxDQUFDLEdBQUcsU0FBSSxZQUFZLENBQUMsSUFBSSxDQUFHLENBQUM7O1FBR2hELE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRztZQUFDLGFBQU07aUJBQU4sVUFBTSxFQUFOLHFCQUFNLEVBQU4sSUFBTTtnQkFBTix3QkFBTTs7WUFDMUIsTUFBTSxDQUFDLE9BQU8sT0FBZCxNQUFNLEVBQVksR0FBRyxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0IsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDL0IsQ0FBQzs7UUFHRixNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNqQixNQUFNLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDO1FBQ2hDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7O1FBRzNCLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBSSxHQUFHLHdCQUFxQixDQUFDLENBQUM7WUFDekMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQixNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQy9CLEVBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztRQUdsQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQUEsR0FBRztZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQ3BDLENBQUM7SUFFTixDQUFDLENBQUM7O0lDeEZOOzs7Ozs7SUFNQSxJQUFJQSxLQUFHLEdBQUcsVUFBQyxJQUFXO1FBQ2QsSUFBSSxTQUFTLEdBQVVDLFFBQU0sRUFBRSxDQUFDO1FBQ2hDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQztJQUVOOzs7Ozs7O0lBT0EsSUFBSUMsS0FBRyxHQUFHLFVBQUMsSUFBVyxFQUFDLEdBQVU7UUFDekIsSUFBSSxTQUFTLEdBQVVELFFBQU0sRUFBRSxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7UUFFdEIsSUFBSSxNQUFNLEdBQVUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQzdCLENBQUMsQ0FBQztJQUVOOzs7Ozs7SUFNQSxJQUFJQSxRQUFNLEdBQUcsVUFBQyxNQUErQjtRQUEvQix1QkFBQTtZQUFBLFNBQWdCLFFBQVEsQ0FBQyxNQUFNOztRQUNyQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQzdFLElBQUksSUFBSSxHQUFpQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUN0QyxHQUFHLEdBQVUsRUFBRSxDQUFDO1FBRXBCLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxHQUFHLEVBQUMsQ0FBQyxFQUFFLEVBQUM7WUFDbEMsSUFBSSxLQUFLLEdBQWlCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0MsSUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFDO2dCQUNwQixHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEQ7U0FDSjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQyxDQUFDO0lBRU47Ozs7OztJQU1BLElBQUksS0FBSyxHQUFHLFVBQUMsR0FBZTtRQUFmLG9CQUFBO1lBQUEsUUFBZTs7UUFDcEIsSUFBSSxNQUFNLEdBQVUsR0FBRyxDQUFDO1FBQ3hCLEtBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFDO1lBQ2IsSUFBSSxJQUFJLEdBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sSUFBTyxDQUFDLFNBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQUcsQ0FBQTtTQUNoRDtRQUNELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztBQUVOLGVBQWU7UUFDWCxHQUFHLE9BQUE7UUFDSCxHQUFHLE9BQUE7UUFDSCxNQUFNLFVBQUE7UUFDTixLQUFLLE9BQUE7S0FDUixDQUFBOztBQzlERCxnQkFBZTtRQUNYLEtBQUssRUFBQ0UsS0FBTTtRQUNaLE1BQU0sRUFBQyxPQUFPO1FBQ2QsT0FBTyxFQUFDQyxPQUFRO1FBQ2hCLEtBQUssRUFBQ0MsS0FBTTtRQUNaLEdBQUcsRUFBQyxJQUFJO0tBQ1gsQ0FBQzs7Ozs7Ozs7In0=