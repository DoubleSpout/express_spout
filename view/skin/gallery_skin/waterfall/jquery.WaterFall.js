(function($) {
$.fn.waterfall = function(settings) {
 var self = this;	
 var default_settings = {
	 	initial_data:'200',	//初始化发送到后端的数据
		initial_url:'/skin/gallery_skin/waterfall/initial.txt',		//初始化获取投票数目的ajax地址
		send_data:{"number":''},		//点击投票以后发送到后端的数据
	 	send_url:'/skin/gallery_skin/waterfall/send.txt',		//点击投票以后ajax地址
		recive_type:'d',	//接收数据，例如JSON为{"d":[20,20,20...]}则这里填写d
		wf_column_height:40, //柱状图的高度
		wf_column_classname:'.wf_column',	//存放柱状的classname
		wf_num_classname:'.wf_num',			 //存放数字的classname
		wf_total_column:function(){return self.find(this.wf_column_classname).length}
	 }
 $.extend(default_settings, settings||{}); 
  function WaterFull(){
	 this.group = $(default_settings.wf_column_classname);
	 this.wf_data=[];
	 this.wf_height = [];
	 this.total_column = default_settings.wf_total_column();
	 this.column_num =  default_settings.wf_total_column();
	 }
  WaterFull.prototype.initial = function(){
		 var that = this;
		 $.get(default_settings.initial_url, default_settings.initial_data, function(data){
			 that.wf_data = data[default_settings.recive_type];
			 that.draw();
			 }, 'json')
	 }
  WaterFull.prototype.calculate	= function(){
	  	 var len = this.wf_data.length
		 var max_num = this.wf_data[0]
		 for(var i=0;i<len;i++){
			 if(this.wf_data[i]>=max_num){
				 max_num = this.wf_data[i]
				 }			 
			 }
	  	  for(i=0;i<len;i++){
			  	this.wf_height[i] = (max_num-this.wf_data[i])/max_num*default_settings.wf_column_height
			  }
		return this.wf_height;
	  }
  WaterFull.prototype.draw = function(){
	  var that = this;
	  var len = that.calculate().length;
	  this.total_column = 0;
	  var i,j;
	  for(i =0;i<len;i++){
		  var j = i
		  $(this.group[i]).css('height',default_settings.wf_column_height+'px').animate({height:that.wf_height[i]+'px'}, 'normal', 'linear', function(){
			  that.total_column++;
			  })
		  }
		for(j=0;j<len;j++){
				$(default_settings.wf_num_classname).eq(j).html(that.wf_data[j]);
			}
	  }
   WaterFull.prototype.clickdo = function(num){
	   var that = this;
	   if(that.total_column!==that.column_num ){return false;}
	   default_settings.send_data.r = Math.random();
	   this.wf_data[num]++;
	   	$.get(default_settings.send_url, default_settings.send_data, function(data){
			 that.draw();
		 }, 'json')
	   }
 var wf = new WaterFull();
 wf.initial();
 self.bind({click:function(event){
	 var that = $(event.target||event.srcElement)
	 var that_name = that.attr('name')
	 if(that_name==='waterfull_radio'){
		 var num = that.index('input[name="waterfull_radio"]');	 
		 default_settings.send_data.number = num;
		 wf.clickdo(num);
		 }
	 return true;
	 }})
}
})(jQuery);