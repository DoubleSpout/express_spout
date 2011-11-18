/*
自动路由功能说明：
	当用户输入：http://10.1.10.224:3000/user/face 这个域名进行访问时，
	将域名拆为4部分
	A:host_name:  http://10.1.10.224:3000/
	B:path_name(controller_name): user/  
	C:path_modules: user
	D:file_name(function_name): face

	程序分3步走：
	1、会先去require加载"./routes/user"，执行里面的 face 方法，并将req和res两个参数传递进去，如果是3级菜单，以此类推
	2、如果1失败，则会自动去 view/jade/user/face.jade 去输出页面(这里假设没开启file_cache)
	3、如果2失败，则会输出404页面，记录错误日志(404页面在view目录下，404.jade)
	注意：在第一步加载模块并执行对应方法后，最后需要return true用来阻塞第2、3步，否则会执行2、3步出错。
	模块和方法代码类似如下：
		//  routes/user.js
		var user = {}
		user.face = function(req, res){
			  //do something
			  res.render('user/face', {layout:'face',pageTitle:'修改头像'}); 
			  return true;  //这里要return true.
		}
		module.exports = user; 

	如果想通过第2步自动输出静态页面（无变量），则将上面代码改写为：
		//  routes/user.js
		var user = {}
		user.face = function(req, res){
			  //do something
			  return false;  //这里要return false.
		}
		module.exports = user; 	
		
*/

/*
	url拆分函数
	例如用户访问：http://10.1.10.224:3000/user/face
	则会拆分后返回：
	{"path":"user/", "file":"face", "mpath":"user"}
	"user/"为path_name
	"face"为file_name(function_name)
	"user"为path_modules(controller_name), 下面会执行 require("./routes/user") 去加载modules
	支持任意多级
*/
var analyze_url = function(req){
	var href = require('url').parse(req.url).pathname;
	if(href.lastIndexOf('/') === href.length-1){
			href =  href.slice(0, href.length-1); //如果末尾是'/',则去掉这个'/'
	}
	var	href_array = href.split('/'),
		path='',
		href = '',
		index = 'index';
	for(var i=1, num=href_array.length-1;i<num;i++){
		path += href_array[i] + '/';	
	}
	path = path?path:(index+'/');
	href = href_array[num]?href_array[num]:index;
	if(path == index+'/'&& href != index){ //避免只有一级目录时出错
		path = href+'/';
		href = index;
	}
	var patrn=/^(skin\/|temp\/|source\/)/;
		if(patrn.test(path)){
			return {"path":path, "file":href, "isstatic":'static'}; 
		}
	var mpath =  path.slice(0, path.length-1); //生成path_modules
	return {"path":path, "file":href, "mpath":mpath}; 
}

/*
	路由总controller，这里也可以再将app分出去，
	如果想要快速响应单独的可以在_app.all前面加入模块，根据情况用next()转发。
*/

//...其他路由设置
	 _app.all(/\S/, function(req, res, next){  //根据访问的路径加载不同的模块，主入口,不必修改
		var  pathobj = analyze_url(req),//拆分url
			 path = require('path'),
			 viewpath = _app.set('views'),
			 solve = false;
		res.show = _jade_render.show; //给res添加jade模版输出方法
		res.showhtml = _jade_render.showhtml;//给res添加html模版输出方法
		req.ip = req.socket && (req.socket.remoteAddress || (req.socket.socket && req.socket.socket.remoteAddress)); //用户IP
		req.method = req.method; //请求方法
		req.referer = req.headers['referer'] || req.headers['referrer'] || ''; //来源
		req.useragent = req.headers['user-agent'] || '';//客户端信息
		if(pathobj.isstatic === 'static') { //如果用户访问的是静态文件
			var static_p = viewpath+'/'+pathobj.path+pathobj.file;
			path.exists(static_p, function (exists) {
				if(!exists){
					_logger.warn(req.ip+' -- not find static file: '+static_p);
					res.end('not find static file');
					return false;
				}
				else next(); //如果是访问skin或是temp的，则当成静态文件处理，转发请求下去
				return false;
			});
			return false;
		}
		try{ //测试证明这里的try不会影响性能
			solve = require('./routes/'+pathobj.mpath+'.js')[pathobj.file](req, res, pathobj); //加载模块并执行方法，将参数传递过去
		}
		catch(err){ //如果没有找到controller，写日志
			_logger.warn(req.ip+' -- not find controller'+' ./routes/'+pathobj.mpath+' 方法:'+pathobj.file);
		 }
		 if(!solve){ //如果找不到控制器，或者控制器步输出
				var jadepath = viewpath +'/jade/'+pathobj.path+pathobj.file+'.jade'; //待查找的jade模版地址
				path.exists(jadepath, function(exists){  //查找的jade模版是否存在
						if(exists) res.show(req, pathobj); //如果存在，则直接输出
						else { //如果不存在，转到404
							 _logger.warn(req.ip+' -- 404error');//如果没有找到controller，打印错误
							 res.show(req, {'path':'', 'file':'404'}, {title:'404'}, false);
						}	
			    })
		 }
	 })

