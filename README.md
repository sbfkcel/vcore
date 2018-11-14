# vcore

`vcore` 是一个用于处理url，元素选择器，dom事件绑定，jsonp数据请求的基础库。


## USE

```bash
npm install vcore
```

```javascript
const vcore = require('vcore'),
    $cookie = vcore.cookie,
    $url = vcore.url,
    $element = vcore.element,
    $event = vcore.event,
    $jsonp = vcore.jsonp;

```

### COOKIE

**Get cookie**

```javascript
/**
 * 获取cookie值
 * @param  {string} name 需要获取的cookie名称
 * @return {string} 对应的cookie值或''
 */
$cookie.get(name);
```


**Set cookie**

```javascript
/**
 * 设置cookie
 * @param  {string} name    cookie名称
 * @param  {string} val     cookie值
 * @param  {object} option  [选填] 设置选项
 */
$cookie.set(name,val,option)
```

option选项：

```javascript
{
    path:'/',
    domain:location.hostname,
    expires:0
} 
```

**Del cookie**

```javascript
/**
 * 删除cookie
 * @param  {string} name    需要删除的cookie名称
 */
$cookie.del(name);
```

### URL

**Get url parameter**

```javascript
/**
 * 获取url参数
 * @function get
 * @param  {string} name 参数名称
 * @return {string} 对应的参数
 */
$url.get(name);
```

**Set url parameter**

```javascript
/**
 * 设置url参数
 * @function set
 * @param  {string} name 参数名称
 * @param  {string} val  参数值
 */
$url.set(name,val);
```

**Url to Json**

```javascript
/**
 * 将url参数转为Json对象
 * @function toJson
 * @param  {string} search [选填] url参数，默认即`location.search`参数部分
 * @return {Object} 返回转换出的json对象
 */
$url.toJson(search)
```

**Json to url parameter**

```javascript
/**
 * 将Json对象转换为url参数
 * @function parse
 * @param  {Object} obj json
 * @return {string} 返回url参数字符串
 */
$url.parse(obj)
```

### Element

**Create Element**

```javascript
/**
 * 创建HTML元素
 * @param  {string} html html字符串
 * @returns Array   返回html元素
 */
$element.create(html);
```

**Get Dom**

```javascript
/**
 * 获取HTML元素
 * @param  {string} selector 选择器（'.class'、'#id'、'tag'），父级元素
 * @param  {HTMLElement} parent [选填] 父元素以提升低版本下元素获取速度，默认为document
 * @returns Array 返回一个数组元素
 */
$element.get(html,parent);
```

### Event

**Add Event**

```javascript
/**
 * 为HTML元素添加事件
 * @param  {HTMLElement} dom 需要绑定事件的dom元素
 * @param  {string} type 事件类型，例如：`click、mouseover、...`
 * @param  {functon} fun 需要执行的函数
 */
$event.add(dom,type,fun);
```

**Remove Event**

```javascript
/**
 * 移除HTML元素上的指定事件
 * @param  {HTMLElement} dom 需要移除事件的dom元素
 * @param  {string} type 事件类型，例如：`click、mouseover、...`
 * @param  {functon} fun 需要移除的函数
 */
$event.remove(dom,type,fun);
```

**Remove all events**

```javascript
/**
 * 移除HTML元素上所有指定类型的事件
 * @param  {HTMLElement} dom 需要移除事件的dom元素
 * @param  {string} type 事件类型，例如：`click、mouseover、...`
 */
$event.removeAll(dom,type);
```

**Prevent default**

```javascript
/**
 * 阴止HTML元素的默认事件
 * @param  {Event} event 对应的event
 */
$event.preventDefault(event);
```

**Stop propagation**

```javascript
/**
 * 阴止HTML元素事件冒泡
 * @param  {Event} event 对应的event
 */
$event.stopPropagation(event);
```

 ### JSONP

```javascript
/**
 * Jsonp封装
 * @param  {option} Object 请求参数（见下方示例）
 */
$jsonp({
    url:'',                     // 需要请求的url
    data:{},                    // url参数
    success:(data)=>{           // 成功回调
    },
    fail:(err)=>{               // [选填] 出错回调
    },
    callback:'jsoncallback',    // [选填] 约定的名称，默认：`jsoncallback`
    timeout:5000                // [选填] 超时设置，默认：`5000ms`
})
```

## License

MIT
