var path = require('path');
_pool = require('../modules/mongodb_con.js');
	_app.set('port',3000);//监听端口
	_app.set('basepath',path.join(__dirname,'..'));//框架跟目录
	_app.set('views', _app.set('basepath')+'/view');//默认页面输出路径，也是网站web站点根目录
	_app.set('view engine', 'jade');//使用jade模版，不建议修改
	_app.set('file_cache', false); //是否启用文件进行缓存，jade自带内存缓存，如果全站更新步频繁且并发量大，可以开启。
	_app.set('file_cache_time', 1000*60*30); //缓存文件更新时间 小于 0 为永久缓存
	_app.set('logconfig',{"filepath":_app.set('basepath')+'/mylogs/console.log',"maxsize":1024*1024*50,"backupnum":5,'loglevel':'info'})//日志的配置
