var poolModule = require('generic-pool'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;

var pool = poolModule.Pool({
        name     : 'mongodb',
        create   : function(callback) {
					var dbserver =  new Server("10.1.80.2", 27017, {});
					var client = new Db('spout', dbserver, {});
				   client.open(function(err, db){
					   if(err)  _logger.error('数据库连接失败：'+err);
					   else callback(null, db);  //创建完了以后，要把client传给callback，这里第一个参数看了源码得知是err，我们不必理会
				   })
        },
        destroy  : function(db) { db.close(); }, //当超时则释放连接
        max      : 100,   //最大连接数
        idleTimeoutMillis : 1000*30,  //超时时间
        log : false,  
    });
module.exports = pool