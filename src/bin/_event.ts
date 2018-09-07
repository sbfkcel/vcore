let isArrary:Function = (array):boolean=>{
    return array && array.length !== undefined;
},

// 检查是否支持该事件
isSupportEvent:Function = (obj,type):boolean=>{
    return `on${type}` in obj;
},

eventKey:string = `__event__`,

getEventStatusKey:Function = (type):string=>{return `__eventStatus__${type}`},

event = {
    add:(obj:object,type:string,fn:Function):boolean=>{
        let eventStatusKey:string = getEventStatusKey(type),
            isSupportType:boolean = isSupportEvent(obj,type);

        // 如果从未使用过事件绑定，则给元素添加一个事件对象
        if(obj[eventKey] === undefined){
            obj[eventKey] = {};
        };

        // 如果该事件还没有进行过添加，则初始化事件列表
        if(!isArrary(obj[eventKey][type])){
            obj[eventKey][type] = [];
        };

        // 将事件添加到执行列表
        obj[eventKey][type].push(fn);

        // 如果事件未绑定过则进行绑定并且支持该事件的
        if(obj[eventKey][eventStatusKey] === undefined && isSupportType){
            obj[eventKey][eventStatusKey] = true;

            let run:Function = function(...arg){
                // arg[0] = arg[0] || window.event;
                for(let i=0,len=obj[eventKey][type].length; i<len; i++){
                    let item:Function = obj[eventKey][type][i];

                    // 让IE的event.target不为空
                    arg[0].target = arg[0].target || arg[0].srcElement;
                    
                    item.call(obj,...arg);
                };
            };

            if(typeof obj['addEventListener'] === 'function'){
                obj['addEventListener'](type,run,false);
            }else if(typeof obj['attachEvent'] === 'object'){
                obj['attachEvent'](`on${type}`,run);
            };
        };
        return isSupportType;
    },
    remove:(obj:object,type:string,fn:Function)=>{
        if(obj[eventKey] && isArrary(obj[eventKey][type])){
            let fnList:Array<Function> = obj[eventKey][type];
            for(let i:number=0,len:number=fnList.length; i<len; i++){
                let item:Function = fnList[i];

                if(item === fn){
                    fnList.splice(i,1);
                    i--;
                    len = fnList.length;
                };
            };

            // 当方法都被删除了，则删除整个类型的事件列表和事件绑定状态
            if(!fnList.length){
                event.removeAll(obj,type);
            };
        };
    },

    // 移除元素上所有指定类型的事件
    removeAll:(obj:object,type:string)=>{
        let eventStatusKey:string = getEventStatusKey(type);
        if(obj[eventKey]){
            delete obj[eventKey][type];
        };
        if(obj[eventKey] && obj[eventKey][eventStatusKey]){
            delete obj[eventKey][eventStatusKey];
        };
    },

    // 阻止默认事件的方法（例如：链接不会被打开），但是会发生冒泡行为
    preventDefault:(event:Event)=>{
        if(event.preventDefault){
            event.preventDefault();
        }else{
            window.event.returnValue = false;
        };
    },

    // 阻止事件冒泡，不让事件向上（document）蔓延，但默认事件依然会执行
    stopPropagation:(event:Event)=>{
        if(event.stopPropagation){
            event.stopPropagation();
        }else{
            window.event.cancelBubble = true;
        };
    }
};
export default event;