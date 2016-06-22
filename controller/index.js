module.exports = {
  index: function*() {
    yield this.render('index', {
      "title": "koa demo"
    });
  },
  zhengzu: function*() {
    yield this.render('zhengzu');
  },
  aboutUs: function*() {
    yield this.render('aboutUs');
  },
  jiaMeng: function*() {
    yield this.render('jiaMeng');
  },
  activity: function *() {
    yield this.render('activity');
  }

}
