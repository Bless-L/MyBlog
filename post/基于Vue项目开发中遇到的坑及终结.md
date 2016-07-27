基于Vue项目开发中遇到的坑及终结
=============
---

之前一直在公司忙项目，忙项目的，好歹是发布了1.0版本。终于是有时间写一个总结了。
话说我就一个实习生一进来就要做项目核心，真的有点受宠若惊，还好项目是1.0版本，先实现部分功能，访问量也不大，加上一起很好的上司带我（其实就加上我就两个人= =），完成的还算顺利。期间也学习到了很多。

项目在5月底启动，属于创业公司的业务扩展吧，IOS和安卓都有成型的版本，所以要做一个对应的移动端H5版的机票订，买票应用，入口是微信公众号，当然少不了jssdk的使用，以及balabala的授权处理等。

文章写得比较乱，基本上就是想到什么写什么，望各位大大轻喷，有不对的地方还多包含。

## **前期准备**
*****
最初是考虑用React+Redux+Webpack，前后端完全分离，但考虑到人手不足，前后端暂时做不了完全分离，然后对React也不熟悉，项目时间等问题，然后就被Boss否了。
最终用了更熟悉的Vue+Vuex+Webpack。主要还是因为更轻，API更加友好，上手速度更快，加上团队里有人熟悉，可以马上开工。

比较遗憾的是因为各种原因前后端分离还不是很彻底，前端用的是jsp模板加js渲染页面。好处是首屏数据可以放到script标签里面直出，在进度条读完的时候页面就能够渲染出来了，提高首屏渲染时间。但是调试的时候十分麻烦，因为没有Node做中间层，每次都要在本地完整地跑个服务器，不然拿不到数据。

Vue，Vuex，Vue-router，Webpack这些不了解的同学就去看看[文档][1]。MV*框架用好了真的是极大地解放生产力，特别是页面的交互十分复杂的时候。


## **项目过程中遇到的坑**
*****

**1.** 遇到的第一个的坑就是transition。因为首页有一个滑动的banner，我是直接用css3的transition配合js定时改变transform实现的。
然后在chrome中模拟没问题，ios中没问题，但是安卓中就没有滑动，百思不得其解。起初还以为是兼容性问题，搞了好久才发现需要在css中先增加一个`transform:  translateX(0)`，像下面一样，不然之后再通过js更改transform是没法在安卓中触发transition的。
```css
.slide-wp{
	transform:  translateX(0);
	-webkit-transform:  translateX(0);
	transition: transform  1.5s ease;
	-webkit-transition: transform 1.5s ease;
}
```
大家知道，transition的作用是**令CSS的属性值在一定的时间区间内平滑地过渡。**
所以个人猜测，在安卓中，当没有初始值时，`translateX`的改动没有被平滑地过渡，就是说transition并不知道`translateX`是从什么地方开始过渡的，所以也就没有平滑之说，也就没有动画了。
<br>
  
**2.** 第二个就是ES6。既然用了Webpack，当然就要配合Bebel用上ES6啦。写的时候还是很爽的。`let`，`const`，模块，箭头函数，字符串模版，对象属性简写，解构等等...但帅不过3秒，在chrome上模拟地跑一点问题都没有，一到移动端就直接白屏，页面都没有渲染出来。
排查了好久，才发现是某些扩展运算符`...`，某些解构和`for...of...`循环的问题。因为这些ES6的特性（其实不指这些）在Bebel中转换是要用到**[Symbol.iterator]**接口的。如下面这样。
转码前:
```javascript
const [a, b, c, d, e] = 'hello';
console.log(a, b, c, d, e);//'h','e','l','l','o'
```
转码后:
```javascript
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _hello = 'hello';

var _hello2 = _slicedToArray(_hello, 5);

var a = _hello2[0];
var b = _hello2[1];
var c = _hello2[2];
var d = _hello2[3];
var e = _hello2[4];

console.log(a, b, c, d, e);//'h','e','l','l','o'
```
如上面所示，第一行先声明的_slicedToArray函数用到了[Symbol.iterator]接口，然而浏览器对这个接口的支持还很有限，特别是移动端，只有Firefox Mobile36版本以上才支持，其它清一色挂掉。
如下图所示：
![博客图片][2]
所以说ES6虽好，但真要用到实际项目中的话，还不能太激进，有些特性经过Bebel转码后性能上可能还会有所下降，所以还是应该合理地使用ES6。
如果是自己折腾倒无所谓，Symbol，Class，Generator，Promise这些就随便炫技吧。
<br>
**3.** 第三个坑就是Vue使用的问题。如其说是坑，还是不如说是我自身还不够熟悉Vue。先看一下官方说明：
>受 ES5 的限制，Vue.js 不能检测到对象属性的添加或删除。因为 Vue.js 在初始化实例时将属性转为 getter/setter，所以属性必须在 data 对象上才能让 Vue.js 转换它，才能让它是响应的。

当时需要在props传来的某些对象数据中增加一个是否可视属性，用来控制一个与其关联的弹出框。增加后点击视图上一点反应都没有，但是用`console.log`打印出来发现值的确的有变化的。
也就是说，**数据的变化不能触发视图更新**。原因就是如上面所说，因为这个属性是我后来添加的，不能被Vuejs检测到。这时候需要使用[$set(key, value)][3]这个API。
话说里面的语法需要注意下，第一个参数`key`是一个字符串，是一个`keypath`，如果假如你的数据是这样:
```javascript
data(){
    visitors : [{
            "id": 1,
    	    ...
    	}, {
    	    "id": 2,
    		...
        }, {
    		"id": 3,
    		...
        }],
}
```
你需要在某次操作后`为visitiors`里面的每个对象增加一个`show`属性,则需要这样写：
```javascript
let str;
for (let i = 0 , len = this.visitors.length ; i < len; i++) {
    str = "visitors[" + i + "].show";
    this.$set(str,true);
}
```

之前真的被这东西搞了很久，明明数据变化了，视图却不更新。个人感觉新手刚使用Vue时很难发现这个问题。也怪自己对Vue，对ES5的`getter/setter`的理解还不够吧。
<br>

**4.** 第四个是IOS上的滚动问题。在某些浏览器下，例如微信内嵌浏览器，手指在屏幕上滑动时，页面会进入momentum scrolling(弹性滚动)。
这时候会停止所有的**事件响应**及**DOM操作引起的页面渲染**，onscroll事件不会触发，CSS3动画，gif这些也不会动，一直到滑动停止。
因为需要onscroll事件来执行懒加载等操作，但是在IOS中是要等到滑动停止后才能执行的，用户体验不好。当时google了很久，最终得出的结论是，并没有什么很好的解决方案。所以暂时只能在IOS上首次加载更多资源了。
贴一个在segmentfault上的答案吧，很好地总结了这个问题。（[戳这里][4]）
<br>

**5.** 第五个还是IOS上CSS3动画的问题，今天才遇到的。在对img或者设置了background-image的DOM元素设置CSS动画时，动画在刚进入页面的时候有可能不被触发，需要滑动一下屏幕动画才动，安卓下则没有问题。
刚开始还以为是没有设置初始值的问题，但感觉不应该会是这样的。后来在stackoverflow上找到了解决办法([戳这里][5])。给动画加个0.1s秒的延时
```css
animation: slide 1.5s 0.1s linear infinite;
webkit-animation: slide 1.5s 0.1s linear infinite;
```
原因大概是如果Safari和IOS的微信内置浏览器在加载资源，或者进行什么内部渲染操作时出现了短暂的停顿(英文是hiccups)，则不会触发动画，需要滑动一下页面来重新触发。所以才给动画加个0.1s延时确保资源加载完成。
<br>

## **关于Vue的组件化**
*****
先上个[@xufei][6]大大的[博客][7]，里面有多关于组件化的文章，都是满满的干货。

其实组件化是一个很庞大的话题，我这等小白的认识还十分显浅，不过既然在项目中用到了组件化，也就谈谈自己的看法吧。

Vue的组件化需要配合Webpack+vue-loader 或者 Browserify + vueify 来构建。一个.vue文件一个组件，上手了写起来是十分快捷的，不过对于新手可能就要花点时间去熟悉工具了。

进入正题吧。在看了[@xufei][6]的博客加上自己的工程实践后，表示十分赞同他的说法：
>很多人会把复用作为组件化的第一需求，但实际上，在UI层，复用的价值远远比不上分治。

特别是对于.vue这种形式的组件化来说，想做到复用往往需要做到内部实现高度抽象，并对外暴露很多接口，而复用的地方也并不是很多。很多时候，花那么多时间去实现一个组件复用，还不如新建一个组件，复制部分代码，重新进行内部实现来得更快。

要知道一个.vue文件里面除了`<template>`、`<style>`，还有`<script>`。前两者用于实现组件的样式，对于很多地方来说，可能只是有着些许差别，但`<script>`里面的东西则是代表着组件的内部逻辑实现





## **未完待续**









  [1]: http://cn.vuejs.org/guide/application.html
  [2]: https://cdn.rawgit.com/Bless-L/MyBlog/master/assets/111.png
  [3]: http://vuejs.org.cn/api/#vm-set
  [4]: https://segmentfault.com/q/1010000004453730
  [5]: http://stackoverflow.com/questions/29219534/css-animation-not-always-starting-in-ios-8-safari
  [6]: https://github.com/xufei
  [7]: https://github.com/xufei/blog/issues/6