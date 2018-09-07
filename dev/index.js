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
                        arg[0].target = arg[0].target || arg[0].srcElement;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgudHMiLCJzb3VyY2VzIjpbInNyYy9iaW4vX2V2ZW50LnRzIiwic3JjL2Jpbi9fY29va2llLnRzIiwic3JjL2Jpbi9fZWxlbWVudC50cyIsInNyYy9iaW4vX2pzb25wLnRzIiwic3JjL2Jpbi9fdXJsLnRzIiwic3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBpc0FycmFyeTpGdW5jdGlvbiA9IChhcnJheSk6Ym9vbGVhbj0+e1xuICAgIHJldHVybiBhcnJheSAmJiBhcnJheS5sZW5ndGggIT09IHVuZGVmaW5lZDtcbn0sXG5cbi8vIOajgOafpeaYr+WQpuaUr+aMgeivpeS6i+S7tlxuaXNTdXBwb3J0RXZlbnQ6RnVuY3Rpb24gPSAob2JqLHR5cGUpOmJvb2xlYW49PntcbiAgICByZXR1cm4gYG9uJHt0eXBlfWAgaW4gb2JqO1xufSxcblxuZXZlbnRLZXk6c3RyaW5nID0gYF9fZXZlbnRfX2AsXG5cbmdldEV2ZW50U3RhdHVzS2V5OkZ1bmN0aW9uID0gKHR5cGUpOnN0cmluZz0+e3JldHVybiBgX19ldmVudFN0YXR1c19fJHt0eXBlfWB9LFxuXG5ldmVudCA9IHtcbiAgICBhZGQ6KG9iajpvYmplY3QsdHlwZTpzdHJpbmcsZm46RnVuY3Rpb24pOmJvb2xlYW49PntcbiAgICAgICAgbGV0IGV2ZW50U3RhdHVzS2V5OnN0cmluZyA9IGdldEV2ZW50U3RhdHVzS2V5KHR5cGUpLFxuICAgICAgICAgICAgaXNTdXBwb3J0VHlwZTpib29sZWFuID0gaXNTdXBwb3J0RXZlbnQob2JqLHR5cGUpO1xuXG4gICAgICAgIC8vIOWmguaenOS7juacquS9v+eUqOi/h+S6i+S7tue7keWumu+8jOWImee7meWFg+e0oOa3u+WKoOS4gOS4quS6i+S7tuWvueixoVxuICAgICAgICBpZihvYmpbZXZlbnRLZXldID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XSA9IHt9O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOWmguaenOivpeS6i+S7tui/mOayoeaciei/m+ihjOi/h+a3u+WKoO+8jOWImeWIneWni+WMluS6i+S7tuWIl+ihqFxuICAgICAgICBpZighaXNBcnJhcnkob2JqW2V2ZW50S2V5XVt0eXBlXSkpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XVt0eXBlXSA9IFtdO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIOWwhuS6i+S7tua3u+WKoOWIsOaJp+ihjOWIl+ihqFxuICAgICAgICBvYmpbZXZlbnRLZXldW3R5cGVdLnB1c2goZm4pO1xuXG4gICAgICAgIC8vIOWmguaenOS6i+S7tuacque7keWumui/h+WImei/m+ihjOe7keWumuW5tuS4lOaUr+aMgeivpeS6i+S7tueahFxuICAgICAgICBpZihvYmpbZXZlbnRLZXldW2V2ZW50U3RhdHVzS2V5XSA9PT0gdW5kZWZpbmVkICYmIGlzU3VwcG9ydFR5cGUpe1xuICAgICAgICAgICAgb2JqW2V2ZW50S2V5XVtldmVudFN0YXR1c0tleV0gPSB0cnVlO1xuXG4gICAgICAgICAgICBsZXQgcnVuOkZ1bmN0aW9uID0gZnVuY3Rpb24oLi4uYXJnKXtcbiAgICAgICAgICAgICAgICAvLyBhcmdbMF0gPSBhcmdbMF0gfHwgd2luZG93LmV2ZW50O1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaT0wLGxlbj1vYmpbZXZlbnRLZXldW3R5cGVdLmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpdGVtOkZ1bmN0aW9uID0gb2JqW2V2ZW50S2V5XVt0eXBlXVtpXTtcbiAgICAgICAgICAgICAgICAgICAgYXJnWzBdLnRhcmdldCA9IGFyZ1swXS50YXJnZXQgfHwgYXJnWzBdLnNyY0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FsbChvYmosLi4uYXJnKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIG9ialsnYWRkRXZlbnRMaXN0ZW5lciddID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgICAgICBvYmpbJ2FkZEV2ZW50TGlzdGVuZXInXSh0eXBlLHJ1bixmYWxzZSk7XG4gICAgICAgICAgICB9ZWxzZSBpZih0eXBlb2Ygb2JqWydhdHRhY2hFdmVudCddID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgb2JqWydhdHRhY2hFdmVudCddKGBvbiR7dHlwZX1gLHJ1bik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gaXNTdXBwb3J0VHlwZTtcbiAgICB9LFxuICAgIHJlbW92ZToob2JqOm9iamVjdCx0eXBlOnN0cmluZyxmbjpGdW5jdGlvbik9PntcbiAgICAgICAgaWYob2JqW2V2ZW50S2V5XSAmJiBpc0FycmFyeShvYmpbZXZlbnRLZXldW3R5cGVdKSl7XG4gICAgICAgICAgICBsZXQgZm5MaXN0OkFycmF5PEZ1bmN0aW9uPiA9IG9ialtldmVudEtleV1bdHlwZV07XG4gICAgICAgICAgICBmb3IobGV0IGk6bnVtYmVyPTAsbGVuOm51bWJlcj1mbkxpc3QubGVuZ3RoOyBpPGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbTpGdW5jdGlvbiA9IGZuTGlzdFtpXTtcblxuICAgICAgICAgICAgICAgIGlmKGl0ZW0gPT09IGZuKXtcbiAgICAgICAgICAgICAgICAgICAgZm5MaXN0LnNwbGljZShpLDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGZuTGlzdC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIOW9k+aWueazlemDveiiq+WIoOmZpOS6hu+8jOWImeWIoOmZpOaVtOS4quexu+Wei+eahOS6i+S7tuWIl+ihqOWSjOS6i+S7tue7keWumueKtuaAgVxuICAgICAgICAgICAgaWYoIWZuTGlzdC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGV2ZW50LnJlbW92ZUFsbChvYmosdHlwZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvLyDnp7vpmaTlhYPntKDkuIrmiYDmnInmjIflrprnsbvlnovnmoTkuovku7ZcbiAgICByZW1vdmVBbGw6KG9iajpvYmplY3QsdHlwZTpzdHJpbmcpPT57XG4gICAgICAgIGxldCBldmVudFN0YXR1c0tleTpzdHJpbmcgPSBnZXRFdmVudFN0YXR1c0tleSh0eXBlKTtcbiAgICAgICAgaWYob2JqW2V2ZW50S2V5XSl7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2V2ZW50S2V5XVt0eXBlXTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYob2JqW2V2ZW50S2V5XSAmJiBvYmpbZXZlbnRLZXldW2V2ZW50U3RhdHVzS2V5XSl7XG4gICAgICAgICAgICBkZWxldGUgb2JqW2V2ZW50S2V5XVtldmVudFN0YXR1c0tleV07XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8vIOmYu+atoum7mOiupOS6i+S7tueahOaWueazle+8iOS+i+Wmgu+8mumTvuaOpeS4jeS8muiiq+aJk+W8gO+8ie+8jOS9huaYr+S8muWPkeeUn+WGkuazoeihjOS4ulxuICAgIHByZXZlbnREZWZhdWx0OihldmVudDpFdmVudCk9PntcbiAgICAgICAgaWYoZXZlbnQucHJldmVudERlZmF1bHQpe1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB3aW5kb3cuZXZlbnQucmV0dXJuVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLy8g6Zi75q2i5LqL5Lu25YaS5rOh77yM5LiN6K6p5LqL5Lu25ZCR5LiK77yIZG9jdW1lbnTvvInolJPlu7bvvIzkvYbpu5jorqTkuovku7bkvp3nhLbkvJrmiafooYxcbiAgICBzdG9wUHJvcGFnYXRpb246KGV2ZW50OkV2ZW50KT0+e1xuICAgICAgICBpZihldmVudC5zdG9wUHJvcGFnYXRpb24pe1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgd2luZG93LmV2ZW50LmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfVxufTtcbmV4cG9ydCBkZWZhdWx0IGV2ZW50OyIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL19jb29raWUuZC50c1wiIC8+XG5cbi8qKlxuICog6I635Y+WY29va2ll5YC8XG4gKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUg6ZyA6KaB6I635Y+W55qEY29va2ll5ZCN56ewXG4gKiBAcmV0dXJuIHtzdHJpbmd9IOWvueW6lOeahGNvb2tpZeWAvOaIlicnXG4gKi9cbmxldCBnZXQgPSAobmFtZTpzdHJpbmcpOnN0cmluZ3x1bmRlZmluZWQ9PntcbiAgICAgICAgaWYodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnIHx8ICFuYW1lKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb29raWUgbmFtZScpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgb2JqOk9iamVjdCA9IHRvSnNvbigpO1xuICAgICAgICByZXR1cm4gb2JqW25hbWVdOyBcbiAgICB9LFxuXG4gICAgXG4gICAgLyoqXG4gICAgICog5bCGY29va2ll6L2s5Li6SnNvblxuICAgICAqIEByZXR1cm5zIE9iamVjdCAg6L+U5Zue5LiA5LiqSnNvbuWvueixoVxuICAgICAqL1xuICAgICBcbiAgICB0b0pzb24gPSAoKTpPYmplY3Q9PntcbiAgICAgICAgbGV0IG9iajpPYmplY3QgPSB7fSxcbiAgICAgICAgICAgIGNvb2tpZVZhbDpzdHJpbmcgPSBkb2N1bWVudC5jb29raWUsXG4gICAgICAgICAgICBjb29raWVMaXN0OkFycmF5PHN0cmluZz4gPSBjb29raWVWYWwgPyBjb29raWVWYWwuc3BsaXQoJzsgJykgOiBbXTtcbiAgICAgICAgaWYoY29va2llTGlzdC5sZW5ndGgpe1xuICAgICAgICAgICAgZm9yKGxldCBpPTAsbGVuPWNvb2tpZUxpc3QubGVuZ3RoOyBpPGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICBsZXQgaXRlbTpzdHJpbmcgPSBjb29raWVMaXN0W2ldLFxuICAgICAgICAgICAgICAgICAgICBhSXRlbTpBcnJheTxzdHJpbmc+ID0gaXRlbS5zcGxpdCgnPScpLFxuICAgICAgICAgICAgICAgICAgICBrZXk6c3RyaW5nID0gYUl0ZW1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHZhbDpzdHJpbmcgPSBhSXRlbVsxXTtcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHZhbDsgXG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cblxuICAgIC8vIOiuvue9rmNvb2tpZemAiemhuVxuICAgIHNldERlZmF1bHRPcHRpb246U2V0T3B0aW9uID0ge1xuICAgICAgICAvLyDpu5jorqTot6/lvoTkuLrmoLnnm67lvZVcbiAgICAgICAgcGF0aDonLycsXG5cbiAgICAgICAgLy8g5Z+f5ZCN5aaC5p6c5pyJXG4gICAgICAgIGRvbWFpbjpsb2NhdGlvbi5ob3N0bmFtZS5pbmRleE9mKCd3d3cnKSA+IC0xID8gbG9jYXRpb24uaG9zdG5hbWUucmVwbGFjZSgnd3d3JywnJykgOiBsb2NhdGlvbi5ob3N0bmFtZSxcbiAgICAgICAgZXhwaXJlczowXG4gICAgfSxcblxuXG4gICAgLyoqXG4gICAgICog6K6+572uY29va2llXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBuYW1lICAgIGNvb2tpZeWQjeensFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdmFsICAgICBjb29raWXlgLxcbiAgICAgKiBAcGFyYW0gIHtTZXRPcHRpb249c2V0RGVmYXVsdE9wdGlvbn0gb3B0aW9uICDpgInpoblcbiAgICAgKi9cbiAgICBzZXQgPSAobmFtZTpzdHJpbmcsdmFsOnN0cmluZyxvcHRpb246U2V0T3B0aW9uID0gc2V0RGVmYXVsdE9wdGlvbik9PntcblxuICAgICAgICAvLyDpgY3ljobpgInpobnvvIzlpoLmnpzmnKrooqvkvKDlhaXlj4LmlbDliJnkvb/nlKjpu5jorqTlj4LmlbDku6Pmm79cbiAgICAgICAgZm9yKGxldCBpIGluIHNldERlZmF1bHRPcHRpb24pe1xuICAgICAgICAgICAgbGV0IGl0ZW06c3RyaW5nfG51bWJlciA9IHNldERlZmF1bHRPcHRpb25baV07XG4gICAgICAgICAgICBpZihvcHRpb25baV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgb3B0aW9uW2ldID0gaXRlbTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGRhdGU6c3RyaW5nID0gKCgpPT57XG4gICAgICAgICAgICAgICAgbGV0IHRpbWU6RGF0ZSA9IG5ldyBEYXRlO1xuICAgICAgICAgICAgICAgIHRpbWUuc2V0RGF0ZSh0aW1lLmdldERhdGUoKSArIG9wdGlvbi5leHBpcmVzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZS50b1N0cmluZygpO1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGRvbWFpbjpzdHJpbmcgPSBvcHRpb24uZG9tYWluLFxuICAgICAgICAgICAgcGF0aDpzdHJpbmcgPSBvcHRpb24ucGF0aCxcbiAgICAgICAgICAgIGV4cGlyZXM6c3RyaW5nID0gZGF0ZSxcbiAgICAgICAgICAgIGNvb2tpZTpzdHJpbmcgPSBgJHtuYW1lfT0ke3ZhbH07IGRvbWFpbj0ke2RvbWFpbn07IHBhdGg9JHtwYXRofTsgZXhwaXJlcz0ke2V4cGlyZXN9YDtcbiAgICAgICAgLy9uYW1lPXZhbDsgZG9tYWluPS4xeDN4LmNvbTsgcGF0aD0vOyBleHBpcmVzPVRodSwgMDEtSmFuLTcwIDAwOjAwOjAxIEdNVFxuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWU7XG4gICAgfSxcbiAgICBcbiAgICAvKipcbiAgICAgKiDliKDpmaRjb29raWVcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWUgICAg6ZyA6KaB5Yig6Zmk55qEY29va2ll5ZCN56ewXG4gICAgICogQHBhcmFtICB7U2V0T3B0aW9uPXNldERlZmF1bHRPcHRpb259IG9wdGlvbiAgY29va2ll6YCJ6aG5XG4gICAgICovXG4gICAgZGVsID0gKG5hbWU6c3RyaW5nLG9wdGlvbjpTZXRPcHRpb24gPSBzZXREZWZhdWx0T3B0aW9uKT0+e1xuICAgICAgICBsZXQgc2V0T3B0aW9uOlNldE9wdGlvbiA9IHt9O1xuICAgICAgICBmb3IobGV0IGtleSBpbiBvcHRpb24pe1xuICAgICAgICAgICAgc2V0T3B0aW9uW2tleV0gPSBvcHRpb25ba2V5XTtcbiAgICAgICAgfTtcbiAgICAgICAgc2V0T3B0aW9uLmV4cGlyZXMgPSAtMTtcbiAgICAgICAgc2V0KG5hbWUsJycsc2V0T3B0aW9uKTtcbiAgICB9O1xuXG5leHBvcnQgZGVmYXVsdCB7Z2V0LHRvSnNvbixzZXQsZGVsfTsiLCIgICAgLyoqXG4gICAgICog5Yib5bu6SFRNTOWFg+e0oFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gaHRtbCBodG1s5a2X56ym5LiyXG4gICAgICogQHJldHVybnMgQXJyYXkgICDov5Tlm55odG1s5YWD57SgXG4gICAgICovbGV0IGVsZW1lbnQgPSB7XG4gICAgY3JlYXRlOihodG1sOnN0cmluZyk6QXJyYXk8SFRNTEVsZW1lbnQ+PT57XG4gICAgICAgIGxldCByZXN1bHQ6QXJyYXk8SFRNTEVsZW1lbnQ+ID0gW10sXG4gICAgICAgICAgICBib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICAgIG5vZGVMaXN0Ok5vZGVMaXN0O1xuICAgICAgICBib3guaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgXG4gICAgICAgIG5vZGVMaXN0ID0gYm94LmNoaWxkTm9kZXM7XG4gICAgICAgIGZvcihsZXQgaTpudW1iZXI9MCxsZW46bnVtYmVyPW5vZGVMaXN0Lmxlbmd0aDtpPGxlbjsgaSsrKXtcbiAgICAgICAgICAgIGlmKG5vZGVMaXN0W2ldICYmIChub2RlTGlzdFtpXSBhcyBIVE1MRWxlbWVudCkudGFnTmFtZSl7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZUxpc3RbaV0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICog6I635Y+WSFRNTOWFg+e0oFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gc2VsZWN0b3Ig6YCJ5oup5Zmo77yIJy5jbGFzcyfjgIEnI2lkJ+OAgSd0YWcn77yJ77yM54i257qn5YWD57SgXG4gICAgICogQHBhcmFtICB7RG9jdW1lbnR8RWxlbWVudD1kb2N1bWVudH0gcGFyZW50IOeItuWFg+e0oOS7peaPkOWNh+S9jueJiOacrOS4i+WFg+e0oOiOt+WPlumAn+W6plxuICAgICAqIEByZXR1cm5zIEFycmF5IOi/lOWbnuS4gOS4quaVsOe7hOWFg+e0oFxuICAgICAqL1xuICAgIGdldDooc2VsZWN0b3I6c3RyaW5nLHBhcmVudDpEb2N1bWVudHxFbGVtZW50ID0gZG9jdW1lbnQpOkFycmF5PEhUTUxFbGVtZW50Pj0+e1xuICAgICAgICBsZXQgdHlwZTpzdHJpbmcgPSBzZWxlY3Rvci5zdWJzdHIoMCwxKSxcbiAgICAgICAgICAgIHNlbGVjdG9yTmFtZSA9IC9eKFxcLnwjKS9pLnRlc3Qoc2VsZWN0b3IpID8gc2VsZWN0b3Iuc3Vic3RyKDEpIDogc2VsZWN0b3IsXG4gICAgICAgICAgICByZTpSZWdFeHAgPSBuZXcgUmVnRXhwKCcoXnxcXFxccyknK3NlbGVjdG9yTmFtZSsnKFxcXFxzfCQpJyksXG4gICAgICAgICAgICByZXN1bHQ6QXJyYXk8SFRNTEVsZW1lbnQ+ID0gW107XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgLy8g6I635Y+WSURcbiAgICAgICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yTmFtZSkgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIOiOt+WPluexu+WQjVxuICAgICAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIHBhcmVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lID09PSAnZnVuY3Rpb24nKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9MaXN0ID0gcGFyZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3JOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpOm51bWJlciA9IDAsbGVuOm51bWJlciA9IG9MaXN0Lmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChvTGlzdFtpXSBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbGxMaXN0ID0gcGFyZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCcqJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcihsZXQgaTpudW1iZXIgPSAwLGxlbjpudW1iZXIgPSBhbGxMaXN0Lmxlbmd0aDsgaTxsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXRlbTpFbGVtZW50ID0gYWxsTGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlLnRlc3QoaXRlbS5jbGFzc05hbWUpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChpdGVtIGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyDojrflj5bmoIfnrb7lkI1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgbGV0IG9MaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3JOYW1lKTtcbiAgICAgICAgICAgICAgICBmb3IobGV0IGk6bnVtYmVyID0gMCxsZW46bnVtYmVyID0gb0xpc3QubGVuZ3RoOyBpPGxlbjsgaSsrKXtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gob0xpc3RbaV0gYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBlbGVtZW50OyIsImxldCBsb2c6RnVuY3Rpb24gPSAoLi4uYXJnKT0+e1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coLi4uYXJnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gICAgfSxcbiAgICBkZWZhdWx0T3B0aW9uOm9iamVjdCA9IHtcbiAgICAgICAgdGltZW91dDo1MDAwLFxuICAgICAgICBkYXRhOnt9LFxuICAgICAgICBjYWxsYmFjazonanNvbmNhbGxiYWNrJyxcbiAgICAgICAgc3VjY2VzczooZGF0YSk9PntcbiAgICAgICAgICAgIGxvZyhkYXRhKTtcbiAgICAgICAgfSxcbiAgICAgICAgZmFpbDooZXJyKT0+e1xuICAgICAgICAgICAgbG9nKGVycik7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5bCGanNvbuaVsOaNruagvOW8j+WMluS4unVybOWPguaVsFxuICAgIGZvcm1hdFBhcmFtczpGdW5jdGlvbiA9IGZ1bmN0aW9uIChkYXRhKTpzdHJpbmcge1xuICAgICAgICB2YXIgYXJyOkFycmF5PHN0cmluZz4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGAke2tleX09JHtlbmNvZGVVUklDb21wb25lbnQoZGF0YVtrZXldKX1gKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGFyci5qb2luKCcmJyk7XG4gICAgfSxcblxuICAgIC8vIFxuICAgIGhlYWRlcjpIVE1MSGVhZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLFxuICAgIFxuICAgIGpzb25wID0gKG9wdGlvbik9PntcbiAgICAgICAgb3B0aW9uID0gb3B0aW9uIHx8IHt9O1xuXG4gICAgICAgIC8vIOWwhum7mOiupOWPguaVsOS8oOWFpeWIsOmFjee9ruS4rVxuICAgICAgICBmb3IobGV0IGkgaW4gZGVmYXVsdE9wdGlvbil7XG4gICAgICAgICAgICBsZXQga2V5OnN0cmluZyA9IGksXG4gICAgICAgICAgICAgICAgaXRlbTpzdHJpbmd8bnVtYmVyID0gZGVmYXVsdE9wdGlvbltpXTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYob3B0aW9uW2tleV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICAgICAgb3B0aW9uW2tleV0gPSBpdGVtO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9uWyd1cmwnXSAhPT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb24udXJsIOS4jeWQiOazlScpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzY3JpcHQ6SFRNTFNjcmlwdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSxcbiAgICAgICAgICAgIGNhbGxiYWNrTmFtZTpzdHJpbmcgPSAoKCk9PntcbiAgICAgICAgICAgICAgICBsZXQgbnVtOnN0cmluZyA9IChNYXRoLnJhbmRvbSgpKycnKS5zdWJzdHIoMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGB5ZEVmZmVjdEpzb25wXyR7bnVtfWA7XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgZGF0YTpvYmplY3QgPSAoKCk9PntcbiAgICAgICAgICAgICAgICBsZXQgZGF0YTpvYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yKGxldCBpIGluIG9wdGlvbi5kYXRhKXtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpXSA9IG9wdGlvbi5kYXRhW2ldO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZGF0YVtvcHRpb24uY2FsbGJhY2tdID0gY2FsbGJhY2tOYW1lO1xuICAgICAgICAgICAgICAgIGRhdGFbJ190J10gPSAoTWF0aC5yYW5kb20oKSsnJykuc3Vic3RyKDIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIHVybCA9IGAke29wdGlvbi51cmx9PyR7Zm9ybWF0UGFyYW1zKGRhdGEpfWA7XG4gICAgICAgIFxuICAgICAgICAvLyDlrprkuYnlm57osINcbiAgICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSAoLi4uYXJnKT0+e1xuICAgICAgICAgICAgb3B0aW9uLnN1Y2Nlc3MoLi4uYXJnKTtcbiAgICAgICAgICAgIGhlYWRlci5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHNjcmlwdFsndGltZXInXSk7XG4gICAgICAgICAgICB3aW5kb3dbY2FsbGJhY2tOYW1lXSA9IG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICAvLyDlsIbohJrmnKzmt7vliqDliLDpobXpnaJcbiAgICAgICAgc2NyaXB0LnNyYyA9IHVybDtcbiAgICAgICAgc2NyaXB0LnR5cGUgPSAndGV4dC9qYXZhc2NyaXB0JztcbiAgICAgICAgc2NyaXB0LmNoYXJzZXQgPSAndXRmLTgnO1xuICAgICAgICBoZWFkZXIuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcblxuICAgICAgICAvLyDor7fmsYLotoXml7ZcbiAgICAgICAgc2NyaXB0Wyd0aW1lciddID0gc2V0VGltZW91dCgoKT0+e1xuICAgICAgICAgICAgb3B0aW9uLmZhaWwoYCR7dXJsfSBSZXF1ZXN0IHRpbWVkIG91dCFgKTtcbiAgICAgICAgICAgIGhlYWRlci5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgICAgd2luZG93W2NhbGxiYWNrTmFtZV0gPSBudWxsO1xuICAgICAgICB9LG9wdGlvbi50aW1lb3V0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIOivt+axgumUmeivr1xuICAgICAgICBzY3JpcHQub25lcnJvciA9IGVyciA9PiB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVlc3QgZXJyb3JgKTtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgfTtcblxuZXhwb3J0IGRlZmF1bHQganNvbnA7IiwiXG4vKipcbiAqIOiOt+WPlnVybOWPguaVsFxuICogQGZ1bmN0aW9uIGdldFxuICogQHBhcmFtICB7dHlwZX0gbmFtZTpzdHJpbmcge+WPguaVsOWQjeensH1cbiAqIEByZXR1cm4ge3N0cmluZ30ge+WvueW6lOeahOWPguaVsH1cbiAqL1xubGV0IGdldCA9IChuYW1lOnN0cmluZyk6c3RyaW5nID0+IHtcbiAgICAgICAgbGV0IHBhcmFtZXRlcjpPYmplY3QgPSB0b0pzb24oKTtcbiAgICAgICAgcmV0dXJuIHBhcmFtZXRlcltuYW1lXTtcbiAgICB9O1xuXG4vKipcbiAqIOiuvue9rnVybOWPguaVsFxuICogQGZ1bmN0aW9uIHNldFxuICogQHBhcmFtICB7dHlwZX0gbmFtZTpzdHJpbmcge+WPguaVsOWQjeensH1cbiAqIEBwYXJhbSAge3R5cGV9IHZhbDpzdHJpbmcgIHvlj4LmlbDlgLx9XG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IHtkZXNjcmlwdGlvbn1cbiAqL1xubGV0IHNldCA9IChuYW1lOnN0cmluZyx2YWw6c3RyaW5nKSA9PiB7XG4gICAgICAgIGxldCBwYXJhbWV0ZXI6T2JqZWN0ID0gdG9Kc29uKCk7XG4gICAgICAgIHBhcmFtZXRlcltuYW1lXSA9IHZhbDtcblxuICAgICAgICBsZXQgc2VhcmNoOnN0cmluZyA9IHBhcnNlKHBhcmFtZXRlcik7XG4gICAgICAgIGxvY2F0aW9uLnNlYXJjaCA9IHNlYXJjaDtcbiAgICB9O1xuXG4vKipcbiAqIOWwhnVybOWPguaVsOi9rOS4ukpzb27lr7nosaFcbiAqIEBmdW5jdGlvbiB0b0pzb25cbiAqIEBwYXJhbSAge3R5cGV9IHNlYXJjaDpzdHJpbmcge3VybOWPguaVsO+8jOWNs2xvY2F0aW9uLnNlYXJjaOWPguaVsOmDqOWIhn1cbiAqIEByZXR1cm4ge09iamVjdH0ge+i/lOWbnui9rOaNouWHuueahGpzb27lr7nosaF9XG4gKi9cbmxldCB0b0pzb24gPSAoc2VhcmNoOnN0cmluZyA9IGxvY2F0aW9uLnNlYXJjaCk6T2JqZWN0ID0+IHtcbiAgICAgICAgc2VhcmNoID0gc2VhcmNoLmluZGV4T2YoJz8nKSA+IC0xID8gc2VhcmNoLnN1YnN0cigxLCBzZWFyY2gubGVuZ3RoKSA6IHNlYXJjaDtcbiAgICAgICAgbGV0IGxpc3Q6QXJyYXk8c3RyaW5nPiA9IHNlYXJjaC5zcGxpdCgnJicpLFxuICAgICAgICAgICAgb2JqOk9iamVjdCA9IHt9O1xuICAgICAgICBcbiAgICAgICAgZm9yKGxldCBpPTAsbGVuPWxpc3QubGVuZ3RoO2k8bGVuO2krKyl7XG4gICAgICAgICAgICBsZXQgaXRlbXM6QXJyYXk8c3RyaW5nPiA9IGxpc3RbaV0uc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIGlmKGl0ZW1zWzBdICYmIGl0ZW1zWzFdKXtcbiAgICAgICAgICAgICAgICBvYmpbaXRlbXNbMF1dID0gZGVjb2RlVVJJQ29tcG9uZW50KGl0ZW1zWzFdKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcblxuLyoqXG4gKiDlsIZKc29u5a+56LGh6L2s5o2i5Li6dXJs5Y+C5pWwXG4gKiBAZnVuY3Rpb24gcGFyc2VcbiAqIEBwYXJhbSAge3R5cGV9IG9iajpPYmplY3Qge+S4gOS4quacieaViOeahGpzb27lr7nosaF9XG4gKiBAcmV0dXJuIHtzdHJpbmd9IHvov5Tlm551cmzlj4LmlbDlrZfnrKbkuLJ9XG4gKi9cbmxldCBwYXJzZSA9IChvYmo6T2JqZWN0ID0ge30pID0+IHtcbiAgICAgICAgbGV0IHNlYXJjaDpzdHJpbmcgPSAnPyc7XG4gICAgICAgIGZvcihsZXQgaSBpbiBvYmope1xuICAgICAgICAgICAgbGV0IGl0ZW06c3RyaW5nID0gb2JqW2ldO1xuICAgICAgICAgICAgc2VhcmNoICs9IGAke2l9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0pfSZgXG4gICAgICAgIH07XG4gICAgICAgIHNlYXJjaCA9IHNlYXJjaC5zdWJzdHIoMCxzZWFyY2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHJldHVybiBzZWFyY2g7XG4gICAgfTtcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGdldCxcbiAgICBzZXQsXG4gICAgdG9Kc29uLFxuICAgIHBhcnNlXG59IiwiaW1wb3J0ICRldmVudCBmcm9tICcuL2Jpbi9fZXZlbnQnXG5pbXBvcnQgJGNvb2tpZSBmcm9tICcuL2Jpbi9fY29va2llJ1xuaW1wb3J0ICRlbGVtZW50IGZyb20gJy4vYmluL19lbGVtZW50J1xuaW1wb3J0ICRqc29ucCBmcm9tICcuL2Jpbi9fanNvbnAnXG5pbXBvcnQgJHVybCBmcm9tICcuL2Jpbi9fdXJsJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgZXZlbnQ6JGV2ZW50LFxuICAgIGNvb2tpZTokY29va2llLFxuICAgIGVsZW1lbnQ6JGVsZW1lbnQsXG4gICAganNvbnA6JGpzb25wLFxuICAgIHVybDokdXJsXG59O1xuXG5cbiJdLCJuYW1lcyI6WyJnZXQiLCJ0b0pzb24iLCJzZXQiLCIkZXZlbnQiLCIkZWxlbWVudCIsIiRqc29ucCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUEsSUFBSSxRQUFRLEdBQVksVUFBQyxLQUFLO1FBQzFCLE9BQU8sS0FBSyxJQUFJLEtB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