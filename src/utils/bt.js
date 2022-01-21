import Taro from '@tarojs/taro'

var MSG_HEAD = '0109'
var MSG_TAIL = '0D0A'
var MSG_RESET= '02000D0A'



export const bleCommand = (hdstAddr,cardAddr) =>{
  return `${MSG_HEAD}${hdstAddr}${cardAddr}${MSG_TAIL}`
}

export const openBle = (m, cmd, cb)=> {
  wx.onBluetoothDeviceFound((res) => {
    res.devices.forEach((device) => {
      if (device.localName==="BT 2-Q") {
        // console.log('Device Found', device)
        createBleConn(device.deviceId,m,cmd,cb)
        wx.stopBluetoothDevicesDiscovery({
          complete:(r)=>{
            // console.log('stop Discovery')
          }
        })
      }
    })
  })

  wx.openBluetoothAdapter({
    mode: 'central',
    success: (res) => {
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
      })
    },
    fail: (res) => {
      console.log(res)
      if (res.errCode !== 10001) {
        return
      }else{
        Taro.showToast({ title: '请打开蓝牙设备'})
      }
    }
  })
}



const createBleConn = (deviceId,m,cmd,cb) => {
  wx.createBLEConnection({
    deviceId: deviceId, 
    success: (r) => {
      getBleService(deviceId,m,cmd,cb)
    },
    fail: (r) => {
      console.log(r)
    }
  })
}

const getBleService = (deviceId,m,cmd,cb) => {
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: (res) => {
      for (let i = 0; i < res.services.length; i++) {
        let o = res.services[i]
        if (o.isPrimary) {
          getBLEChar(deviceId,res.services[i].uuid,m,cmd,cb)
        }
      }
    },
    fail: (res) => {
      console.log(res)
    }
  })
}

const getBLEChar = (deviceId,serviceId,m,cmd,cb) => {
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId, 
    serviceId: serviceId, 
    success: (res) => {
      writeChar(res,deviceId,serviceId,m,cmd,cb)
    },
    fail: (res) => {
      console.log(res)
    }
  })
}

const writeChar = (res,deviceId,serviceId,m,cmd,cb) => {
  for (let i = 0; i < res.characteristics.length; i++) {
    let item = res.characteristics[i]
    if ((item.properties.write)&&(item.uuid.substr(4,4) === 'FFF2')) {
      if (m===1) {
        sendAddr(item,deviceId,serviceId,cmd,cb)
      }else{
        resetCard(item,deviceId,serviceId,cb)
      }
    }
  }
}

const sendAddr = (item,deviceId,serviceId,cmd,cb) => {
  // let macAddr = '0109A899DC1B0FF000FF010D0A'
  wx.writeBLECharacteristicValue({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: item.uuid,
    value:hex2ab(cmd),
    success (res) {
      console.log(`写入特征值成功: ${cmd}`)
      Taro.showToast({ title: `板卡连接成功`})
      closeBLE()
      cb(0)
    }
  })
}


const resetCard = (item,deviceId,serviceId,cb) => {
  console.log(`写入重启命令 ${MSG_RESET}\n\n`)
  Taro.showToast({ title: `板卡重启中...`})
  wx.writeBLECharacteristicValue({
    deviceId,
    serviceId,
    characteristicId: item.uuid,
    value:hex2ab(MSG_RESET),
    success (res) {
      console.log(`写入特征值成功: ${MSG_RESET}`)
      Taro.showToast({ title: `板卡重启成功`})
      closeBLE()
      cb(1)
    }
  })
}


const closeBLE =()=>{
  wx.stopBluetoothDevicesDiscovery({
    complete:(r)=>{
      wx.closeBluetoothAdapter({
        success:(r)=>{
          // console.log('BLE服务关闭成功')
        },
        fail: (r) => {
          console.log(r)
        }
      })
    }
  })
}


const hex2ab=(value)=>{
  var typedArray = new Uint8Array(value.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16);
  }))
  return typedArray.buffer;
}
