/*
	利用multi-node的framestream增加一个send方法，用来进行进程间的通信
	send方法第一个参数是发送的数据，第二个参数是回调
	例如可以在框架内任何地方调用：
			_comm.send('add_visit_num', function(data, pid){
				_visite_num++
				 _logger.info(pid+' 进程访问数为：'+_visite_num);	 
			});
	用来发送给其他进程信息和执行回调函数
*/
var comm = {
	i:0,
};
comm.send =function(data, callback){
	var default_func = function(){},
	    callback = callback || default_func,
	    d={
		func:callback.toString(),
		data:data,
	};
	for(var j=0;j<comm.i;j++){
		comm['stream'+j].send(d);
	}
	_logger.info(comm.multi_node.id +' has send num: '+ comm.i)
};
comm.addlisten = function(multi_node){
					comm.multi_node = multi_node;
					comm.multi_node.addListener("node", function(stream){
						var stream = require("multi-node").frameStream(stream);
						comm['stream'+comm.i] = stream;
						comm['stream'+comm.i].addListener("message", function(data){
								eval("var callback="+data.func+"(data.data, comm.multi_node.id)");	//执行回调		
								_logger.info(comm.multi_node.id+' callback success')
						});
						comm.i++;
					});	
					return comm;
				}
module.exports = comm;

	
