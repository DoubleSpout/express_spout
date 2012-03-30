
## warn:本项目已经不在维护，转至 www.rrestjs.com, rrestjs —— HIgh performance node.js ROA  RESTFUL  web framework

	本例访问地址：http://spout.cnodejs.net/
	虽然node.js作为数据中间件被一些企业应用，但是node.js建立中小型网站想必是大家最想做的事情。
	目前node.js框架最出名的也就是expressjs了，这两天我对expressjs做了一个简单的二次开发，增加了一些功能：
	1、加强路由功能
	2、加强日志功能
	3、增加multi-node多进程，并且根据他提供的API写了进程间通信的模块
	4、增加常用系统模块：如：连接池模块、formidable上传系统模块等
	5、增加了一些常用的数据库模块，比如mysql,redis,mongodb等
	6、加强了jade的缓存功能，提供页面缓存提高性能，可以根据需要对部分页面缓存或不缓存。


	先不多说，上性能测试：
	测试环境同之前的博客

	 com	 1000/30	 1000/30	1000/30 	3000/30 	3000/30 	3000/30 
	 type	 裸奔	 输出html	输出jade 	 裸奔	 输出html	 输出jade
	 rps	 3875	 2041	 1046	 3795	 1889	 907
	 tpq	 0.26	 0.49	 0.93	 0.26	 0.53	 0.98
	 80%req	 172	 975	1028	 347	 2458	 4131
	 fail	 0	 0	 0	 0	 0	 0
	   
	说明：
	裸奔:直接res.end('hello world');
	输出html:输出一篇无样式无脚本的简单的网易新闻，大约4kb(经过jade文件缓存的);
	输出jade:不文件缓存，直接输出jade，内容同上，会传递正文内容，标题等信息进行编译(jade自带 memory caching);
	3000/30:代表命令./ab -c 3000 -t 30 http://10.1.10.150:8888/ 
	rps:代表每秒处理请求数，并发的主要指标 
	tpq:每个请求处理的时间，单位毫秒。 
	fail:代表平均处理失败请求个数 
	80%req:代表80%的请求在多少毫秒内返回。

	jade的效率还是挺高的，在1000并发的时候还能有1000+的rps，大多数情况下我们都不能缓存页面，所以这个数据可以供参考是否压力过大而需要添置服务器。

	下面简单介绍下文件分布：
	controller：控制器
	logs：日志文件夹
	modules：自定义模块
	node_modules：系统模块，系统插件
	view：模版,CSS,JS等前端用的
	app.js：启动服务文件

	简单介绍下各个功能：
	1、加强路由功能
	增加重新拼接URL去找控制器功能，如果控制器没找到，会尝试着输出对应url的jade模版，否则输出404。
	举个例子：
	例如用户输入：http://10.1.10.224:3000/user/face
	1、会先去require加载"./routes/user"，执行里面的 face 方法，并将req和res两个参数传递进去，如果是3级菜单，以此类推；
	2、如果1失败，则会自动去 view/jade/user/face.jade 去输出页面(这里假设没开启file_cache)；
	3、如果2失败，则会输出404页面，记录错误日志(404页面在view目录下，404.jade)。

	2、加强日志功能
	加载了系统模块log4js.js，然后做了简单的封装。
	日志的的等级分为：
	_logger.trace('Entering cheese testing');
	_logger.debug('Got cheese.');
	_logger.info('Cheese is Gouda.');  
	_logger.warn('Cheese is quite smelly.');
	_logger.error('Cheese is too ripe!');
	_logger.fatal('Cheese was breeding ground for listeria.');
	可以根据需要设置日志记录和显示的等级。
	比如设置了error等级，则只有error和fatal的日志会被记录到日志文件中去。日志文件也可以配置，每个日志文件的大小和备份数量。

	3、增加multi-node多进程
	利用multi-node模块多进程启动多个，然后封装了一个comm自定义模块。
	利用_comm.send(data [, callback]);回调里面可以做一些事情，比如同步更新一些数据等。
	举个例子：
	_comm.send('add_visit_num', function(d, pid){
	    _visite_num++
	    _logger.info('发送数据为：'+d+'当前执行进程为：'+pid+'访问数为：'+_visite_num);
	   });
	这样就发送了一条‘add_visit_num’的信息，并且在其他进程接收到这个信息后，执行了callback，pid是当前接收信息的进程id，格式为：master、child-0、child-1、child-2 ……以此类推。

	4、5：增加系统模块
	增加了系统模块，具体使用说明系统模块内都有

	6、加强了jade的缓存功能
	jade的官方说明上有：optional memory caching，类似smarty的内存缓存机制。
	不过内存缓存毕竟还是要重新拼接一些变量和对jade的模版的编译，不如直接输出html来的快。
	可以在controller/config.js里设置全局的页面缓存开启或关闭还有缓存更新时间
	也可以在每次输出的时候带上参数true或者false来进行单独设置。单独设置会覆盖全局设置。
	注意：如果要开启页面缓存，可能需要做以下几步：
	1、node_modules\jade\bin\jade  权限设置为777
	2、view\temp  权限设置为777
	3、将 “node安装目录/bin/node” 用 ln 命令连接到 ‘/sbin/' 或 ‘/bin/’ 或 ‘/etc/init.d/’ 下，保证可以直接输入 node -h 不报错。
	ln 命令用法：软连接
	ln  –s(-n)  源文件 目标文件