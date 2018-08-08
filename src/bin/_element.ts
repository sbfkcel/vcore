    /**
     * 创建HTML元素
     * @param  {string} html html字符串
     * @returns Array   返回html元素
     */let element = {
    create:(html:string):Array<HTMLElement>=>{
        let result:Array<HTMLElement> = [],
            box = document.createElement('div'),
            nodeList:NodeList;
        box.innerHTML = html;
        
        nodeList = box.childNodes;
        for(let i:number=0,len:number=nodeList.length;i<len; i++){
            if(nodeList[i] && (nodeList[i] as HTMLElement).tagName){
                result.push(nodeList[i] as HTMLElement);
            };
        };
        return result;
    },

    /**
     * 获取HTML元素
     * @param  {string} selector 选择器（'.class'、'#id'、'tag'），父级元素
     * @param  {Document|Element=document} parent 父元素以提升低版本下元素获取速度
     * @returns Array 返回一个数组元素
     */
    get:(selector:string,parent:Document|Element = document):Array<HTMLElement>=>{
        let type:string = selector.substr(0,1),
            selectorName = /^(\.|#)/i.test(selector) ? selector.substr(1) : selector,
            re:RegExp = new RegExp('(^|\\s)'+selectorName+'(\\s|$)'),
            result:Array<HTMLElement> = [];
        switch (type) {
            // 获取ID
            case '#':
                result.push(document.getElementById(selectorName) as HTMLElement);
            break;
            
            // 获取类名
            case '.':
                if(typeof parent.getElementsByClassName === 'function'){
                    let oList = parent.getElementsByClassName(selectorName);
                    for(let i:number = 0,len:number = oList.length; i<len; i++){
                        result.push(oList[i] as HTMLElement);
                    };
                }else{
                    let allList = parent.getElementsByTagName('*');
                    for(let i:number = 0,len:number = allList.length; i<len; i++){
                        let item:Element = allList[i];
                        if(re.test(item.className)){
                            result.push(item as HTMLElement);
                        };
                    };
                };
            break;
            
            // 获取标签名
            default:
                let oList = document.getElementsByTagName(selectorName);
                for(let i:number = 0,len:number = oList.length; i<len; i++){
                    result.push(oList[i] as HTMLElement);
                };
            break;
        };
        return result;
    }
};

export default element;