 /*
	配置log4js日志文件
*/
var config = _app.set('logconfig')
var log4js = require('log4js');
log4js.addAppender(log4js.fileAppender(config.filepath, false, config.maxsize, config.backupnum), 'console');
var logger = log4js.getLogger('console');
logger.setLevel(config.loglevel);
module.exports = logger;