var	events =  require("events");
module.exports =  AsyncProxy = function(ischain){
	this.emitter = new events.EventEmitter();
	this.eventname = 'AsyncProxy';
	this.data = [];
	this.ischain = ischain||false; //是否链式调用,默认是false
}
AsyncProxy.prototype.addlistener = function(){ //建立事件监听函数
	var ap = this;
	ap.emitter.on(ap.eventname,function(order, data){
		ap.prev = ap.data[order] = data;
		if(--ap.length===0){
			ap.callback(ap.data);
			ap.emitter.removeAllListeners(ap.eventname);
		}
	})
}	
AsyncProxy.prototype.rec = function(order, data){ //当异步返回入口
	this.emitter.emit(this.eventname, order, data); 
	if(this.ischain && ++order<this.asyncs.length){	this.asyncs[order](order);}
	return {total:this.asyncs.length, rec:this.asyncs.length - this.length}
}	
AsyncProxy.prototype.ap = function(){ //主入口
	var ap = this, i=0, len = arguments.length - 1;
		ap.asyncs = [].slice.apply(arguments, [0, len]); //将参数eventname1-n转存成events 数组
   		ap.callback = arguments[len];
		ap.addlistener();
		if((ap.length=ap.asyncs.length)&&!ap.ischain){ //如果非链式调用
			while(i++ < ap.asyncs.length){ ap.asyncs[i-1](i-1);}
		}
		else ap.asyncs[0](0);
		return ap.asyncs.length;
}