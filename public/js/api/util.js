//@require ../lib/promise

function request(options){
  var defer = Promise.defer(),
      METHOD = 'GET';

  function handler(ret){
    var errorMsg;

    if(ret.sysCode === 1){
      if(ret.errorMsg){
        errorMsg = ret.errorMsg;
      }
    } else {
      errorMsg = ret.errorMsg || (ret.sysCode === 0 ? '系统错误':'未知错误');
    }

    if(errorMsg){
      options.failure && options.failure(errorMsg);
      defer && defer.reject(errorMsg);
    }else {
      options.success && options.success(ret.data || {});
      defer && defer.resolve(ret.data || {});
    }
    return;
  }


  $.ajax({
    url:options.url,
    type:options.method || METHOD,
    data:options.data || {},
    success:handler,
    failure:handler,
    complete:function(){
      if(options.complete){
        options.complete.apply(this,arguments);
      }
    }
  });


  if(defer){
    return defer.promise;
  }
}

function register(url,method,paramNames,globalComplete){
  return function(params){
    var data = {};
    $.each(paramNames,function(index,paramName){
      if(params[paramName]){
        data[paramName] = params[paramName];
      }
    });

    return request({
      url:url,
      method:method,
      data:data,
      complete:function(){
        if(globalComplete){
          globalComplete.apply(this,arguments);
        }
      }
    });
  }
}
