//@require ../lib/inputgroup

$(function(){
  //搜索框初始化 事件绑定
  $('.inputgroup').inputgroup().on('submit',function(){
    var val = this.instance.val();
    location.href = '/Zhengzu/index/skey/' + val + '.html';
  });

  $('.inputgroup .textinput').focus(function(){
    $('.hot-list').hide();
  });

  $('.inputgroup .textinput').blur(function(){
    var $this = $(this);
    $this.val() ? $('.hot-list').hide() : $('.hot-list').show();
  });
});
