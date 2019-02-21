####Nerv源码阅读简记

以下是Nerv.render执行后，会发生的事情

- Nerv.render(组件，真实dom)后，mountVNode函数执行，createElement(组件)

- （重点：**Lifecycle.ts主要是组件更新的整个流程**

- 如果是组件，执行组件的init方法（其它类型节点有其自己的处理方式），mountComponent执行。**（打标1）**

- 以下是挂载组件的流程

  - 若父组件存在，记录
  - componentWillMount函数执行，得到state
  - renderComponent函数执行，执行component的render函数，得到虚拟dom
  - 若存在componentDidMount函数，组件被推入readyComponents数组（该数组在flushMount函数中执行。具体为一个存放componentDidMount函数的队列，（子）组件全部被挂载后依次执行
  - mountVNode函数执行，createElement(组件或者VNode)，挂载组件render函数执行后得到的虚拟dom
  - 以上过程会进行递归，即会一层一层地执行下去，执行到子组件or子节点，**即回到1**
  - 最后得到真实的dom，然后container.appendChild（真实dom）
  - flushMount函数执行，callback执行

  ​

- 更新组件的流程
  - 各种props，state，context的新旧记录
  - shouldComponentUpdate、componentWillUpdate回调函数触发
  - 若需要更新，得到渲染后的VNode、childContext，进行新旧VNode的diff
  - 具体为patch函数执行，将其挂载到dom上
  - componentDidUpdate回调触发
  - flushMount函数执行，看是否有新的组件被挂载了，若有，执行componentDidMount