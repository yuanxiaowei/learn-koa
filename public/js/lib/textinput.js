//@require util

function TextInput(el,options){
  var $el = $(el),
      self = this;

  this.name = function(name){
    if(typeof name === 'undefined') {
      return $el.attr('name');
    }else{
      $el.attr('name', name);
    }
  }

  this.val = function(v){
    var placeholder = this.placeholder();
    if(typeof v === 'undefined'){
      var val = $el.val();
      if(window.isIEFix && !!placeholder){
        if(val === placeholder){
          return '';
        }
      }
      return val;
    }else {
      if(window.isIEFix && !!placeholder && $el.attr('type') === 'text'){
        v = placeholder;
      }
      $el.val(v);
    }
  }

  this.placeholder = function(v){
    if(typeof v === 'undefined'){
      return $el.attr('placeholder');
    }else{
      $el.attr('placeholder',v);
    }
  }

  this.disable = function(v){
    if(typeof v === 'undefined'){
      return $el.hasClass('disabled') || $el.attr('disabled');
    }else{
      if(!!v){
        $el.addClass('disabled');
        $el.attr('disabled','disabled');
      }else{
        $el.removeClass('disabled');
        $el.removeAttr('disabled');
      }
    }
  }

  this.error = function(v){
    if(typeof v === 'undefined'){
      return $el.hasClass('error');
    }else{
      if(!!v){
        $el.addClass('error');
      }else {
        $el.removeClass('error');
      }
    }
  }

  if(this.val() === ''){
    this.val('');
  }

  $el.on('focus blur keyup',function(e){
    var val = self.val();
    val = $.trim(val);

    if(window.isIEFix && e.type === 'focus' && !val.length){
      $el.val('');
    }else if(window.isIEFix && e.type === 'blur' && !val.length){
      self.val('');
    }

    if(!!val.length){
      $el.removeClass('placeholder');
    }else{
      $el.addClass('placeholder');
    }
  });

  if(options.name){
    this.name(options.name);
  }

  if(options.value){
    this.val(options.value);
  }

  if(options.placeholder){
    this.placeholder(settings.placeholder);
  }

}

$.fn.textinput = function(options,delegate){
  if(arguments.length === 1){
    if(typeof arguments[0] === 'function'){
      delegate = arguments[0];
      options = null;
    }
  }

  options = options || {};

  if (!this.length) {
      return $(this).textinput(options, delegate);
  } else {
      return this.each(function() {
          if (this.instance) return;

          this.instance = new TextInput(this, options);
          mixinJQueryEvent(this.instance, this);

          if (delegate) {
              delegate.call(this, this.instance);
          }
      });
  }
}
