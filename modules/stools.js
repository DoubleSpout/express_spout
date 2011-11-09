var tools = {}
tools.fdate = function(format){	
	var format = typeof format === 'undefined'?false:format.toLowerCase(),
		now = new Date(),
		time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
	if(format === 'y-m-d h:m:s'){
		time += ' '+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds(); 
	}
	return time;
};
tools.htmltostring = function(text){
	text = text.replace(/&/g, "&amp;");
	text = text.replace(/"/g, "&quot;");
	text = text.replace(/</g, "&lt;");
	text = text.replace(/>/g, "&gt;");
	text = text.replace(/'/g, "&#146;");
	return  text;
}
tools.check_all_param = function(){
	var arg = [].slice.apply(arguments, [0, arguments.length]);
	for(var i=0;i<arg.length;i++){
		if(typeof arg[i] == 'undefined') return false;
	}
	return true;
}


module.exports = tools;