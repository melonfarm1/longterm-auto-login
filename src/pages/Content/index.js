import { printLine } from './modules/print';
import queryString from 'query-string';
import forge from 'node-forge'

let reload = null
function __str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

console.log(1)
if(window.location.hostname==="longtermcare.or.kr"){
    console.log(2)
    let params = queryString.parse(window.location.search)
    if(params["fce"]){
        chrome.storage.sync.get("longterm", function (value) {
            if(!value.longterm) return false
            let data = JSON.parse(value.longterm)

            let child = document.createElement('div');
            child.innerHTML = "<div id='lal_login' style='position:fixed;top:0px;left:0px;right:0px;bottom:0px;width:100%;height:100%;background-color:rgba(0,0,0,.8);z-index:9999999;display:flex;align-items:center;justify-content:center;color:white;font-size: 2.5rem'><h6>"+data.license_id+" 자동 로그인중...</h6></div>";
            child = child.firstChild;
            document.getElementsByTagName('body')[0].appendChild(child);
            document.title = "자동 로그인중"

            //console.log("read value: ", value.test);
            window.document.getElementById("userNo").value=data.license_id
            window.document.getElementById("btn_login_A2_A").click()
            wait(function(){
                let certs = document.querySelectorAll("#xwup_cert_table > table > tbody >tr ")
                let need_upload = true
                for(let i=0;i<certs.length;i++){
                    let cert_name = certs[i].children[1].innerText
                    let cert_expired = certs[i].children[2].innerText
                    if(cert_name===data.cert.name && cert_expired===data.cert.expired){
                        console.log(document.querySelector("tr[serial='"+data.cert.serialNumber+"']"))
                        console.log("tr[serial='"+data.cert.serialNumber+"']")
                        console.log("이미 업로드한 인증서가 등록되어있습니다. 등록할 필요없습니다")
                        certs[i].click()
                        document.querySelector("tr[serial='"+data.cert.serialNumber+"']").click()
                        need_upload = false
                        break
                    }
                }

                if(need_upload) {
                    document.getElementById("lal_login").remove()
                    window.document.getElementById("xwup_media_memorystorage").click()
                    alert("브라우져 인증서를 먼저 등록해야합니다")
                    return false
                }else{
                    setTimeout(function(){
                        document.querySelector("tr[serial='"+data.cert.serialNumber+"']").click()
                        setTimeout(function(){
                            window.document.getElementById("xwup_certselect_lite_input1").value=data.password
                            setTimeout(function(){
                                window.document.getElementById("xwup_OkButton").click()
                            }, 1000)
                        }, 1000)
                    }, 1000)

                }

            }, "xwup_certselect_lite_input1")
        });
    }else if(params["ltcAdminSym"] && window.location.href.indexOf("https://longtermcare.or.kr/npbs/r/a/104/selectMyBlog.web?ltcAdminSym=")>=0 ){
        window.location.href="https://longtermcare.or.kr/npbs/index_login.html"
        /*chrome.storage.sync.get("longterm", function (value) {https://longtermcare.or.kr/npbs/xui/
          console.log("000000000-=----")
          console.log(value)
          if(value.longterm){
            chrome.storage.sync.clear()
          }
        });*/
        //if self.DRIVERS[cid].current_url.find("//longtermcare.or.kr/npbs/auth/login/loginForm.web?")==-1 and (self.DRIVERS[cid].current_url.find("//longtermcare.or.kr/npbs/xui/manage.html")>=0 or self.DRIVERS[cid].current_url.find("//longtermcare.or.kr/npbs/xui/index.html")>=0):
    }else if(window.location.href.indexOf("//longtermcare.or.kr/npbs/auth/login/loginForm.web")===-1 && (window.location.href.indexOf("//longtermcare.or.kr/npbs/xui/manage.html")>=0 || window.location.href.indexOf("//longtermcare.or.kr/npbs/xui/index.html")>=0)){
        /*reloads()
        window.addEventListener('blur', function(){
            reloads()
        });
        window.addEventListener('focus', function(){
            if(reload){
                clearTimeout(reload)
            }
        });
        window.addEventListener('click', function(){
            if(reload){
                clearTimeout(reload)
            }
        });*/
    }
}

function reloads(){
    reload = setTimeout(function(){
        window.location.reload(true)
        reloads()
    }, 10*60*1000)
}

function wait(cb, id){
    if(window.document.getElementById(id)){
        cb()
        return true
    }
    setTimeout(function(){
        wait(cb, id)
    }, 1000)
    return false
}
//printLine("Using the 'printLine' function from the Print Module");