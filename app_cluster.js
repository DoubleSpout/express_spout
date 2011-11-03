/*
	各类数据库连接模块在"node_modules"内，说明文档在对应的文件内
*/
express = require('express'); 
_app = module.exports = express.createServer();
require('./controller/config.js');// 设置
require('./controller/middleware.js');// 中间件
require('./controller/routes.js');//路由

_logger = require('./modules/log4js');//日志模块加载进来
if (!module.parent) {  //如果没有被require调用，则监听端口，否则作为一个组件被其他网站调用
	var cluster = require('cluster')
	_cluster = cluster(_app).set('working directory', '/').set('workers', 4).use(cluster.reload()).listen(_app.set('port'));
	_logger.info('Express started on port'+_app.set('port'));
};
_jade_render = require('./modules/jade_render.js');//会根据文件缓存是否开启来进行显示页面
//这里的全局变量名不要用

/*关于日志说明
日志的的等级分为：
_logger.trace('Entering cheese testing');
_logger.debug('Got cheese.');
_logger.info('Cheese is Gouda.');  
_logger.warn('Cheese is quite smelly.');
_logger.error('Cheese is too ripe!');
_logger.fatal('Cheese was breeding ground for listeria.');
如果要记录客户端信息，请在上下环境传递req参数
*/
process.on('exit', function () {
    _logger.fatal('express_spout is exiting!');
});
