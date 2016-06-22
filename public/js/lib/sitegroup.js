//@require util

function SiteGroup(el,options){
  var $el = $(el),
      $top = $el.find('.btn-top'),
      $qrcode = $el.find('.btn-qrcode'),
      $feedback = $el.find('.btn-feedback'),
      $fb = $('.feedback'),
      self = this;

  if(!$.isFunction(options.easing)){
    options.easing = 'linear';
  }

  $top.on('click',function(){
    $('html,body').stop().animate({scrollTop:0},options.speed,options.easing);
    return false;
  });

  $qrcode.hover(function(){
    $qrcode.find('.qrcode').fadeIn(600);
  },function(){
    $qrcode.find('.qrcode').fadeOut(400);
  });

  $feedback.on('click',function(){
    $fb.show();
  });

  $fb.on('click',function(e){
    if(e.target.className == 'ui-mask'){
      $(this).hide();
    }
  });

  $fb.find('.ui-dialog-close').on('click',function(){
    $fb.hide();
  });


  $(window).on('scroll',function(){
    var scrollTop = $(window).scrollTop(),
        maxHeight = document.body.style.maxHeight;

    if(typeof maxHeight === 'undefined'){
      $el.css({'position':'absolute',
               'top':scrollTop + $(window).height() -20
      });
    }

    scrollTop>options.min ? $el.fadeIn(options.fade_in)
            :$el.fadeOut(options.fade_out);
  });

}


$.fn.sitegroup = function(options,delegate){
  if(arguments.length === 1){
    if(typeof arguments[0] === 'function'){
      delegate = arguments[0];
      options = null;
    }
  }

  options = $.extend({
    fadeIn:600,
    fadeOut:400,
    min:200,
    speed:1000,
    easing:'easeInOutExpo'
  },options);

  if (!this.length) {
      return $(this).sitegroup(options, delegate);
  } else {
      return this.each(function() {
          if (this.instance) return;

          this.instance = new SiteGroup(this, options);
          mixinJQueryEvent(this.instance, this);

          if (delegate) {
              delegate.call(this, this.instance);
          }
      });
  }
}
