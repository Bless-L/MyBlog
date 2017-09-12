##用Canvas实现各种酷炫图片效果

前阵子因业务需求，需要对图片进行一些特殊处理，例如反相，高亮，黑白等，都是使用Canvas来实现。

### ImageData

要实现上述所说的各种效果，最核心的事情便是对图片的[`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)对象进行改动。

`ImageData`对象是一个用来描述图片属性的一种数据对象，它有三个属性，分别是`data`、`width`、`height`。后两个代表的是图片的宽高，不用多说。最重要的就是`data`属性，它是一个[`Uint8ClampedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)（8位无符号整形固定数组）类型化数组。按照从上到下，从左到右的顺序，它里面储存了一张图片的所有像素的rgba信息。

例如，一张图片有4个像素，那`data`里面就有16个值，`data[0]~data[3]`的值就是第一个像素中的r、g、b、a值（不了解rgba的看[这里](https://www.w3cplus.com/content/css3-rgba)）。

如何获得一张图片的`ImageData`对象？通过canvas的`getImageData`便可以很简单地获得：

```javascript
const oriPeixel = 
```

值得注意的是，`ImageData`里面的属性都是只读的，不能直接更改和赋值。例如：

```javascript

```



了解了ImageData后，我们来看看效果demo

###Demo 1：图片反相渐变

先看demo：



可以见到，图片先是渐变成反相的样子，在渐变为下一张图片，是不是很酷炫。要现实这个，主要是用到`getImageData`及`putImageData`这两个API。

#### 

