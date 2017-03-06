#实现一个MVVM的思路整理

> 这几天研究了Vue的数据双向绑定原理，在网上搜了各种解读博客和看了一些MVVM的简单实现后，终于明白了其中的一些机制，由此不得不佩服作者的巧妙处理。下面简单总结一下。

###  MVVM双向绑定的简单流程

首先是思路上的明确。Vue中采用的是`Object.defineProperty()`中的`setter`，`getter`来对每个属性进行劫持，同时结合订阅者-发布者模式的方式，实现数据模版的自动更新。

简单的流程可以这样来理解：

![post-1-1](https://raw.githubusercontent.com/Bless-L/MyBlog/646fc6fd/assets/post-1-1.png)

一、MVVM编译前**新建一个`Observer`对象来拦截`data`里面的每个数据**，大概有以下几个步骤：

1. 使用闭包，让每个属性有一个各自的`Dep`对象来存放自己的依赖队列，里面是一系列的`Watcher`
2. 在`getter`中把`Watcher`添加到队列上
3. 在`setter`中让`Dep`对象触发`update`，即依次执行里面的`Watcher`
4. 视图更新的逻辑就放在`Watcher`中

这样，我们在每次更新数据的时候就是触发`setter`从而实现视图更新。

但这里有两个关键问题需要解决：

1. 编译是在`Observer`之后的，如何实现在`getter`中把`Watcher`添加到队列上？
2. 一个属性就只有一个`getter`，但却可以有多个`Watcher`依赖，如何确保准确地添加`Watcher`到队列上？




二、**新建一个`Compiler`对象进行模版编译**，大概有以下几个步骤：

1. 对每个元素节点的指令进行扫描和解析，根据指令调用相应的`handler`函数进行处理
2. 对每个属性依赖新建`Watcher`对象进行监听


三、**在MVVM实例初始化中整合流程一和流程二**



一个简单的MVVM实现流程大概就是这些步骤，下面大概介绍下具体实现思路：

![post-1-2](https://cdn.rawgit.com/Bless-L/MyBlog/646fc6fd/assets/post-1-2.png)



### Observer实现

对于第一个问题，解决也不难，我们在`Watcher`的初始化中对要监听的数据进行访问，自然就会触发到`getter`。

巧妙的地方在第二点，如何确保当前的`Watcher`能够被正确添加？在需要把自身添加到队列时，我们可以在`Dep`全局对象中设置`Dep.target`为自身，在`getter`中则进行判断是否有`Dep.target`这个属性才决定是否进行添加队列操作，看一下别人实现的一个简单版的[代码](https://github.com/qieguo2016/Vueuv/blob/master/src/Watcher.js)，留意 `get`方法里面的一段：

```javascript
//Watcher.js
var uid = 0; //避免重复添加

Watcher.prototype = {
  get: function(){
    Dep.target = this;   //把自身添加到target上
    var value = computeExpression(this.$vm, this.expOrFn);  //这里会触发到属性的getter
    Dep.target = null;   //执行完记得设为null
    return value;
  },
  ....//省略
}

//精髓在于with与eval的应用，用with指定scope作用域，然后用eval执行表达式
//其实用eval会有安全问题，而且性能上不太好，更好的解决办法是使用New Function()来动态构建函数，表达式置于函数体内
function computeExpression(scope, exp){
  try{
    with(scope){
      return eval(exp);
    }
  } catch(e){
    console.error('ERROR', e);
  }
}
```

然后是`Observer`中的`getter`里面，留意到判断到有`Dep.target`属性才添加到依赖队列中：

```javascript
Observer.prototype = {
	....//省略
    defineReactive: function(data, key, val){
		var dep = new Dep();
		var self = this;
		self.observe(val); //如果是对象则递归遍历

		Object.defineProperty(data, key, {
			enumerable: true, //可枚举遍历
			configureable: false, //不可再次配置
			get: function(){
				Dep.target && dep.addSub(Dep.target);
				return val;
			},
			set: function(newVal){
				if(val === newVal){ return; }
				val = newVal;
				self.observe(newVal);  //对新值进行遍历
				dep.notify();  //执行更新
			}
		})
	}
}
```

`Dep`里面的代码比较简单，无非就是维护一个存放`Watcher`的对象：

```javascript
function Dep(){
  this.subs = {};
}
Dep.prototype = {
  addSub: function(sub){
    //防止重复添加Watcher
    if(!this.subs[sub.uid]){
      this.subs[sub.uid] = sub;
    }
  },
  notify: function(){
    for(var uid in this.subs){
      this.subs[uid].update();
    }
  }
}
```

要知道js是单线程的，所以可以确保每次只有一个`Watcher`在调用，也就确保了它能准备地添加到它所监听变量的依赖队列上。这个做法可谓是十分巧妙，不得不佩服尤大大的厉害。

经过这样完整的一个结构，我们就已经可以简单地实现拦截变量和通知变化的功能了。



### Compiler及Watcher实现

要实现`Compiler`需要对原生的一些DOM属性和节点操作办法比较熟悉，下面以一个最简单的文本节点解析为例。

文本节点里面的表达式一般是 **{{ a + 'b' }} + 某些文字 ** 这样，对于这种字符串，我们就要转换为 **scope.a + 'b' + '某些文字'**这样的表达式来执行，可以回顾一下上面的`computeExpression`函数，下面继续看一下别人的[简单实现](https://github.com/qieguo2016/Vueuv/blob/master/src/Compiler.js)：

```javascript
//先看下parseTextExp函数，其实就是正则匹配加字符串拼接的过程
function parseTextExp(text) {
    //匹配{{ }}里面的内容
    var regText = /\{\{(.+?)\}\}/g;
    //存放其余的片段，类似'某些文字'这些
    var pieces = text.split(regText);
    var matches = text.match(regText);
    var tokens = [];
    pieces.forEach(function (piece) {
        if (matches && matches.indexOf('{{' + piece + '}}') > -1) {    // 注意排除无{{}}的情况
            tokens.push(piece);
        } else if (piece) {
            tokens.push('`' + piece + '`');
        }
    });
    //最后返回类似 scope.a + 'b' + '某些文字' 这样的字符串表达式
    return tokens.join('+');
}

function Compiler(el, vm){
	this.$el = el;
	this.$vm = vm;
	if (this.$el) {
        //转换为节点片段，提高执行效率，同时用于去除一些注释节点，空文本节点等
		this.$fragment = nodeToFragment(this.$el);
		this.compiler(this.$fragment);
		this.$el.appendChild(this.$fragment);
	}
}
Compiler.prototype = {
	//分两类，元素节点和文本节点，同时进行递归
	compiler: function(node, scope){
		var childs = [].slice.call(node.childNodes);
		childs.forEach(function(child){
			if (child.nodeType === 1) {
				this.compileElementNode(child, scope);
			}else if(child.nodeType === 3){
				this.compileTextNode(child, scope);
			}
		}.bind(this))
	},
	compileTextNode: function(textNode, scope){
		var text = textNode.textContent.trim();
		if(!text) return;

		//将文本中的{{a + 'bbb'}} asdsd 转换成 scope.a + 'bbb' + asdsd 的形式
		var exp = parseTextExp(text);
		scope = scope || this.$vm;

		this.textHandler(textNode, exp, scope);
	},
  	textHandler: function(textNode, exp, scope){
        //增加一个Watcher依赖
		new Watcher(scope, exp, function(newVal){
			textNode.textContent = !newVal ? '' : newVal ;
		})
	},
    ....//省略
}
```

先转换成`fragment`，然后对于文本节点，直接解析并转换里面的内容，然后增加一个`Watcher`依赖。我们再看一下`Watcher`里面的代码

```javascript
function Watcher(vm, expOrFn, cb){
  this.uid = uid++;
  this.$vm = vm;
  this.expOrFn = expOrFn;
  this.value = null;
  this.cb = cb;
  this.update(); //初始化时就先执行一次cb函数
}
Watcher.prototype = {
  get: function(){
    Dep.target = this;
    var value = computeExpression(this.$vm, this.expOrFn);
    Dep.target = null;
    return value;
  },
  update: function(){
    //此处会调用getter，将Watcher添加到对应属性的dep队列里面
    var newVal = this.get();
    if(newVal !== this.value){
      this.cb.call(this.$vm, newVal, this.value);
      this.value = newVal;
    }
  }
}
```

可以看到，在`Watcher`初始化时便自动添加到依赖队列中，同时也得到了经过首次解析后的表达式的值，并存放在`this.value`中，而且还执行了回调，触发了视图更新。

这是最简单的文本节点的解析，对于像`v-for`、`v-if`、`v-model`等其他较为复杂的指令都有其相应的处理办法，并且有些指令的实现是十分有趣的，详情可以阅读文章最后的Reference，我就不复制粘贴了。



### MVVM实例化

有了前两部分的实现，这里的实例化就显得简单很多了，继续看[代码](https://github.com/qieguo2016/Vueuv/blob/master/src/Vueuv.js):

```javascript
function MVVM(options){
  this.$options = options;
  //先提取根节点
  this.$el = typeof options.el === 'string'
    ? document.querySelector(options.el)
  : options.el || document.body;

  var data = this._data = this.$options.data;
  
  //Observer所有数据
  var ob = new Observer(this._data);
  if(!ob) return;
  
  //对data里面的数据代理到实例上
  Object.keys(data).forEach(function(key){
    this._proxy(key);
  }.bind(this))
  
  //模版编译
  new Compiler(this.$el, this);
}

MVVM.prototype = {
  _proxy: function(key){
    var self = this;
    Object.defineProperty(self, key, {
      configureable: false,
      enumerable: true,
      get: function(){
        return self._data[key];
      },
      set: function(val){
        self._data[key] = val;
      }
    })
  },
  $watch: function(expOrFn, cb){
    new Watcher(this, expOrFn, cb);
  }
}
```

正如前面所说，这里只需要把`Observer`和`Compiler`整合一下就可以了。需要注意的是这里实现了一个代理，因为它的数据是挂载在`vm._data`上的，假如我们要改变数据的值，则要用`vm._data.a = xxx` 这样的方式来改变，这样显示是不符合我们期望的，我们希望可以直接用`vm.a = xxx` 这样的方式来改变数据的值。

所以我们增加了一个`_proxy`函数，其实主要还是用`Object.defineProperty()`这个方法来拦截类似`vm.a`这样的属性，使它变成返回和设置`vm._data.a`上的值。至此，一个简单版的MVVM变完全实现了。



### 总结

首先需要说明的是上面的代码基本上都是各种博客或者源码里面的，我这里主要是分析其实现思路。当然我自己也照着这些代码仿造了一个，但其实代码内容大同小异，就没必要贴上来了。

写这篇文章的目的主要是让自己明白一个流行的轮子是大概是基于怎样的思路造出来的，旨在提升一下撸码水平。如有不妥的地方大家一起探讨。

关于Vue2.0的源码其实还有非常多值得学习的地方，例如`virtual dom`及其`diff`算法实现，各种正则的巧妙运用，`transition`过渡指令集的实现等。可惜本人水平有限，还不能完全参透其原理，看以后有没机会解读。最后，感谢大家的阅读！

Reference：

1. [不造个轮子，你还真以为你会写代码了？](https://zhuanlan.zhihu.com/p/24435564)
2. [剖析vue实现原理，自己动手实现mvvm](https://github.com/DMQ/mvvm#_2)
3. [滴滴商业FED-Vue源码解读](https://defed.github.io/categories/Vue/)
4. [Vue2.0](http://cn.vuejs.org/v2/guide/index.html)

