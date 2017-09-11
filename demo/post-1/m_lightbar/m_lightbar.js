/**
 * @author liangwei10
 * @date 2017-8-25
 * @desc m端光条
 */
import Nerv from 'nervjs'

import './m_lightbar.css'

window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

class MLightbar extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {}
    this.imageUrl = './images/m_chatoyant.png'
    this.progress = 0
    this.autoPlayInterval = 3000
  }

  initLightbar () {
    let clientWidth = document.body.offsetWidth
    let clientHeight = document.body.offsetHeight
    let canvas = document.getElementById('lightbar_canvas')
    let tmpCan = document.createElement('canvas')
    this.ctx = canvas.getContext('2d')
    this.tmpCtx = tmpCan.getContext('2d')

    let img = new Image()
    img.src = this.imageUrl
    img.onload = () => {
      let imgScale = img.width / img.height
      let boxScale = clientWidth / clientHeight
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
  }

  getBrightCenter (y) {
    const cY = y
    const cW = this.width
    let oriData = this.oriPixels.data
    let sPx = 0
    let startX = 0
    let cX = 0
    let endX = 0
    let tempX = 0
    let res = []
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

  autoPlay (timestamp) {
    if (this.startY <= -25) {
      let timeGap
      if (!this.progress) {
        this.progress = timestamp
      }
      timeGap = timestamp - this.progress

      if (timeGap > this.autoPlayInterval) {
        this.startY = this.height - 1
        this.progress = 0
      }
    } else {
      const res = this.getBrightCenter(this.startY)
      this.brightnessCtx(res, 50, 60)
      this.startY -= 10
    }
    window.requestAnimationFrame(this.autoPlay.bind(this), false)
  }

  brightnessCtx (res, radius, opacity) {
    const cW = this.width
    let oriPixels = this.tmpCtx.getImageData(0, 0, cW, this.height)
    let oriData = oriPixels.data
    let distance = 0
    let gap = 0
    let sPx = 0
    res.forEach((obj) => {
      let x = obj.x
      let y = obj.y
      const validArr = this.createArea(x, y, radius)
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

  componentDidMount () {
    this.initLightbar()
  }

  render () {
    return (
      <div className='m_lightbar'>
        <canvas id='lightbar_canvas' />
      </div>
    )
  }
}

module.exports = MLightbar
