let log:Function = (...arg)=>{
        try {
            console.log(...arg);
        } catch (error) {}
    },
    defaultOption:object = {
        timeout:5000,
        data:{},
        callback:'jsoncallback',
        success:(data)=>{
            log(data);
        },
        fail:(err)=>{
            log(err);
        }
    },

    // 将json数据格式化为url参数
    formatParams:Function = function (data):string {
        var arr:Array<string> = [];
        for (let key in data) {
            arr.push(`${key}=${encodeURIComponent(data[key])}`);
        };
        return arr.join('&');
    },

    // 
    header:HTMLHeadElement = document.getElementsByTagName('head')[0],
    
    jsonp = (option)=>{
        option = option || {};

        // 将默认参数传入到配置中
        for(let i in defaultOption){
            let key:string = i,
                item:string|number = defaultOption[i];
            
            if(option[key] === undefined){
                option[key] = item;
            };
        };

        if(typeof option['url'] !== 'string'){
            throw new Error('option.url 不合法');
        };

        let script:HTMLScriptElement = document.createElement('script'),
            callbackName:string = (()=>{
                let num:string = (Math.random()+'').substr(2);
                return `ydEffectJsonp_${num}`;
            })(),
            data:object = (()=>{
                let data:object = {};
                    
                for(let i in option.data){
                    data[i] = option.data[i];
                };
                data[option.callback] = callbackName;
                data['_t'] = (Math.random()+'').substr(2);
                return data;
            })(),
            url = `${option.url}?${formatParams(data)}`;
        
        // 定义回调
        window[callbackName] = (...arg)=>{
            option.success(...arg);
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
        script['timer'] = setTimeout(()=>{
            option.fail(`${url} Request timed out!`);
            header.removeChild(script);
            window[callbackName] = null;
        },option.timeout);
        
        // 请求错误
        script.onerror = err => {
            throw new Error(`Request error`);
        };
        
    };

export default jsonp;