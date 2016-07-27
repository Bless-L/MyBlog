title: 《你不知道的Javascript(上)》阅读笔记(一)
=============
---

前些日子在朋友的推荐下看了《你不知道的JavaScript（上）》，感觉真的获益良多。文章内容不多，才200页不到，可讲的都是些在Js中的重难点，以及容易遇到的坑，完全理解后会让你对Js有了新的认识，作为Js进阶书籍是非常不错的。

趁热打铁，做些笔记记录下，加深理解。

# **作用域**
书的上半部分讲了作用域和闭包，我也谈谈自己的看法。

---
### **函数作用域**
众所周知，ES5是没有块级作用域的，只有全局作用域和函数作用域。而作用域之间可以互相嵌套，内层作用域可以访问到外层作用域的变量（这其实也是闭包产生一个很重要条件），举个书中例子
```Javascript
var a = 3;
function foo(){
    var b = a * 2;
    function bar(c){
        console.log(a , b ,c)
    };
    bar(b * 3);
}

foo();//3，6，18
console.log(b);//Uncaught ReferenceError: b is not defined
```
在这个例子中可以看到，bar中其实并没有a,b这两个变量，但它会依次向上级作用域查找，最终在foo中找到了b；在全局中找到了a，并将他们打印。相反，我在全局中访问b，则会报错，因为外层的访问不了内层的。

那么再看看这个例子
```Javascript
'use strict'
var a = 3;
function foo(){
    b = a * 2;
    function bar(c){
        console.log(a , b ,c)
    };
    bar(b * 3);
}

foo();//3，6，18
console.log(b);//6
```
这段代码和第一段只有一点不同，就是b前面的var声明没有了。然而这时候我们访问b却可以得到正确结果，是因为我们可以访问到内部变量？其实不是。

前面说过，内层作用域可以访问到外层作用域的变量，所以运行foo时它会先自身里查找b，发现foo里没有（因为没有声明），然后向上层，也就是全局作用域查找，也没有。这时，Js内部会自动在全局作用域中声明b。（是的，是自动声明，也不会告诉你，这就坑的地方，会导致很多意想不到的结果）
所以，接下来就能够成功给b赋值，并且在全局访问到b，因为b本来就在全局里。

>PS：在严格模式下Js内部是不会自动声明的,如果在刚才那段代码前面加上`'use strict'` ，下面这句就会报错,因为foo中有没声明的变量b
>`foo(b);//Uncaught ReferenceError: b is not defined`


---
### **块级作用域**
语法上来说，块级作用域就是指if/else/for/while语句里2个大括号之间的部分，前面说了ES5没有块级作用域，这会导致很多莫名其妙的坑
```Javascript
function foo(){
    for(var i = 0; i < 10;i++){ 
        console.log(i); //0, 1, ..., 9 
    } 
    console.log(i); //10 
}
foo();
```
如上面所示，你可能会以为第二句`console.log(i)`会报错，因为i已经不再for循环里面访问了。其实不然，上面的代码和下面的是等价的。
```Javascript
function foo(){
    var i;
    for(i = 0; i < 10;i++){ 
        console.log(i); //0, 1, ..., 9 
    } 
    console.log(i); //10 
}
foo();
```
也就是说，在for括号中声明变量其实会先提升到当前作用域中声明，而不是属于这个语法中的'块'。

时代总是在进步的，在[ES6](http://es6.ruanyifeng.com/#docs/let#块级作用域)中已经解决了这个问题。[ES6](http://es6.ruanyifeng.com/#docs/let#块级作用域)中可以使用`let`,`const`来声明具有块级作用域的变量，并且不存在变量提升（下面会提到）
```Javascript
function foo(){
    for(let i = 0; i < 10;i++){ 
        console.log(i); //0, 1, ..., 9 
    } 
    console.log(i); //Uncaught ReferenceError: i is not defined
}
foo();
```
就是这样，用let代替var之后，就只能在for循环代码块中访问到i（也就是两个大括号包裹的部分），在外面访问则会报错。

---
### **变量提升**
不得不说，变量提升如果稍不注意的话也会引起很多坑。想起我之前做的那道笔试，满眼都是泪！！

看个例子
```Javascript
var a = 1;
function foo(){
    console.log(a);
    a = 2;
    console.log(this.a);
    var b = 3;
    console.log(b);
    var a;
    console.log(a);
}
foo();
```
大家觉得上面会依次打印出什么？`1, 2 ,3 ,undefined`?

**其实正确的打印结果是`undefined, 1, 3, 2`**
在Js中，`var`声明的变量会被提升到当前作用域的最顶部执行（函数声明也是如此，并且优先权大于变量声明）。也就是说，上面这段代码等价于
```Javascript
var a = 1;
function foo(){
    var a,b;
    console.log(a);
    a = 2;
    console.log(window.a);
    b = 3;
    console.log(b);
    console.log(a);
}
foo();
```
所以第一个会打印出`undefined`,因为`a`声明了却没有赋值；
第二打印出来的`this.a`跟`this`的绑定有关，在这里`this`是指`window`，所以打印出来的结果是全局变量`a`(书中第二部分会详细说明`this`的绑定机制，到时我也会写篇笔记)；
第三个最简单了，没什么好讲的；
第四个因为`a`在前面被赋值成了`2`，所以会打印出`2`。

书中关于作用域的部分还讲了`eval`,`with`,`try/catch`,IIFE（立即执行函数表达式）等内容，这里就不写那么多了。