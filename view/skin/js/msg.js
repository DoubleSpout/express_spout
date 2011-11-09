function Message(id){
	this.id = $('#'+id);
	this.closea = 'close';
	this.plusa = 'plus';
	this.iname = $('#name');
	this.icontent = $('#content');
	this.pclass = 'i_i';
	this.pclassh = 'i_i_hover';
	this.plusurl = '/message/plus/';
	this.sendurl = '/message/send/';
	this.delurl = '/message/del/';
	this.moreurl = '/message/more/';
	this.getcapurl = '/message/getcaptcha/'
	this.form = $('#send');
	this.subtb = $('#ajaxsub');
	this.state = $('.m_state');
	this.sname = $('#sname');
	this.condition = $('#condition');
	this.sorting = $('#sorting');
	this.sname2 = $('#sname2');
	this.pid = $('#pid');
	this.po = $('po');
	this.poid = $('poid');
	this.page = 0; //初始页
	this.perpagenum = 5;//一次获取多少个
	this.ajaxing = false;
	this.intial();
}
Message.prototype.closehover = function(target, isout){
	this.id.find('.'+this.closea).hide();
	this.id.find('.'+this.pclass).removeClass(this.pclassh);
	if(isout) return false;
	target.find('.'+this.closea).show();
	target.addClass(this.pclassh);
	}
Message.prototype.del = function(target){
	var that = this;
	var tp = target.parent(),
	    id = tp.attr('id');
	$.get(this.delurl, {id:id},function(data){
		if(data.suc==1){
			tp.remove();
			var sf = that.state.find('font'),
				total = parseInt(that.state.find('font').html()) - 1;
				that.state.find('font').html(total);
			}
		else alert(data.fail);
		},'json')
	}
Message.prototype.plus = function(target){
	var tp = target.parent(),
	    id = target.parent().attr('id');
	$.get(this.plusurl, {id:id}, function(data){
		if(data.suc==1){
			var tpf = tp.find('font'),
			    rq = parseInt(tpf.html())+1;
			tpf.html(rq);
			}
		else alert(data.fail);
		return false;
		},'json')
	return false;
	}
Message.prototype.ajaxsub = function(po){
	var that = this;
	if(that.ajaxing) return false;
	var data = {
	poid: $('#poid').val(),//验证码ID
	pid: $('#pid').val(),//是否是回复ID
	po:po,
	name:$('#name').val(),
	content:$('#content').val()
	}
	that.ajaxing = true;
	$.get(this.sendurl,data, function(data){
		that.ajaxing = false;
		if(data.suc ==1) location.href = '/message/'
		else{
			tb_remove();
			alert(data.fail);			
		}
		},'json')
	}
Message.prototype.reply = function(target){ //点击回复
	this.pid.val(target.attr('aid'));
	var val = '回复：';
	this.icontent.focus().val(val);
}
Message.prototype.getmore = function(target){
		var that = this,
		    data = that.intialmore();//为more按钮初始化做准备
		if(that.ajaxing) return false;
		that.ajaxing = true;
		$.get(that.moreurl, data, function(d){
			    that.ajaxing = false;
				if(d.suc==1){
					if(d.msg.length == 0){
						target.css('visibility','hidden');
						return false;
					}
						var s ='<div class="m_dm" style="display:none;">';
						for(var i=0;i<d.msg.length;i++){
							var dmi = d.msg[i];
							s+='<p  class="i_i vnone" id="'+dmi._id+'"><strong>作者：'+dmi.name+'</strong><span>人气：<font>'+dmi.plus+'</font></span>时间：'+dmi.time+'<br>'+dmi.content+'<a class="m_re" name="reply" aid="'+dmi._id+'" href="javascript:;">回复</a><a href="javascript:;" name="plus" class="plus">+1</a><br><a style="display: none;" class="close" name="del" href="javascript:;">X</a></p>'
						}
						s+='</div>';
						that.state.before(s);
						that.id.find('.m_dm').last().slideDown('fast',function(){
							$(this).css('height',$("this").height()+'px').find('p').hide().removeClass('vnone').fadeIn();;
						});
					}
				else alert(d.fail);
				},'json')
	}

Message.prototype.intialmore = function(){
		var sorting = Get_QueryString_Plus().sorting||1;
		if(sorting == 1){
			var condition = this.id.find('.'+this.pclass).last().attr('id')||true;//获得最后一个的id
		}
		else{
			var condition = 20+(this.page++)*this.perpagenum
		}	
		var sname = Get_QueryString_Plus().sname||true;
		var d = {
			sorting : sorting,
			condition : condition,
			sname:sname,
			pagenum:this.perpagenum
		}
		return d
}
Message.prototype.snameintial = function(){ 	
	var that = this;
	var snameval = '输入关键字，按回车搜索',
		urlsname = Get_QueryString_Plus().sname;
	if(typeof urlsname !== 'undefined'){
		that.sname.val(decodeURIComponent(urlsname));
	}
	else that.sname.val(snameval);
	that.sname.focus(function(){
		if($(this).val() === snameval) $(this).val('').removeClass('sname');
		return false;
	})
	that.sname.blur(function(){
		if($(this).val() === '') $(this).val(snameval).addClass('sname');;
		return false;
	})
	}
Message.prototype.getcaptcha = function(){
	var that = this;
	if(that.ajaxing) return false;
	that.ajaxing = true;
	$.get(this.getcapurl,{"a":"getcap"},function(data){
		that.ajaxing = false;
		if(data.suc != 1){
			alert(data.fail);
			return false;
		}
		that.putcaptcha(data);
	},'json')
}
Message.prototype.putcaptcha = function(data){
	var val = data.data.value,
		poid = data.data.id,
	    len = data.data.caary.length,
		htmls = '';
	$('#poid').val(poid);
	$('#cap_value').html(val);
	for(var i=0;i<len;i++){
		var ci = data.data.caary[i];
		htmls += '<img src="'+ci.url+'" title="图片" po="'+i+'" />';
	}
	$('#cap_img').html(htmls);
	this.captchaintial()
}
Message.prototype.captchaintial = function(){
var that = this;
	$('#cap_img img').draggable({opacity: 0.7, 
		helper: "clone",
		zIndex:14,
		stop:function(event, ui){
			var l = ui.position.left,
				t = ui.position.top;
			if((l>83&&l<190)&&(t>58&&t<190)) that.ajaxsub(ui.helper.attr('po'));		
		}
	});

	$('.cap_b_c').hover(function(){$('.cap_b').addClass('cap_b_ho');},function(){$('.cap_b').removeClass('cap_b_ho');})
	tb_show('','#TB_inline?height=330&width=400&inlineId=captchabox')
	}
Message.prototype.intial = function(){
	var that = this;
	that.id.mouseover(function(event){
		var target =  $(event.target||event.srcElement);
		if(target.attr('class') === that.pclass){
			that.closehover(target);
		}
	})
	that.id.hover(function(){
	},function(){
		that.closehover(null, true);
	})
	that.id.click(function(event){
		var target =  $(event.target||event.srcElement);
		var tname = target.attr('name');
		if(that[tname]) that[tname](target);
		return false;
		})
	that.form.submit(function(){
		var isok = true;
		that.form.find('input').each(function(){
			if($.trim($(this).val()) === ''){
				isok = false;
			 }
		})
		if(!isok){alert('作者或内容不能为空'); return false;}
		that.getcaptcha()
		return false;
		})
	that.subtb.click(function(){
		that.form.submit();
		})	

	that.snameintial();
}
var msg = new Message('msg');
