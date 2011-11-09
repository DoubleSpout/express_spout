var home = {},
	fs = require('fs'),
	ca = require('../../modules/captcha.js'),
	c_a_ary = require('../../modules/captcha_array.js');
home.index = function(req, res, pathobj){
	var picid = req.param('picid') || false;
	if(!picid || picid.length != 17) res.end('');
	else if (picid = ca.decode(picid)){

		var url = c_a_ary[picid-1].url+picid+'.png'
		fs.readFile(url, 'binary', function(error, file){
			if (error !== null) {
			  _logger.error('验证码图片显示error: ' + error);
			  res.end('')
			}
			else {
				res.writeHead(200, {'Content-Type': 'img/png'});
			    res.write(file, "binary");
				res.end();
			}
		});	
	}
	else res.end('')
	return true;
}
module.exports = home;