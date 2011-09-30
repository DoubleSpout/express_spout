var home = {},
	fdate = require('../../modules/stools').fdate,
	htmltostring = require('../../modules/stools').htmltostring;
/*聊天变量*/
var  a_m=[],   //存放聊天记录
	 p_m=[],//存放私人聊天记录
	 callbacks=[],//存放没有新消息时的回调函数
	 userlist={},//在线用户
	 msgmax= 400,//缓存聊天信息存放的条数
	 usermax = 1000*60*3;//用户存活时间
/*聊天变量*/
/*头像上传变量*/
var http = require('http'),
    util = require('util'),
    formidable = require('formidable'),
	path = require('path'),
    fs = require('fs'),
	files_obj={}, //临时存放上传文件信息
	clineturl = 'source/face',
	filedir =  path.join(_app.set('views'), clineturl),
	maxFieldsSize = 1024 * 100;
/*头像上传变量*/
home.checkonline = function(req, res){
	if(!req.session.uid || !userlist[req.session.uid]){
		req.session.destroy();
		home.fail(res, '未登录');
		return false;
	}
	return true;
}
home.clearmax = function(){ //判断是否已经超过最长长度
	 var now = (new Date()).getTime();
	 _logger.info('截断前a_m数量：'+a_m.length+' 截断前p_m数量：'+p_m.length)
	 if (a_m.length > msgmax) a_m.splice(a_m.length - msgmax, a_m.length);
	 if (p_m.length > msgmax) p_m.splice(p_m.length - msgmax, p_m.length);
	 _logger.info('截断后a_m数量：'+a_m.length+' 截断后p_m数量：'+p_m.length)
	 for(var j in userlist){
		if(now - userlist[j].timestamp > usermax){
			_logger.info('删除长时间不动用户为：'+userlist[j].username)
			delete userlist[j];
		}
	 }
};
home.initial = function(){ //初始化
	_pool.acquire(function(err, db_connector){
		    db_connector.createCollection("chatmessage", function(err, col){});
			db_connector.createCollection("chatuser", function(err, collection){
			   collection.ensureIndex({"username":1}, function(err, r){ //这里建立一个根据username的索引
				   if(err) _logger.error('索引建立失败：'+err);
				   else{ 
						   _logger.info('索引建立名为：'+r);
						   collection.indexInformation(function(err,array){
								   if(!err) _logger.info('当前msg集合所有索引为：'+JSON.stringify(array))
								   _pool.release(db_connector);
						   });
					   }
				});			
			});
	})
	setInterval(function () {
		var now = (new Date()).getTime();
		home.clearmax();
		while (callbacks.length > 0 && now - callbacks[0].timestamp > 1000*30) {
			callbacks.shift().callback_func([]);//相应长连接
		}
	}, 1000*60);
}();
home.userrenew = function(uid){//更新用户时间戳
	var uid = uid.toString(),
		now = (new Date()).getTime();
	if(!userlist[uid]){
		_logger.error('更新时间戳失败，用户ID为：'+uid)
		return false;
	}
	userlist[uid].timestamp = now;
	_pool.acquire(function(err, db_connector){
		db_connector.collection("chatuser", function(err, collection){
			collection.update({"_id":db_connector.bson_serializer.ObjectID.createFromHexString(uid)},{$set: {"timestamp":now}},{"safe":true},function(err, r){
				_logger.info('更新时间戳，id：'+uid+'个数：'+r)
				_pool.release(db_connector);
			});
		});
	})
}
home.logout = function(req, res){//更新用户时间戳
	var sid = req.session.uid;
	if(sid)	req.session.destroy();
	if(userlist[sid]) delete userlist[sid];
	res.redirect('/chating/login/');
	return true;	
}
home.index = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-聊天室'});
	return true;
}
home.login = function(req, res, pathobj){ //登录页面
	if(req.session.uid){
			res.redirect('/chating/chating/');
			return true;
	}
	var err = req.param('err') || '',
	    random_count = (new Date()).getTime()+''+Math.ceil(Math.random()*100000);
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-聊天室登录',random:random_count,err:err});
	return true;
}
home.getmemlist = function(){ //获取用户列表，这里是缓存
		var list = [];
		for (var i in userlist){
			list.push({'id':userlist[i].id, 'name':userlist[i].username, 'face':userlist[i].face});	
		}
		return list;
	};
home.chating = function(req, res, pathobj){
	if(req.method === 'GET' && !req.session.uid){
		res.redirect('/chating/login/');
		return true;
	}
	var username = req.param('name'),
		pwd = req.param('pwd'),
		face = req.param('face');
	if(username.length >15 || pwd.length>15){
		res.redirect('/chating/login/?err=用户名或密码长度错误');
		return true;
	}
	if(username != htmltostring(username)){
		res.redirect('/chating/login/?err=用户名格式错误');
		return true;
	}
	var showchating = function(uid, uface){ //跳转页面		
		userlist[uid] = {"username":username, "face":uface, "id":uid, "timestamp":(new Date()).getTime()};
		req.session.cookie.expires = false;//设置session过期时间
		req.session.uid = uid;
		res.show(req, pathobj,{pagetitle:'snoopy-node.js-聊天室', sid:uid, since:(new Date()).getTime()});
		return true;
	}
	_pool.acquire(function(err, db_connector){
		db_connector.collection("chatuser", function(err, collection){
			collection.find({'username':htmltostring(username)}).toArray(function(err, results){
					var msgarray = results||false;//获取全部的
					if(msgarray.length >0){//去匹配密码
						msgarray[0].password === pwd?showchating(msgarray[0]._id, msgarray[0].face):res.redirect('/chating/login/?err=密码错误');
						_pool.release(db_connector);
						return true;
					}
					else{//去插入数据
						collection.insert({"username":username, "password":pwd, "face":face}, {"safe":true}, function(err, results){//插入数据
							showchating(results[0]._id, face);
							_pool.release(db_connector);
							return true;
						})
					}
					return true;
			});
		});
	});
	return true;
}
home.fail = function(res, text){
	res.end(JSON.stringify({"suc":0,"fail":text}));
	return true;
}
home.callback = function(chat_obj_array){
	var new_chat_array = [],
		clone_chat_array = [],
		callback_obj,
		ci;
	while (callbacks.length > 0){ //筛选是否有callbacks数组里的sid需要的聊天信息
		  callback_obj = callbacks.shift();
		  clone_chat_array = chat_obj_array.concat();  
		  for(var i=0; i<clone_chat_array.length; i++){
			ci =  clone_chat_array[i];
			if(ci.towho === 'all') continue;
			else if(callback_obj.sid === ci.sid ||  callback_obj.sid == ci.towho) continue;
			else clone_chat_array.splice(i, 1, 0);
		  }
		  for(var j=0; j<clone_chat_array.length; j++){
			if(clone_chat_array[j] !== 0){
				new_chat_array.push(clone_chat_array[j])
			}
		  }
		  if(new_chat_array.length>0){
			 callback_obj.callback_func(new_chat_array);
		  }
	      new_chat_array.length = 0;
		  clone_chat_array.length = 0;
	}
}
home.addmsg = function(param, callback){//将聊天信息存入mongodb
	var param = param;
	_pool.acquire(function(err, db_connector){
		db_connector.collection("chatuser", function(err, collection){
			var uid = param.sid.toString();
			collection.findOne({'_id':db_connector.bson_serializer.ObjectID.createFromHexString(uid)},function(err, r){
					param.uname = r.username;
					db_connector.collection("chatmessage", function(err, col){				
					col.insert(param, {"safe":true}, function(err,r){
						_pool.release(db_connector);
						param.id = r[0]._id;
						if(param.towho === 'all') a_m.push(param);//如果是广播，则往广播数组里插入数据	
						else p_m.push(param); //如果是私聊，往私聊数组插入数据
						home.callback([param]);
						callback();
					})
				})
			})
		})
	})
}
home.send = function(req, res, pathobj){//发送聊天信息
	var  towho = htmltostring(req.param('to')),
		 msg = htmltostring(req.param('msg')),
		 sid = req.session.uid;
	/*判断格式*/
	if(!home.checkonline(req, res)) return true;
	if(!towho ||  msg.length>40 || !req.session.uid){
		home.fail(res, 'send参数错误');
		return true;
	}
	home.userrenew(sid);
	var	param = {"sid":sid, "msg":msg, "towho":towho, "timestamp":(new Date()).getTime()};
	var callback = function(){
			res.end(JSON.stringify({"suc":1}));
			return true;
		}
	home.addmsg(param, callback);
	return true;
}
home.dealreceive =function(sid, since, isfirst, callback){
	var new_msg_array = [],
		chat_obj;
	for (var i = 0; i < a_m.length; i++) { //扫描公共信息
		  chat_obj = a_m[i];
		  if (chat_obj.timestamp > since){
			new_msg_array.push(chat_obj);
		  }
	};
	for (var i = 0; i < p_m.length; i++) { //扫描私聊信息
		  chat_obj = p_m[i];
		  if (chat_obj.timestamp > since && sid == chat_obj.towho){
			new_msg_array.push(chat_obj);
		  }
	};
	 if(new_msg_array.length > 0){
			home.callback(new_msg_array)
		}
	 else if(isfirst == 'true'){
		callback([]);
	 }
	 else {
		 callbacks.push({timestamp: (new Date()).getTime(), callback_func: callback, sid:sid});
		 }
	 return true;
}
home.receive = function(req, res, pathobj){//接收聊天信息
	var since = req.param('since'),
		isfirst = req.param('isfirst'),
		sid = req.session.uid;
	if(!home.checkonline(req, res)) return true;
	if( parseInt(since) != since || !sid){
		home.fail(res, 'receive参数错误');
		return true;
	}
	home.dealreceive(sid, since, isfirst, function(msg_array){
		var rec_r = {
				"suc":1,
				"msg" : msg_array,
				"memlist" :home.getmemlist(),//获取在线用户
			}
		res.end(JSON.stringify(rec_r));
		return true;
	})
	return true;
}
/*上传头像*/
home.rescallback = function(func_name, param){ //JS回调函数生成
	return '<script>top.'+func_name+'('+param+');</script>';
}
home.upload = function(req, res, pathobj){//上传头像
	var ran = req.param('random'),
	    func = req.param('func');
	if(parseInt(ran) != ran || htmltostring(func) != func){
		home.fail(res, '上传参数错误');
		return true;
	}
	//验证接收参数
	var form = new formidable.IncomingForm(),
		go_progress,
		ending = false,
		count = 0;
	form.uploadDir = filedir;//设定上传目录
	perfileobj = files_obj[ran] = {};
	 form.on('progress', function(bytesReceived, bytesExpected ,ending){
		 	count++;
			if(count%200 === 0){
					perfileobj.br = bytesReceived;
					perfileobj.be = bytesExpected;
			}
		console.log(files_obj)
		}).on('file', function(field, file) {
			var p = file.path.split('/'),
				num = p.length-1;
				perfileobj.size = file.size;
				perfileobj.truepath = file.path;
				perfileobj.path = '/'+clineturl+'/'+p[num];
				perfileobj.type = file.type.split('/')[0]
      }).on('end', function() {
        _logger.info('上传完成，地址为:'+perfileobj.truepath)
		perfileobj.ending = true;
		if(form.bytesExpected>maxFieldsSize || perfileobj.type !== 'image' ){
					fs.unlink(perfileobj.truepath, function(err){
						if(err) _logger.error('删除不符合要求图片失败：'+err+' 图片地址为：'+perfileobj.truepath);
						else _logger.info('成功删除:'+perfileobj.truepath);
					});
					res.send(home.rescallback(func, '"","","error"'));
			}
		else res.end(home.rescallback(func, '"'+perfileobj.size+'","'+perfileobj.path+'"'));
		return true;
      }).on('error',function(err){
			_logger.error('上传过程中出错：'+err);
			delete files_obj[ran];
	  });
    form.parse(req);
	perfileobj.timestamp = (new Date()).getTime();
	return true;
};
home.progress = function(req, res, pathobj){
	var ran = req.param('ran');
	if(!files_obj[ran]){
		home.fail(res, '捕获上传进度出错');
		return true;
	}
	if(files_obj[ran].ending){
		res.end(JSON.stringify({"suc":1,"ending":"ending"}));
		delete files_obj[ran];
	}
	else res.end(JSON.stringify(files_obj[ran])); //将改文件最新上传信息给前台
	return true;
}
/*上传头像*/
module.exports = home; 