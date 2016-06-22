//@require util

function Switchable(options){
  var opts = {
    autoplay:false,
    interval:5e3,
    timer:null,
    step:0,
    activeIndex:0
  }

  opts = $.extend(opts,options);

  this.init = function() {
    this.panels = opts.panels;
    this.triggers = opts.triggers;
    this.activeIndex = opts.activeIndex;
    this.interval = opts.interval;
    this.timer = opts.timer;
    this._initPanels();
    this._initTriggers();

    if(opts.autoplay){
      this.autoPlay();
    }
  }

  this._initPanels = function(){
    var activeIndex = this.activeIndex;
    this.step =  this.panels.length;
    this.panels.hide().eq(activeIndex).show();
  }

  this._initTriggers = function(){
    var activeIndex = this.activeIndex;
    var that = this;
    if(this.triggers){
      this.triggers.removeClass('active').eq(activeIndex).addClass('active');
      this.triggers.click(function(){
        var $this = $(this),
            index = $this.index();
        that.triggers.removeClass('active').eq(index).addClass('active');
        that.switchTo(index);
      });
    }
  }

  this.prev = function(){
    var activeIndex = this.activeIndex,
        toIndex;

    if(activeIndex == 0){
      toIndex = (this.step-1);
    }else{
      toIndex = activeIndex -1;
    }

    this.switchTo(toIndex);
  }

  this.next = function(){
    var activeIndex = this.activeIndex,
        toIndex;
    if(activeIndex == (this.step -1)){
      toIndex = 0;
    }else{
      toIndex = activeIndex + 1;
    }

    this.switchTo(toIndex);
  }

  this.switchTo = function(toIndex){
    this.panels.hide().eq(toIndex).show();
    this.activeIndex = toIndex;
  }

  this.autoPlay = function(){
    var that = this,
        interval = this.interval;

    this.paused();
    this.timer = setInterval(function(){
        that.next();
    },interval);
  }

  this.paused = function() {
    if(this.timer){
        clearTimeout(this.timer);
        this.timer = null;
    }
  }

  this.init();

}
