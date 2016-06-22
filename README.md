#ishangzu-frontend官网前端项目

## 脚手架

### 安装npm依赖

```
> npm install
```

如果访问npm太慢，可以先安装淘宝的cnpm工具，通过cnpm访问淘宝的npm镜像：

```
> npm install cnpm -g
> cnpm install
```

### 编译开发环境

```
> gulp dev
```

### 编译发布环境

```
> gulp build
```

## 项目规范

### css

  - 每个页面有且仅有一个`*.less`文件，存放在`src/css`目录下。
  - 所有需要import的less文件，都存放在`src/css/includes`目录下，并注意命名是否有冲突。
  - 用标准的import语法来处理的依赖。

### js

  - 每个页面有且仅有一个`*.app.js`, 存放在`src/js`目录下。
  - 用`\\@require *`的语法处理依赖。
