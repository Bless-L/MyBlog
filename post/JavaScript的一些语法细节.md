avaScript的一些语法细节
=============
---

 - 字符串加数字时，数字会转换为字符串，字符串减数字时，字符串会转换为数字
 - typeof(null) === “object”
 - Function、Array、Date均是继承于Object
 - new 一个函数并赋给一个对象时，此对象的原型为该函数的prototype对象
    例如：
```javascript
	var obj = new foo();
	//相当于
	var obj = {};
	obj.__proto__ = foo.prototype;
```	
 - 对象里的key都是字符串

 - setTimeout中，如果回调函数使用匿名函数，则作用域为全局作用域，其this指向window，如果只是代码段，则作用域为当前执行的作用域。

	例如：
```javascript
	var x=1;
	foo = function(){
  		this.x=2;
		this.set =function(){
		    setTimeout(console.log(this.x),0)
			}
			this.sett = function(){
			setTimeout(function(){
			    console.log(this.x)
			},1000)
		}
	}
	var f = new foo();
	f.set(); //输出2
	f.sett();//输出1
```

 - 可以利用Array的length属性来增删数组的元素

 - Array的reverse、splice、sort方法会修改原数组。sort方法是按字符大小进行排序的，即按照字母表顺序（大写在小写前面），所以数组里的数字排序后不一定是从大到小排列

 - 函数声明会被提前执行，函数表达式不会

 - 对函数里的arguments属性，如果没有传参的话，arguments属性是不能修改其值的

 - 闭包的闭其实就是对外部变量的封闭，可以简单把闭包理解为被返回的引用了外部变量的函数。闭包主要优点有灵活与便捷，可以封装，但缺点是可能会造成内存浪费，内存泄漏，性能消耗。

 - JavaScript实现类继承的主要方式是原型继承。

    方法一：new一个父类对象并把它赋值给子类对象的prototype 属性。
    方法二：运用Object.create方法和constructor方法，缺点是ES5才支持。
 - 原型链是指一个对象的__proto__会指向上一级对象的prototype属性，并最终指向null。