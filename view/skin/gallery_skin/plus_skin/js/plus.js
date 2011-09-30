(function($) {
$.fn.plus_member = function(settings) {
 var self = this;	
 var default_settings = {

	 }
	 
 $.extend(default_settings, settings||{}); 
 var cy_member={};//用来存放圈子里的用户资料例如：{c_1:[{人员信息1},{人员信息2},...]}
 var m_l = {
	 	draging : false,
		id:'plus',  //下面是各种class和ID，不必修改，对应HTML页面
	 	m_id:'p_m_b',//大框的ID
		c_id:'clone',
		hi_id:'p_m_hi',
		hs_name:0,//当鼠标移动到人员标签时，获得其ID
		p_m_sa_id:'p_m_sa',
		p_m_cl:'p_m',
		p_m_hover_cl:'p_m_hover',
		p_m_sel_cl:'p_m_sel',
		p_m_n_cl:'p_m_n',
		p_m_t_cl:'p_m_t',
		p_m_alpha_cl:'alpha',	 
		p_m_hs_cl:'p_m_hs',
		o_m_drag_cl:'ui-draggable',
		o_m_draging_cl:'ui-draggable-dragging',
		p_m_issel:false,//拖动前判断下是否有选择用户
		putarray:[],  //建立存放拖拽用户信息的数组	    
		b_top:function(){return parseInt($('#'+this.m_id).offset().top);}, //获取拖拽大框的屏幕高宽
		b_left:function(){return parseInt($('#'+this.m_id).offset().left);}//获取拖拽大框的屏幕高宽
	 };
var cy = {
		id:'cycle',
		p_cl:'p_c',
		p_img_cl:'p_c_img',
		p_c_hs_cl:'p_c_hs',
		p_c_s_p_cl:'s_p_b',
		p_c_s_p_p_cl:'s_p_b_p',
		p_c_num_cl:'p_c_c_num',
		p_c_a_num_cl:'a_num',
		p_c_color_cl:'p_c_c_box',
		p_c_color_r_cl:'p_c_c_bg_r',
		p_c_color_w_cl:'p_c_c_bg_w',
		p_c_max:12,//每个圈子最多放置的小头像个数
		c_go_a:15,   //每次角度增加的幅度
		c_go_po_a:30, //每个圆形头像占多少角度
		c_go_t:6,   //每次移动上面角度所花的时间
		c_go_old_t:6,//老的头像移动速度
		c_go_que:0  //当前画圈动画"前面"已经有几个圈在活动了
	};
	 
  m_l.hs = function(that, type){  //绑定HOVER和CLICK效果，type === 1是OVER，2是OUT,3是CLICK
  			var that = that.parent();
			switch(type){
			 case 1:
			 var cl = m_l.p_m_hover_cl;that.addClass(cl);
			 break;
			 
			 case 2:
			 var cl = m_l.p_m_hover_cl;that.removeClass(cl);	 
			 break;
			 
			 case 3:
			 var cl = m_l.p_m_sel_cl;
			 if(that.hasClass(cl)){that.removeClass(cl);}else {that.addClass(cl);}	 
			 break;
			}
	}
	
	m_l.sel_all = function(that){//全选和反选
				$('.'+m_l.p_m_cl).each(function(){
					var that = $(this)
						if(that.hasClass(m_l.p_m_sel_cl)){
							that.removeClass(m_l.p_m_sel_cl);
							}
						else{
							that.addClass(m_l.p_m_sel_cl);
							}
				})
				$(that).blur();
		}
	
   m_l.getxy = function(event){//获取点击事件的鼠标XY坐标
	   var po={
		   x : event.clientX - m_l.b_left(),
		   y : event.clientY - m_l.b_top()
		   }		   
	    //alert(po.x+','+po.y)
		 return po;
	   }
	   
 	m_l.drag_s = function(e, u){//拖动开始的方法
		if(m_l.hs_name !== 0){	//判断是否在用户标签上
				$('div[name='+m_l.hs_name+']').addClass(m_l.p_m_sel_cl);
			}
		var po = m_l.getxy(e),
			 thato = $('#'+m_l.m_id).find('.'+m_l.p_m_sel_cl);		
	         thato.addClass(m_l.p_m_alpha_cl);
			if(thato.length>0){m_l.p_m_issel = true;}	 
			else {m_l.p_m_issel = false;}
		$('.'+m_l.o_m_drag_cl+':last').attr('id',m_l.c_id).find('.'+m_l.p_m_cl).each(function(){ 
		//将CLONE出来的层的每个用户按钮算好absolute的TOP和LEFT
				var that = $(this);
				if(!that.hasClass(m_l.p_m_sel_cl)){that.remove();}
				else {
					that.css({'position':'absolute',
								  'top':parseInt(that.attr('otop')) - m_l.b_top() +'px',
								  'left':parseInt(that.attr('oleft')) -m_l.b_left()+'px'
					}).addClass(m_l.p_m_alpha_cl).animate({top: po.y -15 +'px', left: po.x-30+'px'}, 200, 'swing', function(){});
				}
			})
			if(thato.length>1){
				setTimeout(function(){
						if($('.'+m_l.o_m_drag_cl).length>1){
							var tn_y = po.y -33,
								tn_x = po.x + 30;	
							var str = '<div class="p_n_t" style="top:'+tn_y+'px;left:'+tn_x+'px" >'+thato.length+' 个人</div>'
							$('.'+m_l.o_m_drag_cl+':last').find('.p_m_i_b').append(str);
						}
					},300)
			}
		}
		
	m_l.remove_alpha = function(){
			$('#'+m_l.m_id).find('.'+m_l.p_m_alpha_cl).removeClass(m_l.p_m_alpha_cl);
		}	
	m_l.remove_sel = function(){
			$('#'+m_l.m_id).find('.'+m_l.p_m_sel_cl).removeClass(m_l.p_m_sel_cl);
		}
	m_l.drag_e = function(obj){//拖动结束，当鼠标按钮释放时执行
			obj.find('.'+m_l.p_m_sel_cl).each(function(){
				var that = $(this); 
					that.animate({top: that.attr('otop') - m_l.b_top()+'px', left: that.attr('oleft')- m_l.b_left()+'px'}, 300, 'swing', function(){});
				})
			obj.animate({top: m_l.b_top() +'px', left: m_l.b_left()+'px'}, 300, 'swing', function(){
					obj.remove();
					$('#'+m_l.hi_id).focus();//为IE用户准备
				});
				
		}
	m_l.putcycle = function(cloneobj){
		cloneobj.find('.'+m_l.p_m_sel_cl).each(function(){
			var m_o = {
				name : $(this).attr('name'),
				s_pic : $(this).find('img').attr('small')
				}
			m_l.putarray.push(m_o)
			})
		$('.'+m_l.o_m_draging_cl).last().remove();
		
		}		
 	m_l.putoffset = function(){//将每个用户块的屏幕高度算好放在它的自定义属性中
		  var os;  
		  $('.'+m_l.p_m_cl).each(function(){
			  var that = $(this)
			  os = that.offset();
			  that.attr({'otop':os.top, 'oleft':os.left , 'num':'p_'+that.index()})
			  })
	 }
	cy.hs = function(that, type){//圈子的HOVER
			if(type===1){
				that.parent().find('.'+cy.p_img_cl).animate({top:'0px',left:'0px',width:'183px',height:'183px'}, 100, 'swing',function(){});
				}
			else if(type===2){
				that.parent().find('.'+cy.p_img_cl).animate({top:'26px',left:'26px',width:'131px',height:'131px'}, 100, 'swing',function(){});
				}
		} 	
	 cy.hs_sp = function(that, num){//显示或是影藏小头像
	 var sp = that.find('.'+cy.p_c_s_p_p_cl);
		 if(num===1){
			 sp.fadeIn('fast');
			 }
		 else {
			 sp.hide();
			 }
		 }
	 cy.addnum = function(that, num){
		 	var thato= that.find('.'+cy.p_c_num_cl),
		 	    addnum = parseInt(thato.html())+num;
			thato.html(addnum);
			return addnum;		
		 }
	 cy.upnum = function(that, num){
		 var addid = 'addnum',
		  	 str = '<div id="'+addid+'" class="'+cy.p_c_a_num_cl+'">+'+num+'</div>',
			 thato = $('#'+addid);
		 if(thato.length>0){
			 thato.remove();
			 }
		 that.append(str);
		 $('#'+addid).animate({top:'-26px',left:'45px','opacity':0}, 1000, 'swing',function(){
			 $(this).remove();
			 })
		 }
	 cy.show_color = function(that, t_or_w){
		 var thato = that.find('.'+cy.p_c_color_cl),
		 	 n_cl = cy.p_c_color_r_cl;
		 if(t_or_w === false){
			 n_cl = cy.p_c_color_w_cl;
			 }
		 thato.addClass(n_cl).fadeIn();
		 setTimeout(function(){
			 thato.fadeOut('slow', function(){
				 $(this).removeClass(n_cl);
				 });
			 },500)
		 }
	 cy.append_dom = function(){
		 	var str= '',
				pm,
				is_f_array = cy_member[m_l.is_on_c_id],
				addnum=0, //计数器，记录有几个增加有效用户
				no_repeat = true;
				var i_num = m_l.putarray.length;
		 		for(var i=0;i<i_num;i++){
					pm = m_l.putarray[i];
					no_repeat = true;
					for(var j=0;j<is_f_array.length;j++){
						  if(pm.name == is_f_array[j].name){
							  no_repeat = false;
							  break;
							  }
						}		
					if(no_repeat){	//如果没有发现重复		
					 is_f_array.push(pm);
					 addnum++;
					 	if(i <= cy.p_c_max){//每次只输出12个转，多余的塞入数组，不转
								str += '<div class="'+cy.p_c_s_p_cl+' '+cy.p_c_s_p_p_cl+'" style="display:none;" name="'+pm.name+'"><img src="'+pm.s_pic+'" /></div>';
						}
					}
				}
			$('#'+m_l.is_on_c_id).append(str);
			return  {
					true_num : addnum,//真实加入的数量
					put_num : $('#'+m_l.is_on_c_id).find('.'+cy.p_c_s_p_cl).length //实际放入的数量，只有放入超过12个2值才会不同
				}
		 }		
		 
	 cy.cut_dom = function(that, num, order){//如果在转动结束后发现多于NUM个小头像，则移除多余的
	 		var s_p_o = that.find('.'+cy.p_c_s_p_p_cl+'[isfinshed="true"]')
				cut_num = s_p_o.length - num;
			if(order === true){
					s_p_o.slice(0, num).remove();
					return true;				
				}	 
			else if(cut_num>0 && order === false){
				s_p_o.slice(-cut_num).remove();	//移除DOM
				}
		 }
		 
	 cy.goround = function goround(jq_dom, r, angle, queue_num, x, y, isfirst, isold){
/*
参数说明：jq_dom为jqury dom 对象，r为旋转半径，angle为初始角度，queue_num为之前的开始转动DOM的个数，x和Y指的是原点，相对于relative，isfirst是
第一次显示DOM
*/
	 	 var ca = angle,
		     ca_r = (2*Math.PI/360)*ca,
			 newp = {},
			 go_t = cy.c_go_t;
		 	 newp.x = x + Math.sin(ca_r)*r;
		 	 newp.y = y - Math.cos(ca_r)*r;
		  if(isfirst === true){
			  jq_dom.css({top: newp.y+'px',left:newp.x+'px'}).show();
			  }		  
		  if(isold === true){
			  go_t = cy.c_go_old_t
			  }
		  var poor = ca - cy.c_go_a;
		  if( poor >= cy.c_go_po_a * queue_num){ca = ca - cy.c_go_a;}
		  else{
			  jq_dom.removeClass(cy.p_c_s_p_cl).attr({'isfinshed':'true', 'angle':queue_num*cy.c_go_po_a});
			  return true;}
		  //alert(newp.x+'|||'+newp.y);
		  //alert(ca);
		  jq_dom.animate({top: newp.y+'px',left:newp.x+'px'}, go_t, 'swing',function(){
			 goround(jq_dom, r, ca, queue_num, x, y, false, isold);
			  }) 
		 }
	 m_l.intial = function(){  //初始化绑定一些事件
			 m_l.putoffset(); //放置当前的位置
			 $('#'+m_l.m_id).bind({//给用户BOX绑定一些事件，比如HOVER和CLICK
				   mouseover: function(event) {
						   var that = $(event.target||event.srcElement)
						   if(that.hasClass(m_l.p_m_hs_cl)){
							   m_l.hs(that, 1);
							   m_l.hs_name = that.parent().attr('name');
							   }
					  },
				   mouseout:function(event){
						   var that = $(event.target||event.srcElement);
						   if(that.hasClass(m_l.p_m_hs_cl)){
							   m_l.hs(that, 2);
							   m_l.hs_name = 0;
							   }		   
					   },
				   click: function(event){
						   var that = $(event.target||event.srcElement)
						   if(that.hasClass(m_l.p_m_hs_cl)){
							   m_l.hs(that, 3)
						   }
				  }
				}); 
			$('#'+m_l.p_m_sa_id).click(function(){  //全选和反选按钮
					m_l.sel_all(this);
				})
			$('#'+cy.id).bind({//给圈子绑定hover
				   mouseover: function(event) {
						   var that = $(event.target||event.srcElement);
						   if(that.hasClass(cy.p_c_hs_cl)){
							        m_l.is_on_c = true;//表示拖拽到圈子上了
									var that_p = that.parent();
						 		    m_l.is_on_c_id = that_p.attr('id');
							   	    cy.hs_t = setTimeout(function(){
										cy.hs(that, 1);
										cy.hs_sp(that_p, 1);
									},50);
							   }
						   else{
							   return false;
							   }
					  },
				   mouseout:function(event){
						   var that = $(event.target||event.srcElement);
						   if(that.hasClass(cy.p_c_hs_cl)){
							   m_l.is_on_c = false;//表示从圈子上移走了
						 	   m_l.is_on_c_id = 0;
							   var that_p = that.parent();
							   clearTimeout(cy.hs_t)
							   cy.hs(that, 2);
							   cy.hs_sp(that_p, 2);
							   }
					   }
				})

			 $('#'+m_l.m_id).draggable({distance: 5 ,helper: 'clone',start: function(event, ui){//绑定draging事件
						 m_l.draging = true;
						 var issel = m_l.drag_s(event, ui);
					 }
				 });
			 $(document).mouseup(function(){  //绑定鼠标按钮释放事件
			 	$('#'+m_l.m_id).draggable('enable');
					 if(m_l.draging === true){
						var cloneobj = $('#'+m_l.c_id).clone();
						$('#'+m_l.id).append(cloneobj);
						if(!m_l.is_on_c || m_l.p_m_issel === false){
							m_l.drag_e(cloneobj);
							m_l.remove_alpha();
							}//表示没有移动到圈子上，则弹回去
						else {	//表示移动到圈子上了，则执行放置事件
								m_l.putcycle(cloneobj);//将克隆出来的选中用户列表入数组
								m_l.remove_alpha();
								var s_p_num = cy.append_dom(),
									that = $('#'+m_l.is_on_c_id),
									i = 0,
									s_p_o = that.find('.'+cy.p_c_s_p_cl),
									s_p_put_num = s_p_num.put_num;
								if(s_p_put_num !==0){//如果有新用户提交进来
										cy.c_go_que = that.find('.'+cy.p_c_s_p_p_cl+'[isfinshed="true"]').length;		
										if(cy.c_go_que != 0 && (cy.c_go_que === cy.p_c_max || cy.c_go_que + s_p_put_num > cy.p_c_max)){ 
										 //如果圈子装不下了
												var cut_num = cy.c_go_que + s_p_put_num - cy.p_c_max,  //多出来几个
													cy_que = cy.c_go_que;
												if(s_p_put_num >= cy.p_c_max){cut_num = cy.c_go_que}
												//如果多出来的个数还是超过了最大容量，则以最大容量为准
												cy.cut_dom(that, cut_num, true);//reomve掉多出来的
												//alert(cut_num);
												//alert(that.find('.'+cy.p_c_s_p_p_cl+'[isfinshed="true"]').length)
												cy.c_go_que = 0; //将初始位置清空
												if(cut_num < cy_que){ //老的小头像的动一下
													var is_f_o = that.find('.'+cy.p_c_s_p_p_cl+'[isfinshed="true"]'),
														for_num = is_f_o.length
														angle = 0,
														cy.c_go_old_t = 6;
														cy.c_go_old_t = for_num*cy.c_go_old_t*0.7;
													var old_set_time = cy.c_go_old_t*6;
														for(var k=0;k<for_num;k++){//循环将
															angle = parseInt(is_f_o.eq(k).attr('angle'));
															  cy.goround(is_f_o.eq(k), 68, angle, cy.c_go_que, 75, 75, true, true);
															  cy.c_go_que++;
															}
													}//老的小头像动一下结束
											}	//如果圈子装不下，判断完毕
											
												var st,sto;	
												var st_go = function(){
													setInterval(function(){
													if(i>=s_p_put_num){
															clearInterval(st);
															cy.cut_dom(that, cy.p_c_max, false);
															if(!m_l.is_on_c){	//如果用户鼠标已经移走，则转弯自动隐藏
																cy.hs_sp(that,0)
															}
															return false;
														}
													cy.goround(s_p_o.eq(i), 68, 360, cy.c_go_que, 75, 75, true, false);
													i++;
													cy.c_go_que++;
															},20);
												 }
												 sto = old_set_time?old_set_time:5;
												setTimeout(function(){st_go();},sto)
												//注：这里的old_set_time是指老的DOM有没动，如果动了则缓一下再动,否则立即行动			
													cy.show_color(that, true);
													cy.addnum(that, s_p_num.true_num);//将当中人数总数加上去
													cy.upnum(that, s_p_num.true_num);//+几效果
													m_l.remove_sel();
								}//如果有新用户提交进来判断结束
								else{//如果重复用户DROP，没有新用户提交进来
									cy.show_color(that, false);
									}
								m_l.putarray.length = 0;//将数组清空
							}
						m_l.draging = false;
					 }
				 })
				 
			/*真实生产环境不需要这段*/	 		
			$('.'+cy.p_cl).each(function(){
					var id = $(this).attr('id');
					if(typeof cy_member[id] === 'undefined'){//如果不存在cy_member，则创建他，
							cy_member[id] = [];
					}	
				})		
			/*真实生产环境不需要这段*/	 	
	
	}();//立即执行初始化
	 

	 
}
})(jQuery);
