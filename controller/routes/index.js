var home = {}
home.index = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-首页'});
	return true;
}

module.exports = home; 