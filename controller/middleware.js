//中间件加载配置
	_app.configure(function(){
		  _app.use(express.favicon(_app.set('views')+'/skin/favicon.ico'));
		 // _app.use(express.logger('dev'));
		// _app.use(log4js.connectLogger(logger, { level: 'error'}));
		  _app.use(express.bodyParser());
		  _app.use(express.methodOverride());
		  _app.use(express.cookieParser());
		  _app.use(express.session({ secret: 'spout' }));
		 // _app.use(require('./middleware/locals'));
		//  _app.use(messages());
		  _app.use(_app.router);
		  _app.use(express.static(_app.set('views')));
		  _app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
		  //...app.user(...)这里可以加一些其他的，也可以将上面一些没用的注释掉
	});

