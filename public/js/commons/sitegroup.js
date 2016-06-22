//@require ../lib/sitegroup
//@require ../lib/btn
//@require ../lib/selectbox
//@require ../lib/switchable

$(function(){

  $('.site-group').sitegroup();

  new Switchable({
    triggers:$('.ui-tabs-trigger'),
    panels:$('.ui-tabs-panel'),
    activeIndex:1
  });
  var d;
  $.ajax({
    url:'/data/district',
    async:false,
    success:function(data){
      d = data;
    },
    error:function(){
      d = [
        {name:'西湖区',id:0},
        {name:'拱墅区',id:1},
        {name:'江干区',id:2},
        {name:'下城区',id:3},
        {name:'上城区',id:4},
        {name:'滨江区',id:5},
        {name:'萧山区',id:6},
        {name:'余杭区',id:7}
      ]
    }
  });

  $('#area').selectbox({
    defaultText:'选择区域',
    data:d,
    textField:'name',
    valueField:'id'
  });

  $('#room').selectbox({
    defaultText:'室(个数)',
    data:[
      {text:'1',value:1},
      {text:'2',value:2},
      {text:'3',value:3},
      {text:'4',value:4}
    ]
  });

  $('#board').selectbox({
    defaultText:'厅(个数)',
    data:[
      {text:'1',value:1},
      {text:'2',value:2},
      {text:'3',value:3}
    ]
  });

  $('#toilet').selectbox({
    defaultText:'卫(个数)',
    data:[
      {text:'1',value:1},
      {text:'2',value:2}
    ]
  });

  $('.checkbox').on('click',function(){
    var $this = $(this),
        index = $this.index();
    $('.checkbox').removeClass('active').eq(index).addClass('active');
  });

  //我要找房
  $('#rent .btn').btn().on('confirmclick',function(){
    var $rent = $('#rent'),
        name = $rent.find('.name').val() || '',
        phone = $rent.find('.phone').val(),
        spread = $rent.find('.spread').val() || '',
        remark = $rent.find('.remark').val() || '',
        typeName = $rent.find('.checkbox.active').find('span').text();

    if(!is_phone(phone)) return false;

    var $btn = $(this).instance();
    $btn.disable('disabled');

    $.post('/js/ZhaoFang',{
      userName:name,
      userTel:phone,
      fedbckContent: '类型:' + typeName + ' 意向价位:' + spread + ' 备注:' + remark
    },function(data){
      if(data=='true'){
        alert('提交成功，爱上租正在竭尽全力帮您找房');
      }else{
          alert(data);
      }
      $btn.disable('');
    });
  });

  //意见反馈
  $('#feedback .btn').btn().on('confirmclick',function(){
    var $feedback = $('#feedback'),
        phone = $feedback.find('.phone').val() || '',
        name = $feedback.find('.name').val() || '',
        contents = $feedback.find('.feedback-content').val() || '';

    if(!is_phone(phone)) return false;

    var $btn = $(this).instance();
    $btn.disable('disabled');

    $.post('/js/YiJianFanKui',{
      userName:name,
      userTel:phone,
      fedbckContent:contents
    },function(data){
      if(data=='true'){
        alert('提交成功，感谢反馈');
      }else{
          alert(data);
      }
      $btn.disable('');
    });
  });

  //我要出租
  $('#landlord .btn').btn().on('confirmclick',function(){
    var $landlord = $('#landlord'),
        area = $('#area').instance().selectValue(),
        name = $landlord.find('.name').val() || '',
        room = $('#room').instance().selectValue(),
        hall = $('#board').instance().selectValue(),
        toilet = $('#toilet').instance().selectValue(),
        spread = $landlord.find('.spread').val() || '',
        linkman = $landlord.find('.linkman').val() || '',
        phone = $landlord.find('.phone').val() || '';

    if(!is_phone(phone)) return false;

    var $btn = $(this).instance();
    $btn.disable('disabled');

    $.post('/js/ChuZu',{
      district:area,
      prem_name:name,
      room:room,
      hall:hall,
      toilet:toilet,
      money:spread,
      name:linkman,
      phone:phone
    },function(data){
      if(data=='true'){
        alert('提交成功，爱上租会尽快联系您');
      }else{
        alert(data);
      }
      $btn.disable('');
    });

  });

  function is_phone(val){
    if(!val){
      alert('请输入手机号码！');
      return false;
    }
    var reg = /^(((1[0-9]{1}))+\d{9})$/;
    if(!reg.test(val)){
        alert('请输入有效的手机号码！');
        return false;
    }
    return true;
  }

  $('.global-footer .btn-qrcode').hover(function(){
    $(this).find('.qrcode').fadeIn(600);
  },function(){
    $(this).find('.qrcode').fadeOut(400);
  });

  $('.feedback-link').on('click',function(){
    $('.feedback').show();
  });
});
