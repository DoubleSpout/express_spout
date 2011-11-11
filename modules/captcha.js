var c_a  = require('./captcha_array.js'),
	captcha={
		lenth : c_a.length, //验证码题目数组长度
		canum : 4, //每次出几个题目，这个值不能大于上面的
		//cutpo : 5, //生成字符串截断位置，加密用
		dbcolname:'piccaptcha'
	};
captcha.generate = function(id){
	var ts = (new Date()).getTime()+'';
	if(parseInt(id, 10)<10){
		var id = '0'+id;
	}
	var head = 10 + Math.ceil(Math.random()*89),
		cutpo = head.toString().slice(-1);
	var	front = ts.slice(0, cutpo),
		back = ts.slice(cutpo);
		res = head+front+id+back;
		return res;
}
captcha.decode = function(str){
	var head  = str.slice(1,2),
		str = str.slice(2),
		tsfront = str.slice(0, parseInt(head, 10)),
		id = str.slice(parseInt(head, 10), parseInt(head, 10)+2),
		intid = parseInt(id, 10),
		tsback = str.slice(parseInt(head)+2),
		ts = tsfront + tsback,
		now = (new Date()).getTime();
	if(now -ts > 1000*15) return false;
	if(intid != id) return false;
	return intid;	
}
captcha.creat = function(cb){ //用户打开页面创建验证码
	var ca = [];
	for(var j=0;j<c_a.length;j++){ //这里需要深度复制数组，因为数组内的每项都是对象
		ca[j]={}
		for(var i in c_a[j]){
			ca[j][i] = c_a[j][i]
		}
	}
	var u_obj = this.getrandmon(ca, this.canum); //返回给用户做题目的数组
	captcha.mongodbcreat(u_obj, cb);
}
captcha.mongodbcreat = function(u_obj, cb){
	var ary = u_obj.ca_ary,
		po =  u_obj.po;
	_pool.acquire(function(err, db_connector){
		db_connector.collection(captcha.dbcolname, function(err, collection){
			 if (err){ 
				_logger.err('创建验证码失败，连接集合失败'+err);
				cb(false);
				_pool.release(db_connector);
				return true;
			 }
			 ary[po].timestamp = (new Date()).getTime();
			 ary[po].po = po;
			 collection.insert(ary[po], {safe:true}, function(err, doc){	
					 _pool.release(db_connector);
					 if (err){ 
						_logger.err('创建验证码失败，插入数据库失败'+err);
						cb(false);
					 }
					else{
						var name = ary[po].value;
						delete ary[po].po;
						delete ary[po].timestamp;
						
						for(var j=0;j<ary.length;j++){ //去掉name值
							ary[j].url = '/piccaptcha?picid='+captcha.generate(ary[j].id);
							delete ary[j].value;
							delete ary[j].id;

						}
						cb({id:doc[0]._id, value:name, caary:ary});//返回给控制器回调函数的对象
					}					
			})
		})
	})	
}
captcha.contrast = function(id, po, cb){ //判断验证码
	_pool.acquire(function(err, db_connector){
		db_connector.collection(captcha.dbcolname, function(err, collection){
			collection.findOne({'_id':db_connector.bson_serializer.ObjectID.createFromHexString(id)},function(err, r){
				var res = false;
				if(err) _logger.err('对比验证码失败：'+err);
				else if(r.po == po) res=true;	//如果对比成功，返回true，否则为false
				_pool.release(db_connector);
				captcha.destory('', id)
				cb(res);
			})
		})	
	})
}
captcha.destory = function(timestamp, id){ //删除验证码
	var delc = {"timestamp":{"$lt":timestamp}}
	if(typeof id == 'undefined'){
		delc = {"_id":db_connector.bson_serializer.ObjectID.createFromHexString(id)}
	}
 _pool.acquire(function(err, db_connector){
	 db_connector.collection(captcha.dbcolname, function(err, collection){
		 collection.remove(delc, function(err, num){
			if(err) _logger.err('摧毁验证码失败：'+err);
			else _logger.info('摧毁验证码成功：'+num);
			_pool.release(db_connector);
		 })
	 })	
  })
}
captcha.getrandmon = function(ary, num){ //随机从数组中抽取num项记录作为验证码题目
	var se_ary = ary,
		ca_ary = [];
	for(var i=0; i<num; i++){
		var n = Math.floor(Math.random()*se_ary.length);
		ca_ary.push(se_ary.splice(n,1)[0])
	}
	var po = Math.floor(Math.random()*ca_ary.length);	
	return {"po":po, "ca_ary":ca_ary};
}
captcha.intial = function(){ //初始化，异步脚本删除验证码
	_pool.acquire(function(err, db_connector){ //建立集合
		db_connector.createCollection(captcha.dbcolname, function(err, col){
			   if(err) _logger.error(err)
			   else _logger.info('创建piccaptcha集合成功:'+col.collectionName);
			   _pool.release(db_connector);
		})
	})
	setInterval(function () {
	  var now = (new Date()).getTime()-1000*60*30;
	  captcha.destory(now);
	}, 1000*60*30);

}()
module.exports = captcha;