/**
 * @author liangwei10
 * @date 2017-8-23
 * @desc 背景图
 */
import Nerv from 'nervjs'

//import View from '@gb/static/js/view'

import './bgImg.css'

window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

class CanvasSliders {
  constructor (canvas, tmpCan, imgs, startIdx) {
    this.parentDom = document.getElementById('J_p')
    this.canvas = canvas
    this.width = canvas.width
    this.height = canvas.height
    this.imgs = imgs
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')
    this.curIndex = startIdx || 0
    this.progress = 0
    this.isChange = false
    this.isStop = false
    this.autoPlayInterval = 6000
    let count = 0
    this.imgs.forEach((item, idx) => {
      let img = new Image()
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

  nextSlide () {
    this.curIndex++
    if (this.curIndex >= this.imgs.length) {
      this.curIndex = 0
    }
    this.nextPixel = [this.threshold(this.tmpCtx, this.curIndex),
      this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]
    this.isChange = true
  }

  preSlide () {
    this.curIndex--
    if (this.curIndex < 0) {
      this.curIndex = this.imgs.length - 1
    }
    this.nextPixel = [this.grayscale(this.tmpCtx, this.curIndex),
      this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]
    this.isChange = true
  }

  gradualChange () {
    let oriPixels = this.ctx.getImageData(0, 0, this.width, this.height)
    let oriData = oriPixels.data
    let nextData = this.nextPixel[0].data
    let length = oriData.length
    let totalgap = 0
    let gap = 0
    let gapTemp
    for (let i = 0; i < length; i++) {
      gapTemp = (nextData[i] - oriData[i]) / 13

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
  }

  slideRender (timestamp) {
    if (this.isChange) {
      this.gradualChange()
    } else {
      let timeGap
      if (!this.progress) {
        this.progress = timestamp
      }
      timeGap = timestamp - this.progress

      if (!this.isStop && timeGap > this.autoPlayInterval) {
        this.nextSlide()
        this.progress = timestamp
      }
    }
    this.aniId = window.requestAnimationFrame(this.slideRender.bind(this), false)
  }

  grayscale (ctx, idx) {
    let pixels = ctx.getImageData(0, this.height * idx, this.width, this.height)
    let d = pixels.data
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i]
      let g = d[i + 1]
      let b = d[i + 2]
      let v = 0.2126 * r + 0.7152 * g + 0.0722 * b
      d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels
  }

  threshold (ctx, idx) {
    let pixels = ctx.getImageData(0, this.height * idx, this.width, this.height)
    let d = pixels.data
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i]
      let g = d[i + 1]
      let b = d[i + 2]
      let v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= 100) ? 255 : 128
      d[i] = d[i + 1] = d[i + 2] = v
    }
    return pixels
  }

  stop () {
    this.isChange = false
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.parentDom.removeChild(this.canvas)
    window.cancelAnimationFrame(this.aniId)
  }
}

class BgImg extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {
      slideIdx: 0
    }
    this.bgArr = [{
      imgUrl: '//img11.360buyimg.com/uba/jfs/t7333/266/1962406029/176525/2328d8d8/59a4d968Nf597de6e.jpg'
    }, {
      imgUrl: '//img20.360buyimg.com/uba/jfs/t9043/346/381451000/159698/9775eaa8/59a69332N6999ddf5.jpg'
    }, {
      imgUrl: '//img13.360buyimg.com/uba/jfs/t7843/340/1915756937/189357/be99f57/59a4d966N4d75bdde.jpg'
    }, {
      imgUrl: '//img12.360buyimg.com/uba/jfs/t9070/349/268246394/159037/b8580951/59a4d968N203dc724.jpg'
    }]
    this.isIE = !window.requestAnimationFrame
    this.firstRender = true
    this.computeScale()
/*    this.nextSlide = this.nextSlide.bind(this)
    this.preSlide = this.preSlide.bind(this)
    this.stopSlide = this.stopSlide.bind(this)
    this.runSlide = this.runSlide.bind(this)*/
  }

  initSlide (startIdx) {
    let parentDom = document.getElementById('J_p')
    let canvas = document.createElement('canvas')
    canvas.id = 'slides_canvas'
    parentDom.appendChild(canvas)
    // let canvas = document.getElementById('slides_canvas')
    let tmpCan = document.createElement('canvas')
    tmpCan.width = canvas.width = this.clientWidth
    canvas.height = this.clientHeight
    tmpCan.height = this.clientHeight * this.bgArr.length
    this.tmpCan = tmpCan
    this.canvas = canvas
    this.slides = new CanvasSliders(canvas, tmpCan, this.bgArr, startIdx)
  }

  computeScale () {
    let imgScale = 1790 / 1000
    let boxScale = document.body.offsetWidth / document.body.offsetHeight
    if (imgScale < boxScale) {
      this.clientWidth = document.body.offsetWidth > 1074 ? document.body.offsetWidth * 1.05 : 1074 * 1.05
      this.clientHeight = this.clientWidth / imgScale
    } else {
      this.clientHeight = document.body.offsetHeight > 600 ? document.body.offsetHeight : 600
      this.clientWidth = this.clientHeight * imgScale * 1.05
    }
  }

  resize () {
    let idx = this.slides.curIndex
    this.tanCan = null
    this.slides.stop()

    this.computeScale()
    this.initSlide(idx)
  }

  stopSlide (e) {
    this.slides.isStop = true
  }

  runSlide (e) {
    this.slides.progress = 0
    this.slides.isStop = false
  }

  nextSlide () {
    this.slides.nextSlide()
  }

  preSlide () {
    this.slides.preSlide()
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

  onTranslate(e) {
    let x = e.pageX
    let y = e.pageY
    let width = document.body.offsetWidth
    if (x >= width * 0.8) {
      this.imgWp.style.transform = '-webkit-translateX(-30px)'
      this.imgWp.style.transform = 'translateX(-30px)'
    } else if (x <= width * 0.2) {
      this.imgWp.style.transform = '-webkit-translateX(30px)'
      this.imgWp.style.transform = 'translateX(30px)'
    }
  }



  componentDidMount () {
/*    if (this.isIE) {
      setInterval(() => {
        let idx = this.state.slideIdx
        idx++
        if (idx >= this.bgArr.length) {
          idx = 0
        }
        this.setState({
          slideIdx: idx
        })
      }, 5000)
    } else {
      this.initSlide()
      window.addEventListener('resize', this.debounce(this.resize.bind(this), 200), true)
    }*/
    setInterval(() => {
      let idx = this.state.slideIdx
      idx++
      if (idx >= this.bgArr.length) {
        idx = 0
      }
      this.setState({
        slideIdx: idx
      })
    }, 5000)
    this.firstRender = false
    if (!this.isIE) {
      this.imgWp = document.getElementById('img_wp')
      document.body.addEventListener('mousemove', this.throttle(this.onTranslate, 100, this))
    }
  }

/*  renderNotIE () {
    return (
      <div>
        <div className='bgImg' id='J_p'>
          <div className='bgImg_shade' />
        </div>
        <div className='slides_next'
          onMouseover={() => {
            this.canvas.style.transform = `translate(-52%, -50%)`
            this.canvas.style.transform = `webkit-translate(-52%, -50%)`
          }}
          onMouseout={() => {
            this.canvas.style.transform = 'translate(-50%, -50%)'
            this.canvas.style.transform = 'webkit-translate(-50%, -50%)'
          }}
        />
      </div>
    )
  }*/

  renderNotIE () {
    let preIdx = this.state.slideIdx - 1
    if (preIdx < 0) {
      preIdx = this.bgArr.length - 1
    }
    const slides = this.bgArr.map((item, idx) => {
      const pre = (idx === preIdx)
      const curr = (idx === this.state.slideIdx)
      return !this.firstRender
      ? <div className={curr ? 'slide_curr img_item' : pre ? 'slide_pre img_item' : 'img_item'}
        style={{
          display: curr || pre ? 'block' : 'none',
          backgroundImage: `url("${item.imgUrl}")`,
          zIndex: curr ? 2 : pre ? 1 : 0
        }} />
      : <div className='img_item'
        style={{
          display: curr ? 'block' : 'none',
          backgroundImage: `url("${item.imgUrl}")`
        }} />
    })

    return (
      <div className='bgImg'>
        <div className='bgImg_shade' />
        <div className='bgImg_wp' id='img_wp'>
          {slides}
        </div>
      </div>
    )
  }

  renderIE () {
    const left = (this.clientWidth - document.body.offsetWidth) / 2
    const ieSlides = this.bgArr.map((item, idx) => {
      return (
        <div style={{
          position: 'relative',
          left: -left + 'px',
          display: idx === this.state.slideIdx ? 'block' : 'none',
          zoom: 1
        }}>
          <img className='img_item' alt={idx} src={item.imgUrl}
            style={{
              width: this.clientWidth,
              height: this.clientHeight
            }}
          />
        </div>
      )
    })

    return (
      <div className='bgImg'>
        <div className='bgImg_shade' />
        {ieSlides}
      </div>
    )
  }

  render () {
    return (
      <div className='bg_wp'>
        {
          this.isIE ? this.renderIE() : this.renderNotIE()
        }
      </div>
    )
  }
}

module.exports = BgImg
