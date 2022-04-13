import Taro,{ Current } from '@tarojs/taro'
import { Component } from 'react'
import { View, Button, Text, Image,Checkbox } from '@tarojs/components'
import { observer, inject } from 'mobx-react'
import { AtMessage } from 'taro-ui'
import {fspc, isN} from '../../utils/fn'
import Modal  from '../../utils/modal'

import './index.scss'


import icon_load    from '../../static/loading.svg'
import icon_teac    from '../../static/icon_teacher.svg'
import icon_work    from '../../static/icon_worker.svg'
import icon_logo    from '../../static/logo.svg'

@inject('store')
@observer
class Index extends Component {
  
  constructor(props) {
    super(props)
    this.store = this.props.store.mainStore
    this.state = {
      params: '',
      check: false,
      showInfo: false,
    }
  }


  router = async(mobile) =>{
    let params
    let r = await this.store.init(mobile)
    if (r===null) return
    await this.store.switch(r)
    Taro.switchTab({ url: `/pages/config/index` });
  }

  async componentWillMount() {
    let rid, oid, params,role
    let url = unescape(unescape(Current.router.params.q))
    
    if (url !== "undefined") {
      params = url.split("?")[1]
      let list = params.split("&")
      if (list.length>1) {
        rid = list[0].split("=")[1]
        oid = list[1].split("=")[1]
        this.store.setScanRid(rid)
        this.store.setScanOid(oid)
        this.store.setScanTo('out')
      }else{
        this.store.setScanTo(null) 
      }
    }else{
      this.store.setScanTo(null) 
    }

    let mobile = this.store.loadPhone()
    if (isN(mobile)) {
      let code = await this.store.weLogin()
      this.setState({ params: params, showModal:true, code:code })
    }else{
      this.setState({ loading: true })
      this.router(mobile)
    }
  }

  doGetPhone = async(e) =>{
    let params
    let { encryptedData, iv} = e.detail
    let { code } = this.state
    this.setState({ showModal:false, loading: true })
    let s = await this.store.getPhone(code,encryptedData, iv)
    this.setState({  loading: false })

    if (s.code===0) {
      let mobile = s.data.phoneNumber
      this.store.savePhone(mobile)
      this.router(mobile)
    }else{
      Taro.showToast({ title: '您的账号不存在', icon: 'none', duration: 2000 })
      // Taro.atMessage({ 'message':'系统中没有你的账号！', 'type':'error' })
    }
  }

  doClose=()=>{
    Taro.switchTab({ url: `/pages/blank/index` });
  }

  doAgree=(e)=>{
    this.setState({check: !this.state.check})
  }

  doShowInfo=(e)=>{
    e.stopPropagation()
    this.setState({showInfo: true})
  }

  doHideInfo=()=>{
    this.setState({showInfo: false})
  }
 
  render () {
    let { params,loading } = this.state
    
    return (
      <View className='g-index'>
        <AtMessage/>  
        {(loading)&&<View className="g-loading g-loading-init"><Image src={icon_load}></Image> </View>}

        {/*<Modal isOpened={this.state.showModal} 
               title={'微信授权'} 
               content="为了获取组织资源数据，申请获取您微信绑定的手机号" 
               phoneText={'授权'}
               cancelText={'拒绝'}
               onCancel={this.doClose}
               onPhone = {this.doGetPhone} />*/}

        <View className="m-login">
          <View className="m-wrap">
            <View className="m-title">微信授权</View>
            <View className="m-info" onClick={this.doAgree}>
              <Checkbox checked={this.state.check} ></Checkbox>
              您同意并接收 <Text onClick={this.doShowInfo}>《服务协议》《隐私政策》</Text>
            </View>

            {(!this.state.check)&&<View className="m-btn"> 微信一键登录</View>}

            {(this.state.check)&&<Button className="m-btn sel"  openType="getPhoneNumber" onGetPhoneNumber={this.doGetPhone}> 微信一键登录</Button>}

            <View className="m-cancel" onClick={this.doClose}> 暂不登录</View>
          </View>
        </View>


        {(this.state.showInfo)&&
        <View className="g-info">
          <View className="m-wrap">
             <View className="m-tl">隐私政策</View>
             <View className="m-tl">版本生效日期：2022年1月</View>
             
             <View className="m-p">杭州所思互联有限公司及其关联公司（ 以下简称“我们”）非常重视对您隐私的保护，在您使用我们提供的服务前，请您仔细阅读本隐私政策（下称“本政策”）。我们力求明确说明我们是如何收集、使用、保存、转让及分享您的信息的。为了给您提供更准确、更具个性化的服务，我们会以如下方式，使用您提交的个人信息，但我们会以高度的勤勉、审慎义务对待这些信息。</View>
             <View className="m-p">如果您不同意本隐私权政策任何内容，您应立即停止使用我们的服务。当您使用我们提供的任一服务时，即表示您已同意我们按照本隐私权政策来合法使用和保护您的个人信息。</View>
             <View className="m-p">在中国法律允许的范围内，我们有权随时修改隐私政策的任何条款。一旦隐私政策的内容发生变动，我们将在公司网站上公布修改之后的隐私政策，该公布行为视为我们已经通知您修改内容。如果您继续使用我们的服务，则表示您接受我们对隐私政策所做的修改。我们也可能会在相关服务中发布通知，以向您告知我们视为重要的更改。您可以查看页面上方的"版本生效日期"，以了解隐私政策的最后更新时间。</View>
             <View className="m-p m-e">1、适用范围</View>
             <View className="m-p">当前的隐私声明适用于我们所有网站、应用程序、H5，电商等线上平台，以及我们发起的其他在线活动，参与这些活动您的个人数据会被采集。 相应地，当前的隐私政策不适用于第三方网站，包括那些通过我们平台上的超链接可以访问的网站。</View>
             <View className="m-p m-e">2、信息的收集</View>
             <View className="m-p">我们会在您自愿选择我们提供的服务或提供信息的情况下收集您的个人信息，并将这些信息进行整合，以便向您提供更好的用户服务。请您在注册时及时、详尽及准确地提供个人资料，并不断更新注册资料，符合及时、详尽、准确的要求。因您提供的注册信息不真实而导致的任何问题，将由您自行承担相应的后果。请您不要将您的个人信息转让或出借予他人使用。如您发现您的个人信息遭他人非法使用，应立即通知我们。因用户的保管疏忽导致帐号、密码遭他人非法使用的，我们不承担责任。</View>
             <View className="m-p">一般而言, 您单纯在互联网或客户端上访问我们网站，不会显示出您是谁或留下与您有关的任何信息。我们的网站服务器收集的是您访问我们网站的情况。这些信息将在“匿名”的基础上被收集，仅仅是为了统计访问量、在网站上停留的平均时间、浏览过的网页等等。我们通过这些数据统计我们的网站的使用情况以及改进网站的内容。网站在收集用户信息时，一般收集为提供服务所必需要的信息。如果您不希望我们收集任何您的客户信息，请不要向我们提供。</View>
             <View className="m-p">经过您的事先同意，我们可能采集和处理所有或部分，您通过填写表格、线上内容上传，订阅在线服务（如应用程序和社交网络页面）、写信给我们等方式提供产生的数据，一般具体如下：</View>
            

              <View className="m-p">（1）注册过程中需提供的注册信息（如姓名、性别、电子邮件地址、电话号码、出生年份/日期）;</View>
              <View className="m-p">（2）个人联系方式（如姓名、通讯地址、电子邮件地址、电话、手机号码、邮政编码）;</View>
              <View className="m-p">（3）涉及电子商务订购信息（如订购人和收货人名称、送货地址、电邮地址和电话号码等与订购相关的任何信息）;</View>
              <View className="m-p">（4）涉及电子商务支付信息（如订单支付详情、支付账号等）；</View>
              <View className="m-p">（5）您对我们产品的意见；</View>
              <View className="m-p">（6）与我们联系时的任何特殊要求（主要为存档目的）；</View>
              <View className="m-p">（7）您乐意分享的视频或照片，及您自愿参与我们活动调查问卷等方式留存在我们系统内的信息；</View>
              <View className="m-p">（8）其他与提供服务相关联的信息。</View>
              <View className="m-p m-e">3、信息的使用</View>
              <View className="m-p">收集您的信息是为了向您提供服务及提升服务质量，为了实现这一目的，我们会把您的信息用于下列用途：</View>
              <View className="m-p">（1）为了与您保持联系，特别是回复您的请求；</View>
              <View className="m-p">（2）向您提供您使用的各项服务，并维护、改进这些服务，处理和分析您购买、使用的我们产品和/或服务的信息和消费行为，包括记录账户中的消费信息或与任何其他活动相关的消费，设计个性化的促销活动。</View>
              <View className="m-p">（3）处理您的付款；</View>
              <View className="m-p">（4）对您访问我们的情况进行分析和数据统计，向您推荐您可能感兴趣的内容，包括但不限于向您发出产品和服务信息，给您定期发送有关我们产品、品牌、新的活动和/或我们平台的信息和资讯，或通过系统向您展示个性化的第三方推广信息，或者在征得您同意的情况下与我们的合作伙伴共享信息以便他们向您发送有关其产品和服务的信息。如您不希望接收上述信息，可通过联系我们客服进行退订；</View>
              <View className="m-p">（5）完善平台应用，了解您感兴趣的平台内容，听取您的意见，作为我们商品企划的参考。管理您的网上账户，验证您参与我们活动的注册信息，确保我们的平台能以最好的方式在您和您的计算机上呈现，以及保护您避免遭遇潜在的欺诈行为；</View>
              <View className="m-p">（6）我们可能使用您的个人信息以预防、发现、调查欺诈、危害安全、非法或违反与我们或其关联方协议、政策或规则的行为，以保护您、我们的其他用户、我们或我们关联方的合法权益；</View>
              <View className="m-p">（7）我们可能会将来自某项服务的信息与来自其他服务的信息结合起来，以便为您提供服务、个性化内容和建议；</View>
              <View className="m-p">（8）经您许可的其他用途。</View>
              <View className="m-p m-e">4、信息的管理</View>
              <View className="m-p">我们不会对外公开或向第三方提供您向我们提供的个人信息，除非：</View>
              <View className="m-p">(1) 事先获得您的明确授权；</View>
              <View className="m-p">(2) 只有提供您的个人资料，才能提供您所要求的产品或服务；</View>
              <View className="m-p">(3) 为配送的必要向配送物流公司提供配送所需要的用户信息（姓名、地址、联系方式）的；</View>
              <View className="m-p">(4) 为统计客户消费情况等之所需，按照无法分辨特定用户的方式提供的；</View>
              <View className="m-p">(5) 为产品的交易结算货款之所需；</View>
              <View className="m-p">(6) 为维护我们及您个人的合法权益；</View>
              <View className="m-p">(7) 根据有关的法律法规要求、按照相关政府主管部门的相关规定无法避免的情况。</View>　
              <View className="m-p">任何获准使用您的个人信息的我们的经销商或服务商，都将保证对此类信息严格保密，并且不得将其用于除履行我们所授权服务之外的其他任何用途。我们将不会在未经您事先许可的情况下，以与上述内容无关的方式随意使用或分享您提供给我们的个人识别信息。我们会首先保障您的许可，我们不会与任何不受我们保密政策约束的第三方分享您的信息。</View>
              <View className="m-p">我们收集的有关您的信息和资料将保存在我们（或）关联公司的服务器上，若法律允许这些信息和资料可能传送至您所在国家、地区或我们收集信息和资料所在地并在该地被访问、存储和展示。</View>
              <View className="m-p">我们将在实现本隐私政策中所述目的所必需的期间内保留你的个人信息，除非法律要求或允许在更长的期间内保留这些信息。</View>
              <View className="m-p">会员如需要网站消除个人信息时，可向网站提出要求并通过注销会员资格来取消，网站应及时处理。</View>
              <View className="m-p m-e">5、 向第三方披露</View>
              <View className="m-p">未经您的同意，我们将不会向第三方披露您的信息以用于其各自的独立市场营销或商业用途，比如数据分析公司、客户支持专业人员、网络服务器公司或后勤服务公司（比如协调邮寄的公司等）。但是，我们可能向下列实体披露您的信息：</View>
              <View className="m-p">（1）关联公司。您的信息可能在和府旗下公司内共享。我们只会共享必要的个人信息，且受本隐私政策的约束。</View>
              <View className="m-p">（2）业务合作伙伴。我们也可能与可信的业务合作伙伴（包括但不限于无线运营商）共享您的信息。这些实体可能使用您的信息来提供您请求的服务。我们也可能向为我们或代表我们提供服务的公司披露您的信息，例如协助我们处理账单或代表我们发送电子邮件的公司。这些实体只能将您的信息用于为我们提供服务。</View>
              <View className="m-p">（3）法律要求或保护我们的服务所必需的其他各方。在有些情况下我们可能会向其他各方披露您的信息：</View>
              <View className="m-p">（4）遵守法律或服从强制性的法律程序（如搜查证或其他法院命令）；</View>
              <View className="m-p">（5）确认或强制遵循我们的服务策略；</View>
              <View className="m-p">（6）保护我们、我们的各个附属公司、业务合作伙伴或客户的权利、财产或安全；</View>
              <View className="m-p">（7）与公司事务有关的其他各方。在公司合并、转让或破产过程中，我们可能会向第三方披露您的信息；</View>
              <View className="m-p">（8）征得您同意的其他各方。除本政策中描述的披露情况之外，我们也可能在您同意共享或提出共享请求时与第三方共享您的信息。</View>
              <View className="m-p m-e">6、个人信息的保护</View>
              <View className="m-p">我们尽可能采取了合理的实际措施和技术措施，以保护所收集的与服务有关的信息。但是请注意，虽然我们采取了合理的措施保护您的信息，但没有任何网站、Internet传输、计算机系统或无线连接是绝对安全的。因此，我们鼓励您采取积极措施保证个人信息的安全，如：不将自己的个人信息透露给他人。请您注意，单纯的网站浏览记录、单独的设备信息等是无法与任何特定个人直接联系，不属于个人信息。如果我们将这些非个人信息与其他信息结合用于识别个人身份或者将其与个人信息结合使用，则在结合使用期间，此类信息将视为个人信息。</View>
              <View className="m-p m-e">7、访问您的信息</View>
              <View className="m-p">根据相关法律法规，您有权要求了解有关我们所收集的信息的细节以及更正该信息中不准确之处。为了保护您的隐私与安全，我们会采取适当的步骤以确定您的身份，如要求姓名，在采取这样的措施验证身份之后，您才能访问或修改您的个人信息。我们会竭力使您的个人信息保持准确，并使您能够在线访问个人信息，您可以在线更新或修改您的信息，如果您忘记了已经注册过的电话号码、邮箱地址或想访问您的信息，请在和府旗下品牌微信公众号留言。</View>
              <View className="m-p m-e">8、未成年人个人信息的保护</View>
              <View className="m-p">我们非常重视对未成年人的个人信息的保护。对于未成年用户的个人信息，我们提醒请一定在得到监护人同意后提供。</View>
              <View className="m-p">我们既不主动寻求、也不希望收到直接来自未成年用户的个人信息；但我们无法保证时刻都能准确地了解到访问或使用本网站的访问者年龄。如果未成年人在无监护人同意的情况下向我们提供了个人信息，我们建议监护人与我们联系以删除该信息，并且通知我们以后不再向该未成年用户发送任何信息。</View>
              <View className="m-p m-e">9、COOKIE及同类技术的利用</View>
              <View className="m-p">COOKIE 及同类技术是为了有效运用互联网，由服务器给您的浏览器发送的小规模的资料，是服务器置于您硬盘上的一个非常小的文本文件。使用COOKIE及同类技术的话，网络服务器会记录用户访问了哪些网页数据。通过使用COOKIE及同类技术，网络服务器可识别用户使用的电脑，但无法识别利用者个人。用户可以改变浏览器的设置，拒绝接收COOKIE及同类技术或在接收COOKIE及同类技术的时候显示警告标志。</View>
              <View className="m-p">我们主要出于以下目的而使用记录于网络服务器的访问者或用户的IP地址（用来识别所用电脑的数字），通过IP地址是无法识别个人的。</View>
              <View className="m-p">（1）调查网络服务器发生问题的原因并解决这些问题；</View>
              <View className="m-p">（2）管理网络服务器，为了更加满足用户而对网站进行改良；</View>
              <View className="m-p">（3）通过使用COOKIE获得的资料有时会被统计、处理、编辑并发表，但这不包括可以用于识别用户个人的资料。</View>
              <View className="m-p">您可以通过修改浏览器设置的方式拒绝cookies及同类技术，但我们某些产品或者服务只能使用COOKIE及同类技术才能实现，如果您选择拒绝COOKIE，则您可能无法登录或使用依赖于COOKIE及同类技术的我们网站的服务或功能。</View>
              <View className="m-p m-e">10、与其他网站的链接</View>
              <View className="m-p">请注意，网站可能包含了可连接至其他网站的链接。这些网站并不一定遵循本政策的规定。请您查阅并了解这些网站各自对于隐私权保护的相关规定。</View>
              <View className="m-p m-e">11、意见</View>
              <View className="m-p">我们采取了大量措施，确保您对我们网站的访问顺利，并让您的隐私权始终得到尊重。您要求公司删除您的个人信息，我们会在规定时间内清除您所有个人信息。如果您对我们的隐私权保护措施有任何质疑、意见或担心，您可以在公司微信公众号留言或者联系客服。</View>

             
             <View className="m-blk"></View>

             <View className="m-btn" onClick={this.doHideInfo}>我已阅读</View>
          </View>
        </View>}

      </View>
    )
  }
}

export default Index
