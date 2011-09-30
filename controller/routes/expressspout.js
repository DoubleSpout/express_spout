var home = {}
home.help = function(req, res, pathobj){
	res.show(req, pathobj,{pagetitle:'snoopy-node.js-使用帮助'});
	return true;
}

module.exports = home; 