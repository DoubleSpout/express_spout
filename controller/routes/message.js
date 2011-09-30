var home = {},
	fdate = require('../../modules/stools').fdate,
	htmltostring = require('../../modules/stools').htmltostring,
	validate = require('../../modules/validate');

home.initial = function(){ //初始化
_pool.acquire(function(err, db_connector){
		db_connector.createCollection("msg", function(err, collection){
		   collection.ensureIndex({"plus":-1}, function(err, r){ //这里建立一个根据plus点数排序的索引
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
}();
home.getmsg = function(sorting, sname, condition, pagenum, callback){ //获取数据
	_pool.acquire(function(err, db_connector){
		db_connector.collection("msg", function(err, collection){
			var findc = sname === true? {} : (function(){
				var reg=new RegExp(sname,'i');
				return {"name":reg}})()
			if(sorting == 1){
				var sortc = {"sort":[['_id','desc']]};
				condition != true?findc._id = {"$lt":db_connector.bson_serializer.ObjectID.createFromHexString(condition)}:'';
				}
			else{
				var sortc = {"sort":[['plus','desc']]};
				condition != true?sortc.skip = parseInt(condition):'';
			}	
			sortc.limit = pagenum;//每次发送多少个
			var cursor = collection.find(findc,sortc);
			cursor.count(function(err, count){
				var total = count||0;//总数
				cursor.toArray(function(err, results){
					var msgarray = results||false;//获取全部的
					callback(err, msgarray, total);
					_pool.release(db_connector);
				});
		    });
			return true;
		});
 })	
}
home.index = function(req, res, pathobj){
	var sorting = req.param('sorting') || 1,
		sname = req.param('sname') || true;
	if(parseInt(sorting) != sorting ){sorting = 1};
	if(sname != true){sname = htmltostring(sname);}
	home.getmsg(sorting, sname, true, 20, function(err, msgarray, total){
		res.show(req, pathobj,{pagetitle:'snoopy-node.js-留言板', msg:msgarray, total:total});
	})
	return true;
}
home.more = function(req, res, pathobj){
	var sorting = req.param('sorting'),
		sname = htmltostring(req.param('sname')),
		condition = req.param('condition'),
		pagenum = req.param('pagenum');
	sname = sname == 'true' ? true:sname;
	if(parseInt(sorting) != sorting){res.end(JSON.stringify({"suc":0,"fail":"排序参数错误"}));return true;};
	if(sname == '' || typeof sname === 'undefined'){res.end(JSON.stringify({"suc":0,"fail":"作者名错误"}));return true;};
	if(sorting == 1 && condition.length != 24){
		    res.end(JSON.stringify({"suc":0,"fail":"condition参数错误1"}));return true;
	}
	if(sorting == 2 && parseInt(condition) != condition){
		     res.end(JSON.stringify({"suc":0,"fail":"condition参数错误2"}));return true;
	}
	if(parseInt(pagenum) != pagenum){res.end(JSON.stringify({"suc":0,"fail":"pagenum参数错误"}));return true;};
	home.getmsg(sorting, sname, condition, parseInt(pagenum), function(err, msgarray, total){
		if(err){
			res.end(JSON.stringify({"suc":0,"fail":"获取失败"}));
			_logger.error('getmore错误：'+err)
		}
		else res.end(JSON.stringify({"suc":1,"msg":msgarray, "total":total}));
	})
	return true;
}
home.send = function(req, res, pathobj){
	var name = req.param('name'),
		content = req.param('content');
	if(name.length>15){res.end(JSON.stringify({"suc":0,"fail":"用户名过长"}));return true;}
	if(content.length>30){res.end(JSON.stringify({"suc":0,"fail":"内容过长"}));return true;}
	var data = {
		name : htmltostring(name),
		content : htmltostring(content),
		time : fdate('y-m-d h:m:s'),
		plus:0,
	}
_pool.acquire(function(err, db_connector){
		db_connector.collection("msg", function(err, collection){
			collection.insert(data, function(err, r){
				if(err){
				   res.end(JSON.stringify({"suc":0, "fail":"提交失败"}));
				   _logger.error('提交留言失败：'+err)
				}
				else  res.end(JSON.stringify({"suc":1}));
				_pool.release(db_connector);
			});
		})	
})
	return true;
} 
home.del = function(req, res, pathobj){//执行删除操作
	var id = req.param('id');
	var pwd = req.param('pwd');
	if(pwd !== 'spout2009'){res.end(JSON.stringify({"suc":0,"fail":"对不起，您没有权限"}));return true;} //这里应该有后台，这里为了简便
	if(id.length !== 24){res.end(JSON.stringify({"suc":0,"fail":"id无效"}));return true;}
	//判断合法性id的合法性和用户是否有权力
_pool.acquire(function(err, db_connector){
		db_connector.collection("msg", function(err, collection){
			collection.remove({_id:db_connector.bson_serializer.ObjectID.createFromHexString(id)},{safe:true},function(err, r){
					if(err){
						_logger.error('删除失败，id为：'+id+'失败原因：'+err);
						res.end(JSON.stringify({"suc":0,"fail":"操作失败"}));
					}
					else res.end( JSON.stringify({"suc":1}));
					_pool.release(db_connector);
					return true;
			});
		});	
})
	return true;		
} 
home.plus = function(req, res, pathobj){ //执行+1操作
	var id = req.param('id').toString();
	if(id.length !== 24){res.end(JSON.stringify({"suc":0,"fail":"id无效"}));return true;}
	//判断合法性id的合法性和用户是否有权力
_pool.acquire(function(err, db_connector){
		db_connector.collection("msg", function(err, collection){
			collection.update({'_id':db_connector.bson_serializer.ObjectID.createFromHexString(id)}, {'$inc':{'plus':1}},{},function(err, count){
			if(!err) res.end(JSON.stringify({"suc":1}));
			else{
				_logger.error('id为:'+id+'文档，plus操作失败！错误为:'+err);
				res.end(JSON.stringify({"suc":0,"fail":"操作失败"}));
				}
			_pool.release(db_connector);
			return true;
			});
		});	
})
	return true;
} 
module.exports = home; 