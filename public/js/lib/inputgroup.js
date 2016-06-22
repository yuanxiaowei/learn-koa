//@require util
//@require textinput

function InputGroup(el,options){
  var $el = $(el),
      $input = $el.find('.textinput').textinput(),
      $action = $el.find('.action'),
      self = this;

  this.val = function(v){
    if(typeof v === 'undefined'){
      return $input.val();
    }else {
      $input.val(v);
    }
  }

  this.placeholder = function(v){
    if(typeof v === 'undefined'){
      return $input.instance().placeholder();
    }else{
      $input.instance().placeholder(v);
    }
  }

  this.disable = function(v){
    if(typeof v === 'undefined'){
      return $el.hasClass('disabled');
    }else{
      if(!!v){
        $el.addClass('disabled');
      }else{
        $el.removeClass('disabled');
      }
      $input.instance().disable(v);
    }
  }

  this.error = function(v){
    if(typeof v === 'undefined'){
      return $el.hasClass('error');
    }else{
      if(!!v){
        $el.addClass('error');
      }else{
        $el.removeClass('error');
      }
      $input.instance().error(v);
    }
  }

  $input.on('focus',function(){
    $el.addClass('actived');
  }).on('blur',function() {
    $el.removeClass('actived');
  });

  $input.on('keypress',function(e){
    if(e.charCode === 13 && self.val() !== '' &&
          !e.altKey && !e.ctrlKey && !e.shiftKey){
      $el.trigger('submit');
    }
  });

  $action.on('click',function(){
    if(!self.disable()){
      $el.trigger('submit');
    }
  });

  if(options.value){
    this.val(options.value);
  }

  if(options.placeholder){
    this.placeholder(settings.placeholder);
  }
}

$.fn.inputgroup = function(options,delegate){
  if(arguments.length === 1){
    if(typeof arguments[0] === 'function'){
      delegate = arguments[0];
      options = null;
    }
  }

  options = options || {};

  if (!this.length) {
      return $(this).inputgroup(options, delegate);
  } else {
      return this.each(function() {
          if (this.instance) return;

          this.instance = new InputGroup(this, options);
          mixinJQueryEvent(this.instance, this);

          if (delegate) {
              delegate.call(this, this.instance);
          }
      });
  }
}
