/**
 * @author liangwei10
 * @date 2017-11-16
 * @desc demo-1
 */
window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

function CanvasSliders(canvas, imgs, startIdx) {
  this.tmpCan = document.getElementById('J_canvas_temp')
  this.canvas = canvas
  this.width = this.tmpCan.width = canvas.width
  this.height = canvas.height
  this.tmpCan.height = canvas.height * imgs.length
  this.imgs = imgs
  this.ctx = canvas.getContext('2d')
  this.tmpCtx = this.tmpCan.getContext('2d')
  this.curIndex = startIdx || 0
  this.progress = 0
  this.isChange = false
  this.isStop = false
  this.autoPlayInterval = 4500
  var count = 0
  this.imgs.forEach((item, idx) => {
    var img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = item.imgUrl
    img.onload = () => {
      count++
      this.tmpCtx.drawImage(img, 0, canvas.height * idx, canvas.width, canvas.height)
      if (idx === this.curIndex) {
        this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      if (count === this.imgs.length) {
        window.requestAnimationFrame(this.slideRender.bind(this), false)
      }
    }
  })
}

CanvasSliders.prototype = {
  nextSlide: function () {
    this.curIndex++
    if (this.curIndex >= this.imgs.length) {
      this.curIndex = 0
    }
    this.nextPixel = [this.threshold(this.tmpCtx, this.curIndex),
      this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]
    this.isChange = true
    this.progress = 0
  },

  preSlide: function () {
    this.curIndex--
    if (this.curIndex < 0) {
      this.curIndex = this.imgs.length - 1
    }
    this.nextPixel = [this.grayscale(this.tmpCtx, this.curIndex),
      this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]
    this.isChange = true
    this.progress = 0
  },

  gradualChange: function () {
    var oriPixels = this.ctx.getImageData(0, 0, this.width, this.height)
    var oriData = oriPixels.data
    var nextData = this.nextPixel[0].data
    var length = oriData.length
    var totalgap = 0
    var gap = 0
    var gapTemp
    for (var i = 0; i < length; i++) {
      gapTemp = (nextData[i] - oriData[i]) / 15

      if (oriData[i] !== nextData[i]) {
        gap = gapTemp > 1 ? Math.floor(gapTemp) : gapTemp < -1 ? Math.ceil(gapTemp) : oriData[i] < nextData[i] ? 1 : oriData[i] > nextData[i] ? -1 : 0
        totalgap += Math.abs(gap)
        oriData[i] = oriData[i] + gap
      }
    }

    this.ctx.putImageData(oriPixels, 0, 0)

    if (!totalgap) {
      this.nextPixel.shift()
      if (!this.nextPixel[0]) {
        this.isChange = false
      }
    }
  },

  slideRender: function (timestamp) {
    if (this.isChange) {
      this.gradualChange()
    } else {
      var timeGap
      if (!this.progress) {
        this.progress = timestamp
      }
      timeGap = timestamp - this.progress

      if (!this.isStop && timeGap > this.autoPlayInterval) {
        this.nextSlide()
      }
    }
    this.aniId = window.requestAnimationFrame(this.slideRender.bind(this), false)
  },

  grayscale: function (ctx, idx) {
    var pixels = ctx.getImageData(0, this.height * idx, this.width, this.height)
    var d = pixels.data
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i]
      var g = d[i + 1]
      var b = d[i + 2]
      var v = 0.2126 * r + 0.7152 * g + 0.0722 * b
      d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels
  },

  threshold: function (ctx, idx) {
    var pixels = ctx.getImageData(0, this.height * idx, this.width, this.height)
    var d = pixels.data
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i]
      var g = d[i + 1]
      var b = d[i + 2]
      var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 100) ? 255 : 128
      d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels
  },

  stop: function () {
    this.isChange = false
    this.ctx.clearRect(0, 0, this.width, this.height)
    window.cancelAnimationFrame(this.aniId)
  }
}


function Main() {
  var imgs = [{
    imgUrl: './image/slide-1.jpg'
  },{
    imgUrl: './image/slide-2.jpg'
  },{
    imgUrl: './image/slide-3.jpg'
  },{
    imgUrl: './image/slide-4.jpg'
  },{
    imgUrl: './image/slide-5.jpg'
  }]

  var canvas = document.getElementById('J_canvas')
  canvas.width = 790
  canvas.height = 340
  this.slides = new CanvasSliders(canvas, imgs)
  this.bindEvent()
}

Main.prototype = {
  bindEvent: function() {
    var $nextDom = document.querySelector('.slides_next')
    var $preDom = document.querySelector('.slides_pre')

    $nextDom.addEventListener('click', function() {
      this.slides.nextSlide()
    }.bind(this))

    $preDom.addEventListener('click', function() {
      this.slides.preSlide()
    }.bind(this))
  }
}

new Main()