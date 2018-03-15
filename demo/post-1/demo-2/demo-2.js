/**
 * @author liangwei10
 * @date 2017-11-16
 * @desc demo-1
 */
window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

function Lightbar() {
  this.imageUrl = './image/m_chatoyant.png'
  this.progress = 0
  this.autoPlayInterval = 3000

  this.initLightbar()
}

Lightbar.prototype = {
  initLightbar () {
    var clientWidth = document.body.offsetWidth
    var clientHeight = document.body.offsetHeight
    var canvas = document.getElementById('J_canvas')
    var tmpCan = document.createElement('canvas')
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')

    var img = new Image()
    img.src = this.imageUrl
    img.onload = () => {
      var imgScale = img.width / img.height
      var boxScale = clientWidth / clientHeight
      this.img = img
      if (imgScale >= boxScale) {
        this.width = tmpCan.width = canvas.width = Math.ceil(clientHeight * imgScale)
        this.height = tmpCan.height = canvas.height = clientHeight
      } else {
        this.width = tmpCan.width = canvas.width = clientWidth
        this.height = tmpCan.height = canvas.height = Math.ceil(clientWidth / imgScale)
      }
      this.startY = this.height - 1
      this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      this.tmpCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
      this.oriPixels = this.tmpCtx.getImageData(0, 0, canvas.width, this.height)
      window.requestAnimationFrame(this.autoPlay.bind(this), false)
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

  autoPlay (timestamp) {
    if (this.startY <= -25) {
      var timeGap
      if (!this.progress) {
        this.progress = timestamp
      }
      timeGap = timestamp - this.progress

      if (timeGap > this.autoPlayInterval) {
        this.startY = this.height - 1
        this.progress = 0
      }
    } else {
      var res = this.getBrightCenter(this.startY)
      this.brightnessCtx(res, 50, 70)
      this.startY -= 10
    }
    window.requestAnimationFrame(this.autoPlay.bind(this), false)
  },

  brightnessCtx (res, radius, opacity) {
    var cW = this.width
    var oriPixels = this.tmpCtx.getImageData(0, 0, cW, this.height)
    var oriData = oriPixels.data
    var distance = 0
    var gap = 0
    var sPx = 0
    res.forEach((obj) => {
      var x = obj.x
      var y = obj.y
      var validArr = this.createArea(x, y, radius)
      validArr.forEach((px, i) => {
        sPx = (px.y * cW + px.x) * 4
        if (oriData[sPx] || oriData[sPx + 1] || oriData[sPx + 2]) {
          distance = Math.sqrt((px.x - x) * (px.x - x) + (px.y - y) * (px.y - y))
          gap = Math.floor(opacity * (1 - distance / radius))
          oriData[sPx + 3] += gap
        }
      })
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
  }
}


function Main() {
  new Lightbar()
}

Main()