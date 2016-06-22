//@require util

function Button(el,options){
  var $el = $(el),
      self = this;

  this.disable = function(v){
    if(typeof v === 'undefined'){
      return $el.hasClass('disabled') || $el.attr('disabled') === 'disabled';
    }else{
      if(!!v){
        $el.addClass('disabled');
        $el.attr('disabled','disabled');
      }else{
        $el.removeClass('disabled');
        $el.removeAttr('disabled');
      }
      return this;
    }
  }

  $el.on('click',function(){
    if(!self.disable()){
      $el.trigger('confirmclick');
    }
  });
}

$.fn.btn = function(options,delegate){
  if(arguments.length === 1){
    if(typeof arguments[0] === 'function'){
      delegate = arguments[0];
      options = null;
    }
  }

  options = options || {};

  if (!this.length) {
      return $(this).btn(options, delegate);
  } else {
      return this.each(function() {
          if (this.instance) return;

          this.instance = new Button(this, options);
          mixinJQueryEvent(this.instance, this);

          if (delegate) {
              delegate.call(this, this.instance);
          }
      });
  }
}
