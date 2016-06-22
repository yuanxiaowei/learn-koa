var controller = require('../controller/index');
module.exports = function(app){
    //首页
    app.get('/',controller.index);
    //整租
    app.get('/zhengzu/',controller.zhengzu);
    //加盟
    app.get('/jiaMeng',controller.jiaMeng);
    //爱上活动
    app.get('/activity',controller.activity);
    //关于我们
    app.get('/aboutUs',controller.aboutUs);
};
