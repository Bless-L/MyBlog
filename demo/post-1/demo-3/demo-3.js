/**
 * @author liangwei10
 * @date 2017-11-16
 * @desc demo-1
 */
window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

function Lightbar() {
  this.imageUrl = './image/chatoyant.png'
  this.progress = 0
  this.autoPlayInterval = 3000

  this.initLightbar()
}

Lightbar.prototype = {
  initLightbar () {
    this.tmpCan = null
    var clientHeight = document.body.offsetHeight
    var canvas = document.getElementById('J_canvas')
    var tmpCan = document.createElement('canvas')
    this.tmpCan = tmpCan
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')

    var img = new Image()
    img.src = this.imageUrl
    img.onload = () => {
      this.img = img
      this.width = tmpCan.width = canvas.width = Math.ceil(clientHeight * img.width / img.height)
      this.height = tmpCan.height = canvas.height = clientHeight
      this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      this.tmpCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  },

  getBrightCenter (y) {
    var cY = y
    var cW = this.width
    var oriData = this.oriPixels.data
    var sPx = 0
    var startX = 0
    var cX = 0
    var endX = 0
    var tempX = 0
    var res = []
    for (var x = 0; x < cW; x++) {
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
  },

  brightnessCtx (x, y, radius, opacity) {
    var cW = this.width
    var oriPixels = this.tmpCtx.getImageData(0, 0, cW, this.height)
    var oriData = oriPixels.data
    var distance = 0
    var gap = 0
    var sPx = 0
    var validArr = this.createArea(x, y, radius)
    validArr.forEach((px, i) => {
      sPx = (px.y * cW + px.x) * 4
      if (oriData[sPx] || oriData[sPx + 1] || oriData[sPx + 2]) {
        distance = Math.sqrt((px.x - x) * (px.x - x) + (px.y - y) * (px.y - y))
        gap = Math.floor(opacity * Math.pow((radius - distance) / radius, 1.8))
        oriData[sPx + 3] += gap
      }
    })
    this.ctx.putImageData(oriPixels, 0, 0)
  },

  createArea (x, y, radius) {
    var result = []
    for (var i = x - radius; i <= x + radius; i++) {
      for (var j = y - radius; j <= y + radius; j++) {
        var dx = i - x
        var dy = j - y
        if ((dx * dx + dy * dy) <= (radius * radius)) {
          var obj = {}
          if (i > 0 && j > 0) {
            obj.x = i
            obj.y = j
            result.push(obj)
          }
        }
      }
    }
    return result
  },

  throttle (fn, threshhold, scope) {
    threshhold || (threshhold = 250)
    var last = void 0
    var deferTimer = void 0
    return function () {
      var context = scope || this
      var now = +new Date()
      var args = arguments
      if (last && now < last + threshhold) {
        clearTimeout(deferTimer)
        deferTimer = setTimeout(function () {
          last = now
          fn.apply(context, args)
        }, threshhold)
      } else {
        last = now
        fn.apply(context, args)
      }
    }
  }
}


function Main() {
  this.lightbar = new Lightbar()

  this.bindEvent()
}

Main.prototype = {
  bindEvent: function() {
    var $dom = document.querySelector('.lightbar')

    $dom.addEventListener('mousemove', this.throttle(this.hoverHandle, 50, this))
  },

  hoverHandle: function(e) {
    var x = e.pageX
    var y = e.pageY
    this.lightbar.brightnessCtx(x, y, 100, 60)
  },

  throttle (fn, threshhold, scope) {
    threshhold || (threshhold = 250)
    var last = void 0
    var deferTimer = void 0
    return function () {
      var context = scope || this
      var now = +new Date()
      var args = arguments
      if (last && now < last + threshhold) {
        clearTimeout(deferTimer)
        deferTimer = setTimeout(function () {
          last = now
          fn.apply(context, args)
        }, threshhold)
      } else {
        last = now
        fn.apply(context, args)
      }
    }
  }
}

new Main()