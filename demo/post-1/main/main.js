/**
 * @author liangwei10
 * @date 2017-8-24
 * @desc 文字显示
 */
import Nerv from 'nervjs'

import './main.css'

window.requestAnimationFrame = window.requestAnimationFrame || window.mosRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame

class Main extends Nerv.Component {
  constructor () {
    super(...arguments)
    this.state = {
      isChinese: true
    }
    this.isIE = !window.requestAnimationFrame
    setInterval(() => {
      let isChinese = this.state.isChinese
      this.setState({
        isChinese: !isChinese
      })
    }, 5000)
  }

  _renderChinese () {
    return (
      <div className='prepare_Chinese' id='p_content'>
        <div className='prepare_main_center'>
          <p className='prepare_main_center_title'>即将上线 敬请期待</p>
          <p className='prepare_main_center_desc'>顶尖线上精品旗舰 连接世界风尚</p>
        </div>
        <div className='prepare_main_qrtext'>
          <p>扫码开启奢华之旅  专注最新资讯</p>
        </div>
      </div>
    )
  }

  _renderEnglish () {
    return (
      <div className='prepare_english english' id='p_content'>
        <div className='prepare_main_center'>
          <p className='prepare_main_center_title'>COMING SOON</p>
          <p className='prepare_main_center_desc'>PREMIER E-FLAGSHIP LUXURY LIFESTYLE DESTINATION</p>
        </div>
        <div className='prepare_main_qrtext'>
          <p>Let’s start this luxury journey together</p>
        </div>
      </div>
    )
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
      <div className='prepare_main'>
        <div className='prepare_main_logo'>
          {
            this.isIE
            ? <img className='logo_IE' src='//img10.360buyimg.com/uba/jfs/t9202/44/352309365/4255/ade94ded/59a66ea3N08a8741e.png' alt='logo' />
            : <img src='./images/logo.svg' alt='logo' />
          }
        </div>
        {this.state.isChinese ? this._renderChinese() : this._renderEnglish()}
        <div className='prepare_main_qr'>
          <img src='//img12.360buyimg.com/uba/jfs/t7546/51/1935424514/15058/8bfd32dd/59a4d968N836e4f0c.jpg' alt='二维码' />
        </div>
      </div>
    )
  }
}

module.exports = Main
