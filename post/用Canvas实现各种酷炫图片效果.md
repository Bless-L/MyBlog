## 用Canvas实现各种酷炫图片效果

前阵子因业务需求，需要对图片进行一些特殊处理，例如反相，高亮，黑白等，都是使用`Canvas`来实现

### ImageData

要实现上述所说的各种效果，最核心的事情便是对图片的[`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)对象进行改动。

`ImageData`对象是一个用来描述图片属性的一种数据对象，它有三个属性，分别是`data`、`width`、`height`。后两个代表的是图片的宽高，不用多说。最重要的就是`data`属性，它是一个[`Uint8ClampedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)（8位无符号整形固定数组）类型化数组。按照从上到下，从左到右的顺序，它里面储存了一张图片的所有像素的rgba信息。

例如，一张图片有4个像素，那`data`里面就有16个值，`data[0]~data[3]`的值就是第一个像素中的r、g、b、a值（不了解rgba的看[这里](https://www.w3cplus.com/content/css3-rgba)）。

如何获得一张图片的`ImageData`对象？通过canvas的`getImageData`便可以很简单地获得：

```javascript
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')
ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

const oriPeixel = ctx.getImageData(0, 0, canvas.width, canvas.height)
```

值得注意的是，`ImageData`里面的属性都是只读的，不能直接更改和赋值。

例如我们把上面的`oriPeixel`的属性赋值，就会报以下的错：

```javascript
oriPeixel.data = []

> Uncaught TypeError: Cannot assign to read only property 'data' of object '#<ImageData>'
```



了解了ImageData后，我们来看看效果demo



###Demo 1：图片反相渐变

先看demo：[demo-1](http://bless-l.github.io/demo/post-1/demo-1/index.html)

#### 1、像素处理

可以见到，图片先是渐变成反相的样子，再渐变为下一张图片，是不是很酷炫。要现实这个，主要是用到`getImageData`及`putImageData`这两个API

刚才我们说过，图片的`ImageData`对象储存着该图片的每个像素的信息，想要得到图片的反相效果，要作如下处理：

```javascript
threshold (ctx, idx) {
  let pixels = ctx.getImageData(0, this.height * idx, this.width, this.height)
  let d = pixels.data
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]
    // 根据rgb求灰度值公式0.2126 * r + 0.7152 * g + 0.0722 * b
    let v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 100) ? 255 : 128
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return pixels
}
```

返回的`pixels`便是图片经过反相处理后的`ImageData`

这里主要是对每个像素的灰度值作过滤，大于等于100的，直接为白色，否则置于128

除此之外，还有黑白，高亮等其他像素处理，具体的可以看[这篇文章](https://www.html5rocks.com/en/tutorials/canvas/imagefilters/)



#### 2、渐变处理

有了经过反相处理后的图片的`ImageData`数据，下一步要做的自然就是渐变赋值了。原生是没有提供相关的API自动达成这种的渐变效果的，所以就需要我们自行实现一遍了，这个会比较麻烦。

用js写过动画的同学都知道，基本上都会使用`requestAnimationFrame`函数来进行帧处理，这里也不意外。

主要思路是这样，图片经过如下的顺序进行渐变：

***图片1----->图片1反相----->图片2----->图片2反相----->图片3......***

直接贴上主要代码：

```javascript
gradualChange () {
  // 图片原始的ImageData数据
  let oriPixels = this.ctx.getImageData(0, 0, this.width, this.height)
  let oriData = oriPixels.data
  // 图片反相后的ImageData数据
  let nextData = this.nextPixel[0].data
  let length = oriData.length
  let totalgap = 0
  let gap = 0
  let gapTemp
  for (let i = 0; i < length; i++) {
    // 计算每个rgba的差值，同时缩小处理。除的数值代表着渐变速度，越大越慢
    gapTemp = (nextData[i] - oriData[i]) / 13

    if (oriData[i] !== nextData[i]) {
      // 每个rgba值增量处理，简单来说就是各种取整，[-1，1]区间直接取-1或1
      gap = gapTemp > 1 ? Math.floor(gapTemp) : gapTemp < -1 ? Math.ceil(gapTemp) : oriData[i] < nextData[i] ? 1 : oriData[i] > nextData[i] ? -1 : 0
      totalgap += Math.abs(gap)
      oriData[i] = oriData[i] + gap
    }
  }
  
  // 通过putImageData更新图片
  this.ctx.putImageData(oriPixels, 0, 0)

  // 总值为0，证明已经渐变完成
  if (!totalgap) {
    this.nextPixel.shift()
    if (!this.nextPixel[0]) {
      this.isChange = false
    }
  }
}
```

上面是渐变过程的主要代码，完整的代码可以查看：[我是代码](https://github.com/Bless-L/little-project/blob/master/demo/post-1/demo-1/demo-1.js)

  

### Demo 2：光条高亮移动效果

同样是先看demo

移动端：[demo-2](http://bless-l.github.io/demo/post-1/demo-2/index.html)

PC端：[demo-3](http://bless-l.github.io/demo/post-1/demo-3/index.html)

可以见到，移动端的demo中，光条上有几个亮斑在同时移动；而PC端，则是在当鼠标hover上去之后，在光条中有一个圆形光斑的高亮效果，因为图片本身是透明的，所以背景色做了深色处理。

#### 1、像素处理

需要说明的是，要实现这种效果，最好是找一些背景一部分透明，一部分带有带状色条的图片，例如我demo中的图片。这类图片有相当区域像素的rgba值为4个0，我们很容易对其做边界处理   

同样的，实现这种效果也是需要对图片像素的rgba值进行处理，但是会比图片反相渐变复杂一些，因为这里需要先实现一个圆形的光斑。



##### 光斑实现

既然是圆形光斑，肯定是先有圆心和半径。在这里，我是在横向的方向上，取光条的中心为圆心，半径取50

实现的代码在demo2的`brightener`函数里面，理解起来也不困难，给定一个`y`坐标，然后再遍历一遍在这个`y`坐标下的像素，找出每条光条初始点和结束点的`x`坐标。rgba值连续两点不为0的，就认为是仍处在光条中，还没有达到边界值

```javascript
brightener (y) {
  // ....完整请看源代码
  for (let x = 0; x < cW; x++) {
    sPx = (cY * cW + x) * 4
    if (oriData[sPx] || oriData[sPx + 1] || oriData[sPx + 2]) {
      startX || (startX = x)
      tempX = sPx + 4
      if (oriData[tempX] || oriData[tempX + 1] || oriData[tempX + 2]) {
        continue
      } else {
        endX = tempX / 4 - cY * cW
        cX = Math.ceil((endX - startX) / 2) + startX
        startX = 0
        res.push({
          x: cX,
          y: cY
        })
      }
    }
  }
  return res
}
```

确定了圆心之后，就可以根据半径确定一个圆，并用一个数组存储这个圆内各个点，以便后续处理。过程也很简单，就是初中学的那一套，两点距离小于半径就可以了

```javascript
createArea (x, y, radius) {
  let result = []
  for (let i = x - radius; i <= x + radius; i++) {
    for (let j = y - radius; j <= y + radius; j++) {
      let dx = i - x
      let dy = j - y
      if ((dx * dx + dy * dy) <= (radius * radius)) {
        let obj = {}
        if (i > 0 && j > 0) {
          obj.x = i
          obj.y = j
          result.push(obj)
        }
      }
    }
  }
  return result
}
```

之后，就是实现一个光斑效果。在这里，我是从圆心向边缘进行一个透明度的衰减渐变

```javascript
// ...
const validArr = this.createArea(x, y, radius)
validArr.forEach((px, i) => {
  sPx = (px.y * cW + px.x) * 4
  // 像素点的rgb值不全为0
  if (oriData[sPx] || oriData[sPx + 1] || oriData[sPx + 2]) {
    distance = Math.sqrt((px.x - x) * (px.x - x) + (px.y - y) * (px.y - y))
    // 根据距离和半径的比率进行正比衰减
    gap = Math.floor(opacity * (1 - distance / radius))
    oriData[sPx + 3] += gap
  }
})
// 更新ImageData
this.ctx.putImageData(oriPixels, 0, 0)
```

到这里，一个光斑就这样实现了



**光斑移动效果**

光斑有了，自然就是让它动起来。这个就简单啦，光斑生成的我们已经完成，那么我们只要把圆心动起来就可以了

在这里，同样是使用`requestAnimationFrame`函数来进行帧处理。而光斑是从下向上移动的，可以看到`startY`在不断递减

```javascript
autoPlay (timestamp) {
  if (this.startY <= -25) {
    let timeGap
    if (!this.progress) {
      this.progress = timestamp
    }
    timeGap = timestamp - this.progress
    // 判断间隔时间是否满足
    if (timeGap > this.autoPlayInterval) {
      this.startY = this.height - 1
      this.progress = 0
    }
  } else {
    // 根据Y坐标生成圆心及光斑 
    const res = this.getBrightCenter(this.startY)
    this.brightnessCtx(res, 50, 60)
    this.startY -= 10
  }
  window.requestAnimationFrame(this.autoPlay.bind(this), false)
}
```

可以看到，无非就是循环`startY`坐标，生成新光斑的过程。而PC上的效果是当鼠标hover上去时有光斑效果，同理去掉这个自动移动的过程，对图片的`mousemove`事件进行监听，得出`x`，`y`坐标作为圆心即可

值得注意的是，因为在不断地更新`ImageData`，所以我们需要一个临时的`canvas`来存放原始图片的`ImageData`数据。demo1也是作了同样的处理

完整的代码可以查看：[PC端](https://github.com/Bless-L/little-project/blob/master/demo/post-1/demo-3/demo-3.js) 、 [移动端](https://github.com/Bless-L/little-project/blob/master/demo/post-1/demo-2/demo-2.js)



### 总结

以上便是使用`Canvas`实现一些图片效果的介绍，权当抛砖引玉，各种看官也可以发挥想象力，实现自己的酷炫效果

