//@require gallery/jquery/jquery
//@require lib/switchable
//@require lib/lazyload
//@require lib/selectbox
//@require commons/sitegroup
//@require commons/header

$(function(){
  //图片懒加载
  $('img.lazy').lazyload();

  var $nav = $('.normal-nav-item'),
      $panel = $('.nav-content-panel .panel-content'),
      showTimer,
      hideTimer;

  $nav.on('mouseenter',function(){
    var $this = $(this),
        nochild = $this.data('nochild');

    if(nochild){
      return;
    }
    var index = $this.index();
    //由于品牌公寓没有panel 此处需要对index做处理
    var panelIndex = (index>2) ? index -1 : index;

    clearTimeout(hideTimer);
    hideTimer=null;
    showTimer=setTimeout(function(){
      $panel.hide().eq(panelIndex).show();
      $nav.removeClass('active').eq(index).addClass('active');
    },100);

  });

  $nav.on('mouseleave',leaveHandler);

  $panel.on('mouseenter',function(){
    var $this=$(this),
        index =$this.index();

    var navIndex = (index>1) ? index + 1 : index;
    clearTimeout(hideTimer);
    hideTimer=null;
    showTimer=setTimeout(function(){

    },100);
  });

  $panel.on('mouseleave',leaveHandler);

  function leaveHandler(e){
    clearTimeout(showTimer);
    showTimer = null;

    hideTimer = setTimeout(function(){
      $nav.removeClass('active');
      $panel.hide();
    },100);
  }

  var slide = new Switchable({
    panels:$('.slide-panel'),
    autoplay:true
  });

  $('.slide-prev').click(function(){
    slide.paused();
    slide.prev();
    slide.autoPlay();
  });

  $('.slide-next').click(function(){
    slide.paused();
    slide.next();
    slide.autoPlay();
  });

  var tabs = new Switchable({
    triggers:$('.tabs-trigger'),
    panels:$('.tabs-content'),
    activeIndex:1
  });

  var qrShowTimer,
      qrHideTimer;

  $('.excell-item .icon').on('mouseenter',function(){
    var $el = $(this).parents('.excell-item').find('.excell-img');

    clearTimeout(qrHideTimer);
    qrHideTimer=null;

    qrShowTimer = setTimeout(function() {
      $el.animate({'left':'-100%'});
    },100);
  }).on('mouseleave',function(){
    var $el = $(this).parents('.excell-item').find('.excell-img');

    clearTimeout(qrShowTimer);
    qrShowTimer=null;
    qrHideTimer = setTimeout(function(){
      $el.animate({'left':'0'});
    },100);
  });

  var links = new Switchable({
    triggers:$('.links-trigger'),
    panels:$('.links-content')
  });


});
