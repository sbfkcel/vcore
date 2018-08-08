/// <reference path="./_cookie.d.ts" />

/**
 * 获取cookie值
 * @param  {string} name 需要获取的cookie名称
 * @return {string} 对应的cookie值或''
 */
let get = (name:string):string|undefined=>{
        if(typeof name !== 'string' || !name){
            throw new Error('Invalid cookie name');
        };
        let obj:Object = toJson();
        return obj[name]; 
    },

    
    /**
     * 将cookie转为Json
     * @returns Object  返回一个Json对象
     */
     
    toJson = ():Object=>{
        let obj:Object = {},
            cookieVal:string = document.cookie,
            cookieList:Array<string> = cookieVal ? cookieVal.split('; ') : [];
        if(cookieList.length){
            for(let i=0,len=cookieList.length; i<len; i++){
                let item:string = cookieList[i],
                    aItem:Array<string> = item.split('='),
                    key:string = aItem[0],
                    val:string = aItem[1];
                obj[key] = val; 
            };
        };
        return obj;
    },


    // 设置cookie选项
    setDefaultOption:SetOption = {
        // 默认路径为根目录
        path:'/',

        // 域名如果有
        domain:location.hostname.indexOf('www') > -1 ? location.hostname.replace('www','') : location.hostname,
        expires:0
    },


    /**
     * 设置cookie
     * @param  {string} name    cookie名称
     * @param  {string} val     cookie值
     * @param  {SetOption=setDefaultOption} option  选项
     */
    set = (name:string,val:string,option:SetOption = setDefaultOption)=>{

        // 遍历选项，如果未被传入参数则使用默认参数代替
        for(let i in setDefaultOption){
            let item:string|number = setDefaultOption[i];
            if(option[i] === undefined){
                option[i] = item;
            };
        };

        let date:string = (()=>{
                let time:Date = new Date;
                time.setDate(time.getDate() + option.expires);
                return time.toString();
            })(),
            domain:string = option.domain,
            path:string = option.path,
            expires:string = date,
            cookie:string = `${name}=${val}; domain=${domain}; path=${path}; expires=${expires}`;
        //name=val; domain=.1x3x.com; path=/; expires=Thu, 01-Jan-70 00:00:01 GMT
        document.cookie = cookie;
    },
    
    /**
     * 删除cookie
     * @param  {string} name    需要删除的cookie名称
     * @param  {SetOption=setDefaultOption} option  cookie选项
     */
    del = (name:string,option:SetOption = setDefaultOption)=>{
        let setOption:SetOption = {};
        for(let key in option){
            setOption[key] = option[key];
        };
        setOption.expires = -1;
        set(name,'',setOption);
    };

export default {get,toJson,set,del};