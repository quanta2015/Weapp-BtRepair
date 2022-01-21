
export const randomTime =(min,max)=>{
  return Math.floor(Math.random()*(max-min+1)+min)
}


export const delay = (delayms) =>{
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delayms);
  })
}

export const fspc = (s) =>{
  // var pattern = new RegExp("\/[\"`+~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%]") 
  // var rs = ""; 
  // for (var i = 0; i < s.length; i++) { 
  //     rs = rs+s.substr(i, 1).replace(pattern, ''); 
  // } 
  // return rs; 

  var ret = s.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');

  return ret
}


export const isN=(e)=>{
  
  return  ((e===null)||(e==='')||(e===undefined))?true:false
}



export const urlParams = function (url) {
  var params = {};
  (url + '?').split('?')[1].split('&').forEach(function (pair) {
    pair = (pair + '=').split('=').map(decodeURIComponent);
    if (pair[0].length) {
      params[pair[0]] = pair[1];
    }
  });
  return params;
};