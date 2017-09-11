/**
 * @author liangwei10
 * @date 2017-8-25
 * @desc m端文字展示
 */
import Nerv from 'nervjs'

import anime from '../../static/js/anime'

import './m_content.css'

class MContent extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {
      isChinese: true
    }
    setInterval(() => {
      let isChinese = this.state.isChinese
      this.setState({
        isChinese: !isChinese
      })
    }, 5000)
    this.startAni = this.startAni.bind(this)
    this.restart = this.restart.bind(this)
  }

  _renderChinese () {
    return (
      <div className='m_content_chinese' id='p_content'>
        <div className='m_content_center'>
          <p className='m_content_center_title'>即将上线 敬请期待</p>
          <p className='m_content_center_desc'>顶尖线上精品旗舰 连接世界风尚</p>
        </div>
        <div className='m_content_qrtext'>
          <p>扫码开启奢华之旅  专注最新资讯</p>
        </div>
      </div>
    )
  }

  _renderEnglish () {
    return (
      <div className='m_content_english english' id='p_content'>
        <div className='m_content_center'>
          <p className='m_content_center_title'>COMING SOON</p>
          <p className='m_content_center_desc'>PREMIER E-FLAGSHIP LUXURY LIFESTYLE DESTINATION</p>
        </div>
        <div className='m_content_qrtext'>
          <p>Let’s start this luxury journey together</p>
        </div>
      </div>
    )
  }

  startAni () {
    this.resandLine = anime({
      targets: '.m_content_countdown #svg_line',
      y: [
        { value: '10.89'},
        { value: '30.89', duration: 500},
        { value: '31.89', duration: 500},
      ],
      height: [
        { value: '24'},
        { value: '26',  duration: 800},
        { value: '24',  duration: 3000},
      ],
      easing: 'linear',
      loop: false,
    })

    this.svgTop.setAttributeNS(null, 'points', '5.89 6.89 5.89 16.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 31.89 16.89 31.89 6.89 5.89 6.89')
    this.reconuntMorphing = anime({
      targets: '.m_content_countdown #svg_top',
      points: [
        { value: '5.89 6.89 5.89 16.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 31.89 16.89 31.89 6.89 5.89 6.89' },
        { value: '5.89 9.89 5.89 16.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 31.89 16.89 31.89 9.89 5.89 9.89' },
        { value: '5.89 16.89 5.89 16.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 31.89 16.89 31.89 16.89 5.89 16.89' },
        { value: '11.43 22.89 11.43 22.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 26.36 22.89 26.36 22.89 11.43 22.89' },
        { value: '17.89 32.89 17.89 32.89 17.89 32.89 17.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89' },
      ],
      easing: 'linear',
      duration: 5000,
      loop: false,
    })

    this.svgBottom.setAttributeNS(null, 'points', '5.89 58.89 5.89 58.89 17.89 58.89 19.89 58.89 31.89 58.89 31.89 58.89 5.89 58.89')
    this.reconuntMorphingBottom = anime({
      targets: '.m_content_countdown #svg_bottom',
      points: [
        { value: '5.89 58.89 5.89 58.89 17.89 58.89 19.89 58.89 31.89 58.89 31.89 58.89 5.89 58.89'},
        { value: '5.89 58.89 5.89 54.89 17.89 50.89 19.89 50.89 31.89 54.89 31.89 58.89 5.89 58.89' },
        { value: '5.89 58.89 5.89 54.89 17.89 44.89 19.89 44.89 31.89 54.89 31.89 58.89 5.89 58.89' },
        { value: '5.89 58.89 5.89 48.89 17.89 41.89 19.89 41.89 31.89 48.89 31.89 58.89 5.89 58.89 '},
        { value: '5.89 58.89 5.89 48.89 17.89 35.89 19.89 35.89 31.89 48.89 31.89 58.89 5.89 58.89' },
      ],
      easing: 'linear',
      duration: 5000,
      loop: false,
      complete: () => {
        this.countdownDom.style.transform = 'rotate(-180deg)'
      }
    })
  }

  startAniReverse () {
    this.sandLine = anime({
      targets: '.m_content_countdown #svg_line',
      y: [
        { value: '31.89'},
        { value: '8.89', duration: 500},
        { value: '7.89', duration: 500},
      ],
      height: [
        { value: '24'},
        { value: '26',  duration: 800},
        { value: '24',  duration: 3000},
      ],
      easing: 'linear',
      loop: false,
    })

    this.svgTopRe.setAttributeNS(null, 'points', '5.89 6.89 5.89 6.89 17.89 6.89 19.89 6.89 31.89 6.89 31.89 6.89 5.89 6.89')
    this.conuntMorphing = anime({
      targets: '.m_content_countdown #svg_top_re',
      points: [
        { value: '5.89 6.89 5.89 6.89 17.89 6.89 19.89 6.89 31.89 6.89 31.89 6.89 5.89 6.89'},
        { value: '5.89 6.89 5.89 10.89 17.89 14.89 19.89 14.89 31.89 10.89 31.89 6.89 5.89 6.89'},
        { value: '5.89 6.89 5.89 10.89 17.89 20.89 19.89 20.89 31.89 10.89 31.89 6.89 5.89 6.89'},
        { value: '5.89 6.89 5.89 16.89 17.89 23.89 19.89 23.89 31.89 16.89 31.89 6.89 5.89 6.89'},
        { value: '5.89 6.89 5.89 16.89 17.89 29.89 19.89 29.89 31.89 16.89 31.89 6.89 5.89 6.89'},
      ],
      easing: 'linear',
      duration: 5000,
      loop: false,
    })

    this.svgBottomRe.setAttributeNS(null, 'points', '5.89 58.89 5.89 48.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 31.89 48.89 31.89 58.89 5.89 58.89')
    this.conuntMorphingBottom = anime({
      targets: '.m_content_countdown #svg_bottom_re',
      points: [
        { value: '5.89 58.89 5.89 48.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 31.89 48.89 31.89 58.89 5.89 58.89' },
        { value: '5.89 53.89 5.89 48.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 31.89 48.89 31.89 53.89 5.89 53.89' },
        { value: '5.89 48.89 5.89 48.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 31.89 48.89 31.89 48.89 5.89 48.89' },
        { value: '11.43 42.89 11.43 42.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 26.36 42.89 26.36 42.89 11.43 42.89' },
        { value: '17.89 32.89 17.89 32.89 17.89 32.89 17.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89 19.89 32.89' },
      ],
      easing: 'linear',
      duration: 5000,
      loop: false,
      complete: () => {
        this.countdownDom.style.transform = 'rotate(0deg)'
      }
    })
  }

  restart (e) {
    if (e.target.id === 'm_countdown') {
      if (e.target.style.transform.indexOf('180') > 0) {
        this.svgTop.style.display = 'none'
        this.svgBottom.style.display = 'none'
        this.svgTopRe.style.display = 'inline-block'
        this.svgBottomRe.style.display = 'inline-block'
        this.startAniReverse()
      } else {
        this.svgTop.style.display = 'inline-block'
        this.svgBottom.style.display = 'inline-block'
        this.svgTopRe.style.display = 'none'
        this.svgBottomRe.style.display = 'none'
        this.startAni()
      }
    }
  }

  componentDidMount() {
    this.countdownDom = document.getElementById('m_countdown')
    this.svgTop = document.getElementById('svg_top')
    this.svgBottom = document.getElementById('svg_bottom')
    this.svgTopRe = document.getElementById('svg_top_re')
    this.svgBottomRe = document.getElementById('svg_bottom_re')
    this.countdownDom.addEventListener('transitionend' ,this.restart)
    this.countdownDom.addEventListener('webkitTransitionEnd' ,this.restart)
    this.startAni()
  }

  componentDidUpdate () {
    let content = document.getElementById('p_content')
    let className = content.className + ' show_ani'
    let noShowClassName = content.className + ' no_show'
    content.className = noShowClassName
    setTimeout(() => {
      content.className = className
    }, 100)
  }

  render () {
    return (
      <div className='m_content'>
        <div className='m_content_logo'>
          <img src='./images/logo.svg' alt='logo' />
        </div>
        {this.state.isChinese ? this._renderChinese() : this._renderEnglish()}
        <div className='m_content_countdown' id='m_countdown'>
          <svg viewBox='0 0 37.79 65.79'>
            <g id='svg_box' data-name='svg_box'>
              <g id='svg_box_2' data-name='svg_box_2'>
                <rect class='cls-1' x='0.89' y='0.89' width='36' height='4' />
                <rect class='cls-1' x='0.89' y='60.89' width='36' height='4' />
                <polyline class='cls-1' points='3.89 4.89 3.89 17.89 15.89 30.89 15.89 34.89 3.89 47.89 3.89 60.89' />
                <polyline class='cls-1' points='33.89 4.89 33.89 17.89 21.89 30.89 21.89 34.89 33.89 47.89 33.89 60.89' />
                <polygon class='cls-2' id='svg_top' points='5.89 6.89 5.89 16.89 17.89 29.89 17.89 32.89 19.89 32.89 19.89 29.89 31.89 16.89 31.89 6.89 5.89 6.89' />
                <polygon class='cls-2' id='svg_bottom' points='5.89 58.89 5.89 58.89 17.89 58.89 19.89 58.89 31.89 58.89 31.89 58.89 5.89 58.89' />
                <rect class='cls-2' x='17.89' y='10.89' width='2' height='24' id='svg_line'/>
                <polygon class='cls-2' id='svg_top_re' style='display: none' points='5.89 6.89 5.89 6.89 17.89 6.89 19.89 6.89 31.89 6.89 31.89 6.89 5.89 6.89' />
                <polygon class='cls-2' id='svg_bottom_re' style='display: none' points='5.89 58.89 5.89 48.89 17.89 35.89 17.89 32.89 19.89 32.89 19.89 35.89 31.89 48.89 31.89 58.89 5.89 58.89' />
              </g>
            </g>
          </svg>
        </div>
        <div className='m_content_qr'>
          <img src='//img12.360buyimg.com/uba/jfs/t7546/51/1935424514/15058/8bfd32dd/59a4d968N836e4f0c.jpg' alt='二维码' />
        </div>
      </div>
    )
  }
}

module.exports = MContent
