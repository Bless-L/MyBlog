/**
 * @author liangwei10
 * @date 2017-8-24
 * @desc 光条
 */
import Nerv from 'nervjs'

import './lightbar.css'

class Lightbar extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {}
    this.imageUrl = './images/chatoyant.png'
    this.img = {}
    this.heightLight = this.heightLight.bind(this)
    this.isIE = !window.requestAnimationFrame
  }

  heightLight (e) {
    let x = e.pageX
    let y = e.pageY
    this.brightnessCtx(x, y, 100, 60)
  }

  initLightbar () {
    this.tmpCan = null
    let clientHeight = document.body.offsetHeight
    let canvas = document.getElementById('lightbar_canvas')
    let tmpCan = document.createElement('canvas')
    this.tmpCan = tmpCan
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')

    let img = new Image()
    img.src = this.imageUrl
    img.onload = () => {
      this.img = img
      this.width = tmpCan.width = canvas.width = Math.ceil(clientHeight * img.width / img.height)
      this.height = tmpCan.height = canvas.height = clientHeight
      this.ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      this.tmpCtx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
  }

  brightnessCtx (x, y, radius, opacity) {
    const cW = this.width
    let oriPixels = this.tmpCtx.getImageData(0, 0, cW, this.height)
    let oriData = oriPixels.data
    let distance = 0
    let gap = 0
    let sPx = 0
    const validArr = this.createArea(x, y, radius)
    validArr.forEach((px, i) => {
      sPx = (px.y * cW + px.x) * 4
      if (oriData[sPx] || oriData[sPx + 1] || oriData[sPx + 2]) {
        distance = Math.sqrt((px.x - x) * (px.x - x) + (px.y - y) * (px.y - y))
        gap = Math.floor(opacity * Math.pow((radius - distance) / radius, 1.8))
        oriData[sPx + 3] += gap
      }
    })
    this.ctx.putImageData(oriPixels, 0, 0)
  }

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

  debounce (func, wait, immediate) {
    var timeout = void 0
    var args = void 0
    var context = void 0
    var timestamp = void 0
    var result = void 0
    var later = function later () {
      var last = +new Date() - timestamp
      if (last < wait && last >= 0) timeout = setTimeout(later, wait - last); else {
        timeout = null
        if (!immediate) {
          result = func.apply(context, args)
          if (!timeout) {
            context = null
            args = null
          }
        }
      }
    }
    return function () {
      context = this
      args = arguments
      timestamp = +new Date()
      var callNow = immediate && !timeout
      if (!timeout) timeout = setTimeout(later, wait)
      if (callNow) {
        result = func.apply(context, args)
        context = null
        args = null
      }
      return result
    }
  }

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

  componentDidMount () {
    if (!this.isIE) {
      this.initLightbar()
      window.addEventListener('resize', this.debounce(this.initLightbar.bind(this), 200), true)
    }
  }

  render () {
    return (
      <div className='lightbar'>
        {
          this.isIE
          ? <img className='lightbar_img' src={this.imageUrl} alt='lightbar' />
          : <canvas id='lightbar_canvas' onMousemove={this.throttle(this.heightLight, 50, this)} />
        }
      </div>
    )
  }
}

module.exports = Lightbar
