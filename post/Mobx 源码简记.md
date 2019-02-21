## Mobx 源码简记

整体会写得比较乱，同时也比较简单，和读书笔记差不多，基本是边读边写。见谅~

主要三大部分`Atom`、`Observable`、`Derivation`



### Atom

Mobx的原子类，能够被观察和通知变化，observableValue继承于Atom。**observableValue ---> Atom**

同时里面有几个比较重要的属性与方法。

- 属性
  - observers，用于存放这个被原子类被谁观察了，是一个set结构
  - diffValue，后续更新依赖的时候要用这个来判断
- 方法
  - reportObserved，调用全局的reportObserved函数，通知自身被观察了
  - reportChanged，调用全局的propagateChanged函数，通知自身发生变化了



### Observable

Observable是一个工厂函数，让数据变得可观察。这个东西需要和上述的**Atom**建立联系，即将具体的**值**与**Atom**联系起来。从而打通自身能够被观察，同时能通知变化的整个流程。

三种可被观察的数据类型：对象，数组，Map，下面简单介绍如何实现。假如都不是，就会提示用户调用observable.box，使其拥有get，set方法，即上述说的**observableValue**数据类型。

部分代码如下：

```javascript
fucntion Observable(v) {
    // 如果已被观察，直接返回
    if (isObservable(v)) return v

    // 根据其类型分别调用observable.object、observable.array、observable.map
    const res = isPlainObject(v)
        ? observable.object(v, arg2, arg3)
        : Array.isArray(v)
            ? observable.array(v, arg2)
            : isES6Map(v)
                ? observable.map(v, arg2)
                : v

    // 返回被观察过的东西
    if (res !== v) return res
    
    // 都不是，提示用户调用observable.box(value)
    fail(
        process.env.NODE_ENV !== "production" &&
            `The provided value could not be converted into an observable. If you want just create an observable reference to the object use 'observable.box(value)'`
    )
}
```

重点是observable.object、observable.array、observable.map三者的实现，下面是讨论关于对象的实现方式

- 对象（observable.object）
  - 先创建一个base对象，我们称为adm对象。同时，根据这个base对象创建一个proxy，会通过该proxy将会对原对象的各种值进行代理，而adm[$mobx]指向该一个新建的**ObservableObjectAdministration**数据类型
  - 对传进来的props（即需要被观察的对象），会先寻找是否有get属性（即计算属性），有的话会创建一个计算属性代理，并和其余的属性一起挂载在该proxy上
  - 有计算属性时，会新建一个既有**observableValue**也有**derivation**属性的computedValue类，存放到adm[$mobx].values里面，key就是computed的key
    - 同时会拿到它的get函数，作为这个**derivation**的监听函数，进行初始化监听
    - 并通过Object.defineProperty设置了该属性的get和set属性
  - 其余的属性，会新建一个**observableValue**，存放到adm[$mobx].values里面，并通过Object.defineProperty设置了该属性的get和set属性
  - 然后，重点是创建proxy时的handler对象的**get**和**set**函数，在有新属性访问时或改变值时会调用**get**和**set**函数
    - 访问新属性时，get函数会读取adm[$mobx]，如果没有，会通过has方法，建立一个**observableValue**，并放到adm[\$mobx].pendingKeys中（还不知道有什么用）
    - 设置新属性时，会新建一个**observableValue**存放进去adm[$mobx].values中，同时，通过Object.defineProperty设置了该属性的get和set属性

#### 重点：

（observableValue简称为oV，Object.defineProperty简称为Od）

- 上面说的所有通过Od定义后的set会调用已存放的**oV**的**set**，get会调用已存放的**oV**的**get**

- 第一点说过**oV**继承于**Atom**，所以**oV**的**set**会调用reportChanged，**oV**的**get**会调用reportObserved

**这样子，整个对象属性的监听流程就建立起来了**



### Reaction

Reaction（反应）是一类特殊的Derivation，可以注册响应函数，使之在条件满足时自动执行。使用如下：

```javascript
// new Reaction(name, onInvalidate)
const reaction = new Reaction('name', () => {
    // do something，即响应函数，发生副作用的地方
    console.log('excuted!')
})

const ob = observable.object({
    name: 'laji',
    key: '9527'
})

reaction.track(() => {
    // 注册需要被追踪的变量，这里访问了已经被观察的ob对象，所以当ob.name或ob.key发生改变时，上面的响应函数会执行
    console.log(`my name is ${ob.name}`)
    console.log(`${ob.key} hey hey hey!`)
})

ob.name = 'mike' // 'excuted!'
```

让我们分析一下源码实现，主要有几个重点：

- 初始化Reaction类时，会将onInvalidate函数存储起来

- 在调用**track**函数时，这个是重点，会调用trackDerivedFunction(this, fn, undefined)

  - **trackDerivedFunction**这个函数，就是依赖收集，即注册需要被追踪的变量，它会做几件事情，看下面注释

  ```javascript
  export function trackDerivedFunction<T>(derivation: IDerivation, f: () => T, context: any) {
      // 将该 Derivation 的 dependenciesState 和当前所有依赖的 lowestObserverState 设为最新的状态
      changeDependenciesStateTo0(derivation)
      // 建立一个该derivation新的newObserving数组，里面存放的是谁被该derivation注册依赖了
      derivation.newObserving = new Array(derivation.observing.length + 100)
      // 记录新的依赖的数量
      derivation.unboundDepsCount = 0
      // 每次执行都分配一个全局的 uid
      derivation.runId = ++globalState.runId
      // 重点，将当前的derivation分配为全局的globalState.trackingDerivation，这样被观察的 Observable 在其 reportObserved 方法中就能获取到该 Derivation
      const prevTracking = globalState.trackingDerivation
      globalState.trackingDerivation = derivation
      let result
      // 下面运行存入track的函数，触发被观察变量的get方法
      if (globalState.disableErrorBoundaries === true) {
          result = f.call(context)
      } else {
          try {
              result = f.call(context)
          } catch (e) {
              result = new CaughtException(e)
          }
      }
      globalState.trackingDerivation = prevTracking
      // 比较新旧依赖，更新依赖
      bindDependencies(derivation)
      return result
  }
  ```

  可以看到，重点有两个，一个是**将当前的derivation分配为全局的globalState.trackingDerivation**，一个是下面的更新依赖过程。

- 接下来，我们看看触发了被观察变量的get方法，会是怎样的，上面说过，调用get方法会执行reportObserved函数

  ```javascript
  export function reportObserved(observable: IObservable): boolean {
      // 拿到刚才被设置到全局的derivation
      const derivation = globalState.trackingDerivation
      if (derivation !== null) {
          if (derivation.runId !== observable.lastAccessedBy) {
              observable.lastAccessedBy = derivation.runId
              // 这行是重点，将被观察的变量，放到derivation.newObserving数组中，因此，derivation里就存放了这次访问中被观察的变量
              derivation.newObserving![derivation.unboundDepsCount++] = observable
              if (!observable.isBeingObserved) {
                  observable.isBeingObserved = true
                  observable.onBecomeObserved()
              }
          }
          return true
      } else if (observable.observers.size === 0 && globalState.inBatch > 0) {
          queueForUnobservation(observable)
      }
      return false
  }
  ```
  

- 之后是**bindDependencies**函数的执行。这里面有两点，不做代码解读了：
  - 一是主要是比较derivation的新旧observing（存放被观察变量的数组），防止重复记录，同时去除已过期的被观察变量
  - 二是，observable（被观察的变量）的observers（是一个Set结构）更新里面存放的derivation，即记录自身被谁观察了，在后面调用reportChanged时，触发响应函数

#### 被观察的变量发生变化时

此时会调用observable的set函数，然后调用reportChanged，最终会调用一个叫做**propagateChanged**函数。

```javascript
export function propagateChanged(observable: IObservable) {
    // 已经在运行了，直接返回
    if (observable.lowestObserverState === IDerivationState.STALE) return
    observable.lowestObserverState = IDerivationState.STALE

    // 上面说过，observable（被观察的变量）的observers存放着derivation
    // 这里就是执行每个derivation的onBecomeStale函数
    observable.observers.forEach(d => {
        if (d.dependenciesState === IDerivationState.UP_TO_DATE) {
            if (d.isTracing !== TraceMode.NONE) {
                logTraceInfo(d, observable)
            }
            d.onBecomeStale()
        }
        d.dependenciesState = IDerivationState.STALE
    })
}
```

**onBecomeStale**最终会调用derivation里的**schedule**函数，里面做了两件事：

- 把自身推进全局的**globalState.pendingReactions**数组
- 执行**runReactions**函数
  - 该函数就核心就做一件事情，遍历globalState.pendingReactions数组，执行里面每个derivation的runReaction函数
  - runReaction最终会调用derivation自身的onInvalidate，即响应函数

**至此，整个mobx的数据观察与响应流程就都一一解释完整了**（autorun，autorunAsync，when等函数都是基于Reaction来实现的，就不作过多解读了）



## Mobx-React源码简记

既然mobx都说了，那就把mobx-react也分析一下吧。其实很简单，只要理解了Reaction与Observable，就很容易明白mobx-react的实现了。

mobx-react的实现主要也是两点

- 通过provide和inject，将已经被观察过的observerableStore集中起来并按需分配到所需要的组件中
- 被observer的组件，改写其render函数，使其可以响应变化

第一点比较简单，实现一个hoc，把observerableStore添加到context上，然后被inject的组件就可以拿到所需的observerableStore

我们重点看下第二点，实现第二点的主要逻辑，在`observer.js`里面的**makeComponentReactive**函数中，看下面简化版的重点解析

```javascript
// makeComponentReactive
function makeComponentReactive(render) {
    if (isUsingStaticRendering === true) return render.call(this)
	// 改造后的render函数
    function reactiveRender() {
        // 防止重复执行响应函数，因为componentWillReact有可能有副作用
        isRenderingPending = false
		// render函数执行后返回的jsx
        let rendering = undefined
        // 注册需要被追踪的变量
        reaction.track(() => {
            if (isDevtoolsEnabled) {
                this.__$mobRenderStart = Date.now()
            }
            try {
                // _allowStateChanges是安全地执行原来的render函数，假如在action外有更改变量的行为，会报错
                // 重点是这个，因为render函数被执行了，所以假如里面有被observe过的变量，就能被追踪，更新到依赖该reaction的依赖列表里面
                rendering = _allowStateChanges(false, baseRender)
            } catch (e) {
                exception = e
            }
            if (isDevtoolsEnabled) {
                this.__$mobRenderEnd = Date.now()
            }
        })
		
        return rendering
    }
	// ....省略一些代码
    // 新建一个Reaction，注册响应函数
    const reaction = new Reaction(`${initialName}#${rootNodeID}.render()`, () => {
        if (!isRenderingPending) {
            // 正在执行响应函数
            isRenderingPending = true
            // 这里就是执行新的componentWillReact生命周期的地方
            if (typeof this.componentWillReact === "function") this.componentWillReact() 
            if (this.__$mobxIsUnmounted !== true) {
                let hasError = true
                try {
                    setHiddenProp(this, isForcingUpdateKey, true)
                    // 也是重点，通过forceUpdate，更新组件
                    if (!this[skipRenderKey]) Component.prototype.forceUpdate.call(this)
                    hasError = false
                } finally {
                    setHiddenProp(this, isForcingUpdateKey, false)
                    if (hasError) reaction.dispose()
                }
            }
        }
    })
    // 改写原来的render
    reaction.reactComponent = this
    reactiveRender[mobxAdminProperty] = reaction
    this.render = reactiveRender
    return reactiveRender.call(this)
}
```

可以见到，通过建立一个Reaction，实现了render函数里的被观察的变量收集及响应函数注册。而且在**通过forceUpdate重新更新组件后，render函数会被重新执行一遍，从而实时更新被观察的变量**。整体的实现还是巧妙的。

除此之外，还有一些生命周期的优化，对props、state也进行监听等操作，在这里就不一一解读了