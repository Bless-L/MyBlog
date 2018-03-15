####Nerv源码阅读简记

- Lifecycle.ts主要是组件更新的整个流程
- 更新组件的流程
  - 各种props，state，context的新旧记录
  - shouldComponentUpdate、componentWillUpdate回调函数触发
  - 若需要更新，则得到渲染后的VNode、childContext，进行新旧VNode的diff
  - componentDidUpdate回调触发