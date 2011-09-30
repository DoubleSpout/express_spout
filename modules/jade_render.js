var fs = require('fs'),
    path = require('path'),
	child_process = require('child_process'),
	cachetime = _app.set('file_cache_time'),
	basepath = _app.set('basepath'),
	viewpath = _app.set('views'),
	show={};//输出对象
var showhtml = function(url, req, res){ //直接输出html页面不通过jade模版
	var that = res; 
	if(!that) that = this; //如果不传参，默认this调用
	var tempurl = viewpath+url;
	fs.readFile(tempurl, 'utf8', function(error, text){
		if (error !== null) {
		  _logger.error(req.ip + '-- html show error: ' + error);
		}
		else that.end(text);
	});
}
show.showhtml = showhtml;
show.show = function(req, pathobj, param, iscache){ //显示页面
		var that = this;
		var iscache = iscache; //如果用户传iscache过来，则使用局部设定值
		if(typeof iscache === 'undefined'){
			iscache = _app.set('file_cache') || false; //如果用户没有传iscache过来，则使用全局设定值
		}
		var option = param || {};
		option.layout = pathobj.file;
		if(!iscache){
			 that.render('jade/'+pathobj.path+pathobj.file+'.jade', option); //如果没有开启页面缓存，输出jade
			 return false;
		}
		else{//如果开启页面缓存
				var pathname = function(pathobj){ //拼接缓存文件名
						var s = pathobj.path+pathobj.file;
							s = s.replace(/(\/)/g, '');
							return 'jcache_'+s+'.html';
				}(pathobj);
				var temppath = '/temp/'+pathname;
					if(path.existsSync((viewpath+temppath))){ //如果已经存在缓存文件，直接输出html缓存文件
						_logger.info(req.ip + ' -- cache success')
						showhtml(temppath, req, that);
					}
					else{ //如果缓存文件不存在
						delete option.layout; //为了防止错误
						var json_str = '\'{'
						for(var j in option){
							json_str += j+':"'+option[j]+'",'
						}
						json_str += '}\'';//拼接JSON字符串，这里不用自带的 JSON.stringify(jsonobj)
						var comm = basepath+'/node_modules/jade/bin/jade < '+viewpath+'/jade/'+pathobj.path+pathobj.file+'.jade'+' -o '+json_str+' > '+viewpath+'/temp/'+pathname;
						_logger.info('commod:   '+comm)
						child_process.exec(comm, function (error, stdout, stderr){//执行 bin/jade 生成html文件
							if (error !== null) {
							  _logger.error(req.ip +'--jade create html error: ' + error);
							}
							else {
								_logger.info(req.ip + ' -- cache create success')
								showhtml(temppath, req, that); //输出html
								}
						})		  
					}
		}
}
show.clear = function(){ //提供一个方法来删除缓存文件，_jade_render.clear() 可以立即清除缓存
	var comm = 'rm -rf '+viewpath+'/temp/*.html'; //删除缓存命令
	child_process.exec(comm, function (error, stdout, stderr){
			if (error !== null) {
			  _logger.error('clear cache error: ' + error);
			}
			else _logger.info('clear success '+new Date())
	})
}
var loop =function(time){ //根据设置时间，间隔这个时间删除缓存文件
   if(cachetime>0&&_app.set('file_cache')){
			setInterval(function(){
				show.clear();
			}, time)
   }

}(cachetime)
module.exports = show;

