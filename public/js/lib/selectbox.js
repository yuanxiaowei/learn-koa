//@require util

function Selectbox(el,options){
  var $el = $(el),
      self = this;

  this.render = function(){
    var itemList = [],
        data = options.data;
    for(var i=0; i< data.length;i++){
        itemList.push('<li '+ (i === options.selectIndex ? 'class="selected"' : '' )  +' data-value="'+ data[i][options.valueField] +'"><a>'+ data[i][options.textField] +'</a></li>');
    }
    var str = '<div class="selectText">' +
                  '<span class="text" data-select-value="">' + options.defaultText +'</span>' +
                  '<span class="icon icon-triangle"></span>' +
                '</div>' +
                '<ul>' +
                    itemList.join('') +
                '</ul>';
    $el.html(str);
  }

  this.select = function(v){
    if(typeof v === 'undefined'){
      return $el.find('.selectText .text').html();
    }else if(!this.disable()){
      $el.find('ul li').each(function(){
        var item = $(this),
            text = item.text(),
            value = item.attr('data-value');
            if(text === v && !item.hasClass('selected')){
              item.addClass('selected');
              $el.find('.selectText .text').html(v).attr('data-select-value',value);
              $el.trigger('selected');
            }else{
              $(this).removeClass('selected');
            }
      });
    }
  }

  this.updateModel = function(data,defaultData){
    var itemList = [],
        selectIndex = 0;
    if(defaultData){
      var f = '<li data-select-value="'+ defaultData.value +'"><a>'+ defaultData.text +'</a></li>';
      itemList.push(f);
    }
    for (var i = 0,len = data.length; i < len; i++) {
      itemList.push('<li data-value="'+ data[i][options.valueField] +'"><a>'+ data[i][options.textField] +'</a></li>')
    }

    $el.find('ul').html(itemList.join(''));
    this.selectIndex(0);
  }

  this.selectValue = function(v){
    if(typeof v === 'undefined'){
      return $el.find('.selectText .text').attr('data-select-value');
    }else if(! this.disable()){
      $el.find('ul li').each(function(){
        var item = $(this),
            text = item.text(),
            value = item.attr('data-value');
        if(value === v && !item.hasClass('selected')){
          item.addClass('selected');
          $el.find('.selectText .text').html(v).attr('data-select-value',value);
          $el.trigger('selected');
        }else if(text !== v && item.hasClass('selected')){
          $(this).removeClass('selected');
        }
      });
    }
  }

  this.selectIndex = function(v){
    if(!!this.disable()) return;

    var index;
    $el.find('ul li').each(function(i){
      var item = $(this),
          value = item.attr('data-value');

      if(typeof v === 'undefined'){
        if(item.hasClass('selected')){
          index = i;
        }
      }else{
        if(i === v && !item.hasClass('selected')){
          item.addClass('selected');
          $el.find('.selectText .text').html(item.html()).attr('data-select-value',value);
          $el.trigger('selected');
        } else if (i !== v && item.hasClass('selected')) {
          item.removeClass('selected');
        }
      }
    });
    return  index;
  }

  this.data = function(data){
    var fragment = document.createDocumentFragment();
    data.forEach(function(d,i){
      var li = document.createElement('li');
      li.innerHTML = d;
      fragment.appendChilde(li);
    });

    $el.find('ul').html('').append(fragment);
    this.selectIndex(0);
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
    }
  }

  this.render();

  $el.on('click',function(e){
    if(!self.disable()){
      if(e.target.tagName.toUpperCase() !== 'A'){
        if($el.hasClass('actived')){
          $el.removeClass('actived');
        }else{
          $el.addClass('actived');
        }
      }
    }
  });

  // $el.on('mouseenter',function(){
  //   $el.addClass('actived');
  // });
  //
  $el.on('mouseleave',function(){
    $el.removeClass('actived');
  });


  $el.on('click','a',function(e){
    var $this = $(this),
        parent = $this.parent();
    if(!parent.hasClass('selected')){
      var text = $this.html();
      self.select(text);
    }
    $el.removeClass('actived');
  });

  return this;

}

$.fn.selectbox = function(options,delegate){
  if(arguments.length === 1){
    if(typeof arguments[0] === 'function'){
      delegate = arguments[0];
      options = null;
    }
  }

  options = $.extend({
    textField:'text',
    valueField:'value'
  },options);

  if (!this.length) {
      return $(this).selectbox(options, delegate);
  } else {
      return this.each(function() {
          if (this.instance) return;

          this.instance = new Selectbox(this, options);
          mixinJQueryEvent(this.instance, this);

          if (delegate) {
              delegate.call(this, this.instance);
          }
      });
  }
}
