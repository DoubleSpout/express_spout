var home = {}
home.index = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-作品秀'});
	return true;
}
home.plus = function(req, res, pathobj){
	res.showhtml('/jade/gallery/plus.html', req, res);//输出静态文件
	return true;
}
home.asyncproxy = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-AsyncProxy详解'});
	return true;
}
home.jaderender = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-jade_render详解'});
	return true;
}
home.comm = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-comm.js详解'});
	return true;
}
home.delayload = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-delayload.js详解'});
	return true;
}
home.waterfall = function(req, res, pathobj){
	res.showhtml('/jade/gallery/waterfall.html', req, res);//输出静态文件
	return true;
}
home.picshow = function(req, res, pathobj){
	res.showhtml('/jade/gallery/picshow.html', req, res);//输出静态文件
	return true;
}
home.slidershow = function(req, res, pathobj){
	res.showhtml('/jade/gallery/slidershow.html', req, res);//输出静态文件
	return true;
}
home.walk = function(req, res, pathobj){
	res.showhtml('/jade/gallery/walk.html', req, res);//输出静态文件
	return true;
}
module.exports = home; 