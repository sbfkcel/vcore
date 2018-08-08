
/**
 * 获取url参数
 * @function get
 * @param  {type} name:string {参数名称}
 * @return {string} {对应的参数}
 */
let get = (name:string):string => {
        let parameter:Object = toJson();
        return parameter[name];
    };

/**
 * 设置url参数
 * @function set
 * @param  {type} name:string {参数名称}
 * @param  {type} val:string  {参数值}
 * @return {undefined} {description}
 */
let set = (name:string,val:string) => {
        let parameter:Object = toJson();
        parameter[name] = val;

        let search:string = parse(parameter);
        location.search = search;
    };

/**
 * 将url参数转为Json对象
 * @function toJson
 * @param  {type} search:string {url参数，即location.search参数部分}
 * @return {Object} {返回转换出的json对象}
 */
let toJson = (search:string = location.search):Object => {
        search = search.indexOf('?') > -1 ? search.substr(1, search.length) : search;
        let list:Array<string> = search.split('&'),
            obj:Object = {};
        
        for(let i=0,len=list.length;i<len;i++){
            let items:Array<string> = list[i].split('=');
            if(items[0] && items[1]){
                obj[items[0]] = decodeURIComponent(items[1]);
            };
        };
        return obj;
    };

/**
 * 将Json对象转换为url参数
 * @function parse
 * @param  {type} obj:Object {一个有效的json对象}
 * @return {string} {返回url参数字符串}
 */
let parse = (obj:Object = {}) => {
        let search:string = '?';
        for(let i in obj){
            let item:string = obj[i];
            search += `${i}=${encodeURIComponent(item)}&`
        };
        search = search.substr(0,search.length - 1);
        return search;
    };

export default {
    get,
    set,
    toJson,
    parse
}