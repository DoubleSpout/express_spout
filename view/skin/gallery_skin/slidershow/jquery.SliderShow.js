void function($) {
$.fn.slidershow = function(settings) {
	 var self = this;	
	 var df = {				//df简称default_settings
		 	recive_num : 10,//初始化和每次接收都是10条消息记录
		 	show_num : 5,//初始显示几条
			start_num:5,//这个值应该和初始值相同
			box_class:'.slider_content_box',
			content_class:'.slider_content',
			content_batch:1,//当前获得批次
			ajax_url:'/skin/gallery_skin/slidershow/ajax.txt',//ajax提交地址
			settime:2000,
			send_data:{"action":"getdata"},
			self_id:self.attr('id')	
		 }
	 $.extend(df, settings||{}); 
	 	 
	 var slidershow = {
		 	content:[]
		 };
	 slidershow.show = function(){ //jquery对象		
			var obj = self.find(df.box_class).first()
			obj.slideDown('slow', function(){	
					var thisheight = $(this).height();		
					$(this).css('height',thisheight).find(df.content_class).hide().css('visibility', 'visible').fadeIn('normal',function(){
							df.start_num++;
							if( df.start_num === df.recive_num){
									df.start_num = 1;
									df.content_batch++;
								}
							else if( df.start_num === df.recive_num - 1){
									slidershow.ajax();
								}				
							})
				})
		 }
	 slidershow.start_insert = function(){
		 var obj = self.find(df.box_class).last();
		 self.prepend(obj)
		 }
	 slidershow.ajax_insert = function(){
		 var cobj = slidershow.content.shift();
		 var str = '<div class="slider_content_box" style="display:none"><div class="slider_content"  style="visibility:hidden" >'+
                		  '<img src="'+cobj.img+'"/>'+
						    '<span>'+cobj.text+'</span>'+			
                   '<div class="clear"></div></div></div>';	 
		 self.prepend(str);
		 }
	 slidershow.deletedom = function(){ 
		 self.find(df.box_class).slice(df.recive_num).remove();
		 }
	 slidershow.ajax = function(){
		 	 df.send_data.r = Math.random();
		 	 $.get(df.ajax_url, df.send_data, function(data){
					for(var i=0; i<data.length; i++){
						slidershow.content.push({img:data[i].img, text:data[i].text});   //存入数组中					
					};
					if(df.content_batch !== 1){
						slidershow.deletedom();//每次ajax收到数据以后就删除DOM
					}
				 }, 'json')
		 }	
	slidershow.startdo = function(){ 
				self.find(df.box_class).each(function(){
					var num = $(this).index();
						if(num>df.recive_num - df.show_num - 1){
								$(this).css('display','none').find(df.content_class).css('visibility', 'hidden');
							}
					})
	}();
	 slidershow.gostart = function(){
			if(df.content_batch===1){
				slidershow.start_insert();
			}
			else {
				slidershow.ajax_insert();
				}
			slidershow.show();	 
		 }		 
	 slidershow.cycle = function(){
		  slidershow.cyclecontrol = setInterval(function(){
			slidershow.gostart();
			}, df.settime)
			return arguments.callee
		 }();
	 self.hover(function(){
		 	window.clearInterval(slidershow.cyclecontrol)
		 },function(){
			 slidershow.cycle();
			 })//绑定hover效果
}
}(jQuery);