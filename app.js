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
	var multi_node = require("multi-node").listen({  //利用multi-node来启动服务
			port: _app.set('port'), 
			nodes: 1
		}, _app);
	_logger.info('Express started on port'+_app.set('port'));
};
_comm = require('./modules/comm.js').addlisten(multi_node); //返回_comm对象，用来send给其他进程信息，单服务器多个node进程之间使用
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
