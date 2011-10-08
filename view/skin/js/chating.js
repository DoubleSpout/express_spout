void function(){
	var Chating=function(){
		this.p_m = [];
		this.p_isopen = false;
		this.myid = $.trim($('#my_uid').val()); //我的ID
		this.since = parseInt($('#since').val());//起始时间
		this.sendtime = 0;
		this.recurl = '/chating/receive/'
		this.sendurl = '/chating/send/'
		this.msgempty = '消息不能为空';
		this.msgquick = '打字飞速，喝杯茶吧';
		this.isfirst = true;
		this.initial();
	}
	Chating.prototype.downscroll = function(id){
		document.getElementById(id).scrollTop = document.getElementById(id).scrollHeight;
		}
	Chating.prototype.ajaxback = function(r, succallback, failcallback){
		if(r.suc == 1){
			if(succallback) succallback();
		}
		else if(failcallback) failcallback();
		}
	Chating.prototype.sendmsg = function(val, to){
		var that = this;
		if(val==''){
			alert(this.msgempty)
			return false;
			}
		var now = (new Date()).getTime();
		if(now - this.sendtime <500){
			this.sendtime = now;
			alert(this.msgquick);
			return false;
		}
		else this.sendtime = now;
		$.get(this.sendurl, {'msg':val, 'to':to, 'random':Math.random()}, function(r){
			that.ajaxback(r,false,function(){alert(r.fail);})	
		}, 'json')
		return true;
	}
	Chating.prototype.dealmsg = function(msg){
		var str='',
			now_msg,
			that = this;
			for(var i=0, num = msg.length; i<num; i++){
				now_msg = msg[i]
				if(now_msg.towho === 'all')	str +='<p><span class="green2">'+now_msg.uname+'</span> : '+now_msg.msg+'</p>';
				else this.p_m.push(now_msg);
			}	
			$('#screem').append(str);
			this.downscroll('screem')
	}
	Chating.prototype.dealpmsg = function(){
		var that = this;
		if(this.p_isopen){//如果私聊窗口打开，则输出字符串
			str='';
			this.p_m = $.grep(this.p_m, function(n,i){
				if(n.sid == that.myid ||   n.towho ==  that.myid){
					str +='<p><span class="green2">'+n.uname+'</span> : '+n.msg+'</p>';
					return true;
				}
				return false
			},true);
			$('#p_screem').append(str);
			this.downscroll('screem');
		}
	}
	Chating.prototype.dealmemlist = function(memlist){ //更新人员列表
		var str='';
		for(var i=0, num = memlist.length; i<num; i++){
			str +='<p id="'+memlist[i].id+'" name="'+memlist[i].name+'"><img src="'+memlist[i].face+'">'+memlist[i].name+'</p>'
		}	
		$('#member').html(str);
		$('#'+this.myid).addClass('my');
		for(var i=0;i<this.p_m.length;i++){
			if(this.p_m[i].sid != this.myid){
				$('#'+this.p_m[i].sid).addClass('new_msg');
			};
		}
	}
	Chating.prototype.ajaxgo = function(){
		var that = this;
		 $.ajax({cache: true, type: "GET", url:that.recurl, dataType:"json", data:{"since":that.since, "isfirst":that.isfirst,"random":Math.random()}, error:function (){setTimeout(function(){that.ajaxgo()} , 1000);}, success: function(r){
				that.ajaxback(r,function(){
								if(r.suc == 0){
									alert(r.fail);
									return false;
								}
								that.isfirst = false;
								var l = r.msg.length;
								if(l > 0 ){
									that.since = r.msg[l-1].timestamp;
									that.dealmsg(r.msg);
									that.dealpmsg();
								}
								that.dealmemlist(r.memlist);
								that.ajaxgo();
						},false);
				  }
			 })
	}	
	Chating.prototype.showbox = function(id, name, box){
			var pid  = box.find('#p_name').attr('sid');
			if(this.p_isopen && pid == id) return false;
			box.hide().find('#p_name').attr('sid', id).html(name)
			box.fadeIn();
			$('#p_screem').html('');
			$('#p_send').val('');
			this.p_isopen = true;
		}
	Chating.prototype.initial = function(){
		var that = this;
		$('#send').submit(function(){
			if(that.sendmsg($('#send_c').val(), 'all')) $('#send_c').val('');
			return false;
		})
		$('#p_send_form').submit(function(){
			if(that.sendmsg($('#p_send').val(), $('#p_name').attr('sid'))) $('#p_send').val('');	
			return false;
		})
		$('#member').click(function(event){
			 var targetobj = $(event.target||event.srcElement);
			  if((targetobj.prop('tagName') ==='P') && targetobj.attr('id') != that.myid){
				   targetobj.removeClass('new_msg');
				   that.showbox(targetobj.attr('id'), targetobj.attr('name'), $('#p_box'));
				   that.dealpmsg();
			  }	
		})
		$('#p_close').click(function(){
			$('#p_box').hide().find('#p_name').attr('sid', '0');
			this.p_isopen = false;
		})
		setTimeout(function(){that.ajaxgo()} , 200);	
	}	
	var Login = function(){
		this.nametext = '用户名';
		this.pwdtext = '密码';
		this.nameerr = '用户名错误';
		this.pwderr = '密码不能为空';
		this.intial();
		}
	Login.prototype.checkinput = function(){
		if($('#name').val()===''||$('#name').val()===this.nametext){
			alert(this.nameerr);
			return false;
			}
		if($('#pwd').val()===this.pwderr){
			alert('');
			return false;
			}
		return true;
	}	
	Login.prototype.bindi = function(iobj, text){
		iobj.attr('value', text).bind({
	 		focus: function() {
		  				if($(this).val() === text) $(this).val('');	
			  			$(this).removeClass('gray')
	  		},
	  		blur: function(){
		   if($(this).val() === '') $(this).val(text);
		   $(this).addClass('gray')
	 	   }
	});
	}
	Login.prototype.intial = function(){
		var that = this;
			$('#login').submit(function(){
				if(Login.prototype.checkinput()) return true;
				return false;
			})
			that.bindi($('#name'), that.nametext);
			that.bindi($('#pwd'), that.pwdtext);
	}
	
	var Upload = function(){
		this.ran = $('#random').val();
		this.picempty = '请先点浏览选择图片，然后点上传';
		this.intial();
		}

	Upload.prototype.ajaxget = function(){
		var that = this;
		$.get('/chating/progress', {'ran':that.ran}, function(data){
				if(data.suc == 0) return false;
				if(data.suc == 1){
					clearTimeout(that.st);
					return false;}
				var pm = Math.floor((data.br/data.be)*100)
				var pr = !pm ? 0 : pm
				$('#progress_div').html(pr+'%');
				that.st = setTimeout(function(){
					that.ajaxget();
				},1000);
			}, 'json')
		}
window.uploadcallback = Upload.prototype.uploadcallback = function(filesize, filepath, err){
			if(err){
				$('#progress_div').html('100%');
				alert('图片格式错误');
				return false;
			}
			$('#progress_div').html('100%');
			$('#face').val(filepath);
			$('#i_f').attr('src', filepath);
	}
	Upload.prototype.intial = function(){		
		var that = this;
		$('#upload_form').submit(function(){
			if(!$('#facefile').val()){
				alert(that.picempty);
				return false;
			}
			$(this).attr('action','/chating/upload?random='+that.ran+'&func=uploadcallback');
				setTimeout(function(){
					that.ajaxget();
					},100);
			return true;
		})
	}
if($('#login').length>0){
	var upload = new Upload();
	var login = new Login();	
	}
if($('#send_c').length>0){
	var chating = new Chating();
	}
}()