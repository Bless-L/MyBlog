/**
 * @author liangwei10
 * @date 2017-8-25
 * @desc m端背景图
 */
import Nerv from 'nervjs'

import './m_bgImg.css'

window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

class Sliders {
  constructor (canvas, tmpCan, imgs) {
    this.canvas = canvas
    this.width = canvas.width
    this.height = canvas.height
    this.imgs = imgs
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')
    this.curIndex = 0
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
        if (idx === 0) {
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
    /*this.nextPixel = [this.threshold(this.tmpCtx, this.curIndex),
      this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]*/
    this.nextPixel = [this.tmpCtx.getImageData(0, this.height * this.curIndex, this.width, this.height)]
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
    window.requestAnimationFrame(this.slideRender.bind(this), false)
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
}

class MBgImg extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {}
    this.bgArr = [{
      imgUrl: '//img30.360buyimg.com/uba/jfs/t7672/101/1892538081/137192/db875dd8/59a4d969Nc8eba9ae.jpg'
    }, {
      imgUrl: '//img13.360buyimg.com/uba/jfs/t8185/259/362812325/171537/1f410c45/59a69334N57689ba8.jpg'
    }, {
      imgUrl: '//img30.360buyimg.com/uba/jfs/t7480/315/1958657289/180261/c72234/59a4d967N629c29d6.jpg'
    }, {
      imgUrl: '//img14.360buyimg.com/uba/jfs/t8635/13/280662467/157524/2408b060/59a4d966Nb7bbc728.jpg'
    }]
    this.clientWidth = document.body.offsetWidth
    this.clientHeight = Math.max(document.body.offsetHeight, 600)
  }

  initSlide () {
    let canvas = document.getElementById('slides_canvas')
    let tmpCan = document.createElement('canvas')
    tmpCan.width = canvas.width = this.clientWidth
    canvas.height = this.clientHeight
    tmpCan.height = this.clientHeight * this.bgArr.length
    this.canvas = canvas
    this.slides = new Sliders(canvas, tmpCan, this.bgArr)
  }

  componentDidMount () {
    this.initSlide()
  }

  render () {
    return (
      <div className='m_bgImg'>
        <div className='m_bgImg_shade' />
        <canvas id='slides_canvas' />
      </div>
    )
  }
}

module.exports = MBgImg
