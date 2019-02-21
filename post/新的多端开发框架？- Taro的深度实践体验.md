> 来自团队支持 TOPLIFE小程序 业务的小伙伴，关于 Taro 的一篇使用感受，希望对大家有所帮助。

##前言

前阵子，来自我们凹凸实验室的遵循 [React](https://reactjs.org/) 语法规范的**多端开发方案** - [Taro](https://github.com/NervJS/taro) 终于对外开源了，欢迎围观[star](https://github.com/NervJS/taro)（先打波广告）。作为第一批使用了 [Taro](https://github.com/NervJS/taro) 开发的TOPLIFE小程序的开发人员之一，自然是走了不少弯路，躺了不少坑，也帮忙找过不少bug。现在项目总算是上线了，那么，也是时候给大家总结分享下了。



##与WePY比较

当初开发TOPLIFE第一期的时候，用的其实是[WePY](https://github.com/Tencent/wepy)（那时Taro还没有开发完成），然后在第二期才全面转换为用 [Taro](https://github.com/NervJS/taro) 开发。作为两个小程序开发框架都使用过，并应用在生产环境里的人，自然是要比较一下两者的异同点。

#### 相同点

- 组件化开发
- npm包支持
- ES6+特性支持，[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)，[Async Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)等
- CSS预编译器支持，Sass/Stylus/PostCSS等
- 支持使用Redux进行状态管理
- …..

相同的地方也不用多说什么，都2018年了，这些特性的支持都是为了让小程序开发变得更现代，更工程化，重点是区别之处。

####不同点

- 开发风格
- 实现原理
- WePY支持slot，Taro暂不支持直接渲染children



**开发风格**

最大的不同之处，自然就是开发风格上的差异，[WePY](https://github.com/Tencent/wepy)使用的是类Vue开发风格， [Taro](https://github.com/NervJS/taro) 使用的是类 [React](https://reactjs.org/) 开发风格，可以说开发体验上还是会有较大的区别。贴一下官方的demo简单阐述下。

**WePY demo**

```javascript
<style lang="less">
    @color: #4D926F;
    .userinfo {
        color: @color;
    }
</style>
<template lang="pug">
    view(class='container')
        view(class='userinfo' @tap='tap')
            mycom(:prop.sync='myprop' @fn.user='myevent')
            text {{now}}
</template>

<script>
    import wepy from 'wepy';
    import mycom from '../components/mycom';

    export default class Index extends wepy.page {
        
        components = { mycom };
        data = {
            myprop: {}
        };
        computed = {
            now () { return new Date().getTime(); }
        };
        async onLoad() {
            await sleep(3);
            console.log('Hello World');
        }
        sleep(time) {
            return new Promise((resolve, reject) => setTimeout(resolve, time * 1000));
        }
    }
</script>
```

**Taro demo**

```javascript
import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'

export default class Index extends Component {
  constructor () {
    super(...arguments)
    this.state = {
      title: '首页',
      list: [1, 2, 3]
    }
  }

  componentWillMount () {}

  componentDidMount () {}

  componentWillUpdate (nextProps, nextState) {}

  componentDidUpdate (prevProps, prevState) {}

  shouldComponentUpdate (nextProps, nextState) {
    return true
  }

  add = (e) => {
    // dosth
  }

  render () {
    return (
      <View className='index'>
        <View className='title'>{this.state.title}</View>
        <View className='content'>
          {this.state.list.map(item => {
            return (
              <View className='item'>{item}</View>
            )
          })}
          <Button className='add' onClick={this.add}>添加</Button>
        </View>
      </View>
    )
  }
}
```

可以见到在 WePY 里，`css`、`template`、`script`都放在一个wpy文件里，`template`还支持多种模板引擎语法，然后支持`computed`、`watcher`等属性，这些都是典型的Vue风格。

而在 Taro 里，就是彻头彻尾的React风格，包括`constructor`，`componentWillMount`、`componentDidMount`等各种 React 的生命周期函数，还有`return`里返回的`jsx`，熟悉 React 的人上手起来可以说是非常快了。

除此之外还有一些细微的差异之处：

- WePY里的模板，或者说是`wxml`，用的都是小程序里原生的组件，就是小程序文档里的各种组件；而Taro里使用的每个组件，都需要从`@tarojs/components`里引入，包括`View`，`Text`等基础组件（这种做其实是为了转换多端做准备）
- 事件处理上
  - Taro 中，是用`click`事件代替`tap`事件
  - WePY使用的是简写的写法@+事件；而Taro则是on+事件名称
  - 阻止冒泡上WePY用的是@+事件.stop；而Taro则是要显式地使用`e.stopPropagation()`来阻止冒泡
  - 事件传参WePY可以直接在函数后面传参，如`@tap="click({{index}})"`；而Taro则是使用`bind`传参，如`onClick={this.handleClick.bind(null, params)}`
- WePY使用的是小程序原生的生命周期，并且组件有`page`和`component`的区分；Taro 则是自己实现了类似React 的生命周期，而且没有`page`和`component`的区分，都是`component`

总的来说，毕竟是两种不同的开发风格，自然还是会有许多大大小小的差异。在这里与当前很流行的小程序开发框架之一[WePY](https://github.com/Tencent/wepy)进行简单对比，主要还是为了方便大家更快速地了解 [Taro](https://github.com/NervJS/taro) ，从而选择更适合自己的开发方式。



##实践体验

[Taro](https://github.com/NervJS/taro) 官方提供的 [demo](https://nervjs.github.io/taro/tutorial.html#%E9%A1%B5%E9%9D%A2) 是很简单的，主要是为了让大家快速上手，入门。那么，当我们要开发偏大型的项目时，应该如何使用 [Taro](https://github.com/NervJS/taro) 使得开发体验更好，开发效率更高？作为深度参与TOPLIFE小程序开发的人员之一，谈一谈我的一些实践体验及心得

####如何组织代码

使用taro-cli生成模板是这样的

```
├── dist                   编译结果目录
├── config                 配置目录
|   ├── dev.js             开发时配置
|   ├── index.js           默认配置
|   └── prod.js            打包时配置
├── src                    源码目录
|   ├── pages              页面文件目录
|   |   ├── index          index页面目录
|   |   |   ├── index.js   index页面逻辑
|   |   |   └── index.css  index页面样式
|   ├── app.css            项目总通用样式
|   └── app.js             项目入口文件
└── package.json
```

假如引入了redux，例如我们的项目，目录是这样的

```
├── dist                   编译结果目录
├── config                 配置目录
|   ├── dev.js             开发时配置
|   ├── index.js           默认配置
|   └── prod.js            打包时配置
├── src                    源码目录
|   ├── actions            redux里的actions
|   ├── asset              图片等静态资源
|   ├── components         组件文件目录
|   ├── constants          存放常量的地方，例如api、一些配置项
|   ├── reducers           redux里的reducers
|   ├── store              redux里的store
|   ├── utils              存放工具类函数
|   ├── pages              页面文件目录
|   |   ├── index          index页面目录
|   |   |   ├── index.js   index页面逻辑
|   |   |   └── index.css  index页面样式
|   ├── app.css            项目总通用样式
|   └── app.js             项目入口文件
└── package.json
```

TOPLIFE小程序整个项目大概3万行代码，数十个页面，就是按上述目录的方式组织代码的。比较重要的文件夹主要是`pages`、`components`和`actions`。

- **pages**里面是各个页面的入口文件，简单的页面就直接一个入口文件可以了，倘若页面比较复杂那么入口文件就会作为组件的聚合文件，`redux`的绑定一般也是在这里进行。

- 组件都放在**components**里面。里面的目录是这样的，假如有个`coupon`优惠券页面，在`pages`自然先有个`coupon`，作为页面入口，然后它的组件就会存放在`components/coupon`里面，就是**components**里面也会按照页面分模块，公共的组件可以建一个`components/public`文件夹，进行复用。

  这样的好处是页面之间**互相独立**，**互不影响**。所以我们几个开发人员，也是按照页面的维度来进行分工，互不干扰，大大提高了我们的开发效率。

- **actions**这个文件夹也是比较重要，这里处理的是拉取数据，数据再处理的逻辑。可以说，数据处理得好，流动清晰，整个项目就成功了一半，具体可以看下面***更好地使用redux***的部分。如上，假如是`coupon`页面的`actions`，那么就会放在`actions/coupon`里面，可以再一次见到，所有的模块都是以页面的维度来区分的。

除此之外，**asset**文件用来存放的静态资源，如一些icon类的图片，但建议不要存放太多，毕竟程序包有限制。而**constants**则是一些存放常量的地方，例如`api`域名，配置等等。

只要按照上述或类似的代码组织方式，遵循规范和约定，开发大型项目时不说能提高多少效率，至少顺手了很多。



####更好地使用redux

redux大家应该都不陌生，一种状态管理的库，通常会搭配一些中间件使用。我们的项目主要是用了`redux-thunk`和`redux-logger`中间件，一个用于处理异步请求，一个用于调试，追踪`actions`。

#####数据预处理

相信大家都遇到过这种时候，接口返回的数据和页面显示的数据并不是完全对应的，往往需要再做一层预处理。那么这个业务逻辑应该在哪里管理，是组件内部，还是`redux`的流程里？

举个例子：

![mage-20180612151609](https://img12.360buyimg.com/ling/jfs/t20566/340/1153102937/61890/afd4185/5b20ed58N0c3a6a56.png)



例如上图的购物车模块，接口返回的数据是

```javascript
{
	code: 0,
	data: {
        shopMap: {...}, // 存放购物车里商品的店铺信息的map
        goods: {...}, // 购物车里的商品信息
        ...
	}
	...
}
```

对的，购车里的商品店铺和商品是放在两个对象里面的，但视图要求它们要显示在一起。这时候，如果直接将返回的数据存到`store`，然后在组件内部`render`的时候东拼西凑，将两者信息匹配，再做显示的话，会显得组件内部的逻辑十分的混乱，不够纯粹。

所以，我个人比较推荐的做法是，在接口返回数据之后，直接将其处理为与页面显示对应的数据，然后再`dispatch`处理后的数据，相当于做了一层拦截，像下面这样：

```javascript
const data = result.data // result为接口返回的数据
const cartData = handleCartData(data) // handleCartData为处理数据的函数
dispatch({type: 'RECEIVE_CART', payload: cartData}) // dispatch处理过后的函数

...
// handleCartData处理后的数据
{
    commoditys: [{
        shop: {...}, // 商品店铺的信息
        goods: {...}, // 对应商品信息
    }, ...]
}
```

可以见到，处理数据的流程在render前被拦截处理了，将对应的商品店铺和商品放在了一个对象了.

这样做有几个好处

- 一个是组件的渲染**更纯粹**，在组件内部不用再关心如何将数据修修改改而满足视图要求，**只需关心组件本身的逻辑**，例如点击事件，用户交互等

- 二是数据的流动**更可控**，假如后续后台返回的数据有变动，我们要做的只是改变`handleCartData`函数里面的逻辑，不用改动组件内部的逻辑。

  ***后台数据——>拦截处理——>期望的数据结构——>组件***

实际上，不只是后台数据返回的时候，其它数据结构需要变动的时候都可以做一层数据拦截，拦截的时机也可以根据业务逻辑调整，重点是要让组件内部本身不关心**数据与视图是否对应，只专注于内部交互的逻辑**，这也很符合`React`本身的初衷，数据驱动视图。

#####connect可以做更多的事情

`connect`大家都知道是用来连接`store`、`actions`和组件的，很多时候就只是根据样板代码复制一下，改改组件各自的`store`、`actions`。实际上，我们还可以做一些别的处理，例如：

```javascript
export default connect(({
  cart,
}) => ({
  couponData: cart.couponData,
  commoditys: cart.commoditys,
  editSkuData: cart.editSkuData
}), (dispatch) => ({
  // ...actions绑定
}))(Cart)

// 组件里
render () {
	const isShowCoupon = this.props.couponData.length !== 0
    return isShowCoupon && <Coupon />
}
```

上面是很普通的一种`connect`写法，然后`render`函数根据`couponData`里是否数据来渲染。这时候，我们可以把`this.props.couponData.length !== 0`这个判断丢到`connect`里，达成一种`computed`的效果，如下：

```javascript
export default connect(({
  cart,
}) => {
  const { couponData, commoditys, editSkuData  } = cart
  const isShowCoupon = couponData.length !== 0
  return {
    isShowCoupon,
    couponData,
    commoditys,
    editSkuData
}}, (dispatch) => ({
  // ...actions绑定
}))(Cart)

// 组件里
render () {
    return this.props.isShowCoupon && <Coupon />
}
```

可以见到，在`connect`里定义了`isShowCoupon`变量，实现了根据`couponData`来进行`computed`的效果。

实际上，这也是一种数据拦截处理。除了`computed`，还可以实现其它的功能，具体就由各位看官自由发挥了。



####项目感受

要说最大的感受，就是在开发的过程中，**有时会忘记了自己在写小程序，还以为是在写React页面**。是的，有次我想给页面绑定一个滚动事件，才醒悟根本就没有`doucment.body.addEventListener`这种东西。在使用`WePY`过程中，那些奇奇怪怪的语法还是时常提醒着我这是小程序，不是h5页面，而在用`Taro`的时候，这个差异化已经被消磨得很少了。尽管还是有一定的[限制](https://nervjs.github.io/taro/best-practice.html)，但我基本上就是用开发React的习惯来使用`Taro`，可以说极大地提高了我的开发体验。



##一些需要注意的地方

那`Taro`，或者是小程序开发，有没有什么要注意的地方？当然有，走过的弯路可以说是非常多了。

##### 页面栈只有10层

估计是每个页面的数据在小程序内部都有缓存，所以做了10层的限制。带来的问题就是假如页面存在循环跳转，即A页面可以跳到B页面，B页面也可以跳到A页面，然后用户从A进入了B，想返回A的时候，往往是直接在B页面里点击跳转到A，**而不是点返回**回到A，如此一来，10层很快就突破了。所以我们自己对`navigateTo`函数做了一层封装，防止溢出。

##### 页面内容有缓存

上面说到，页面内容有缓存。所以假如某个页面是根据不同的数据渲染视图，新渲染时会有上一次渲染的缓存，导致页面看起来有个闪烁的变化，用户体验非常不好。其实解决的办法也很简单，每次在`componentWillUnmount`生命周期中清理一下当前页面的数据就好了。小程序说到底不是h5，不会说每次进入页面就会刷新，也不会离开就销毁，刷新，清理数据的动作都需要自己再生命周期函数里主动触发。

##### 不能随时地监听页面滚动事件

页面的滚动事件只能通过`onPageScroll`来监听，所以当我想在组件里进监听操作时，要将该部分的逻辑提前到`onPageScroll`函数，提高了抽象成本。例如我需要开发一个滚动到某个位置就吸顶的`tab`，本来可以在`tab`内部处理的逻辑被提前了，减少了其可复用性。

#####Taro开发需要注意的地方

本来也想详细描述下的，不过在我们几位大佬的努力，加班加点下，已经开发出eslint插件，及补充完整了 Taro [文档](https://nervjs.github.io/taro/)。大家只要遵循eslint插件规范，查看文档，应该不会有太大问题，有问题欢迎提[issue](https://github.com/NervJS/taro/issues)。



##总结

总的来说，用 [Taro](https://github.com/NervJS/taro) 来开发小程序体验还是很不错的，最重要的是，可以使用jsx写小程序了！！！作为React粉的一员，可以说是相当的兴奋了~





