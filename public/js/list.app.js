//@require gallery/jquery/jquery
//@require lib/lazyload
//@require commons/sitegroup
//@require commons/header

$(function(){

  $('.btn-term').on('click',function(){
    var $this = $(this);

    if($this.hasClass('down')){
      $('.term-wrap .more').show();
      $this.removeClass('down').addClass('up');
    }else{
      $('.term-wrap .more').hide();
      $this.removeClass('up').addClass('down');
    }
  });

  $('.custom .textinput').on('focus',function(){
    $('.custom .btn').show();
  });

});
