import React from 'react';
import './Popup.css';
import {
    Button,
    ButtonGroup,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    MuiThemeProvider,
    createMuiTheme,
    Paper,
    Typography,
    CardHeader,
    FormControlLabel,
    Checkbox, Snackbar, OutlinedInput, FormControl, InputLabel
} from '@material-ui/core';
import {
    AddCircleOutlineOutlined,
    CheckOutlined,
    CloseOutlined
} from '@material-ui/icons';
import moment from 'moment'
import forge from 'node-forge'
import copy from "fast-copy";

moment.locale("ko");

const theme = createMuiTheme({
    palette: {
        /*primary: {
          main: '#FFFFFF',
          light: '#FFFFFF',
          contrastText: '#282c34',
        },*/
        secondary: {
            light: '#81c784',
            main: '#4caf50',
            contrastText: '#c8e6c9',
        },
        error : {
            main : '#EB5757'
        }
    },
    '@global': {
        '*::-webkit-scrollbar': {
            width: '0.4em'
        },
        '*::-webkit-scrollbar-track': {
            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '*::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
            outline: '1px solid slategrey'
        }
    }
})

function arrayBufferToString( buf ) {
    //return String.fromCharCode.apply(null, new Uint16Array(buf));
    var binary = '';
    var bytes = new Uint8Array( buf );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary;
}
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}


class Popup extends React.Component {
    constructor(props) {
        super(props);
        let list = localStorage.getItem("list")

        try{
            if(list){
                list = JSON.parse(list)
            }else{
                list = []
            }
        }catch (e) {
            list = []
        }

        this.state = {
            "new": 0,
            "license_id":null,
            "license_id_msg":null,
            "password":null,
            "list" : list,
            "checked" : true,
            "snackbar" : null,
            "file" : null
        };
        this.toggle_new = this.toggle_new.bind(this)
        this.toggle_checked = this.toggle_checked.bind(this)
        this.delete_list = this.delete_list.bind(this)
        this.save = this.save.bind(this)
        this.setState = this.setState.bind(this)
        this.onInput = this.onInput.bind(this)
        this.file = this.file.bind(this)

        this.change_license_id = this.change_license_id.bind(this)
        this.change_password = this.change_password.bind(this)
        this.change_cert = this.change_cert.bind(this)
        this.valid_cert = this.valid_cert.bind(this)
        this.open_longterm = this.open_longterm.bind(this)
    }


    snackbar(s){
        this.setState({"snackbar":s})
    }

    change_license_id(e){
        let msg = this.valid_license_id(e.target.value)
        this.setState({"license_id":e.target.value, "license_id_msg":msg})
    }
    change_password(e){
        this.setState({"password":e.target.value})
    }

    change_cert(e){
        if(!e.target.files || e.target.files.length===0 ){
            this.snackbar("파일 형태로 올려주세요")
            this.reset()
            return false
        }
        let f = e.target.files[0]
        this.reset()

        if(!this.valid_file(f)) return false

        this.setState({"file":f})
    }

    submit(e){
        e.preventDefault();
        let list = this.state.list

        if(!this.state.license_id){
            this.snackbar("아이디를 입력해주세요")
            return false
        }

        if(!this.state.file){
            this.snackbar("인증서 파일을 업로드해주세요")
            return false
        }

        if(!this.state.password){
            this.snackbar("비밀번호를 입력해주세요")
            return false
        }

        this.valid_cert(function(cert){
            if(!cert){
                return false
            }
            let data = {
                "license_id" : this.state.license_id,
                "password" : this.state.password,
                "logined" : moment().unix(),
                "cert" : cert
            }
            list.push(data)
            this.setState({"list":list, "license_id":null, "password":null, "new":false, "file":null, "snackbar":"저장완료"}, this.save)
            if(this.state.checked) this.open_longterm(data)
        }.bind(this))

        return false
    }

    save(){
        localStorage.setItem("list",JSON.stringify(this.state.list))
    }

    delete_list(idx){
        if(idx<0) return false
        let list = this.state.list
        list.splice(idx, 1)
        this.setState({"list":list, "snackbar":"삭제완료"}, this.save)
    }

    toggle_new(){
        this.setState({"new":!this.state.new})
        //chrome.tabs.create(1,{url: "/index.html"});
        /*chrome.windows.create({
          // Just use the full URL if you need to open an external page
          url: chrome.runtime.getURL("https://longtermcare.or.kr/npbs/xui/manage.html?SESSIONCHECK!6TQJ8QA6KQsGWc8yFudxPJVra2A5hxI2JLyOlrSV3R8jUMH1JORF9xYYhhkgH67P.amV1c19kb21haW4vbnBic19vcHJfbmV3MTM=&gv_xgateUrl!longtermcare.or.kr&gv_isPMSQ!Y&gv_initMenuId!")
        });*/
    }

    toggle_checked(){
        this.setState({"checked":!this.state.checked})
    }

    onInput(input){
        this.input = input
    }

    reset(){
        this.input.type = ''
        this.input.type = 'file'
    }

    valid_license_id(value){
        let result = value.match(/^\d{11}$/) //Array(3) ["Abc","abc","abc"]
        if(!Boolean(result)){
            return "11자리 숫자로 입력해주세요"
        }

        for(let i=0;i<this.state.list.length;i++){
            if(this.state.list[i].license_id===value){
                return "이미 등록된 아이디입니다"
            }
        }
        return null
    }

    open_longterm(data){

        let data1 = copy(data)
        if(data1.cert.pkcs12B64){
            delete data1.cert.pkcs12B64;
        }
        let _data = JSON.stringify(data1)
        chrome.storage.sync.set({"longterm":_data}, function (res) {
            chrome.storage.sync.get("longterm", function (value) {
                if(value && value.longterm === _data){
                    document.getElementById("newtab").click()
                }
            });
        });
    }

    valid_file(file){
        if(file.name.indexOf(".p12")===-1){
            this.snackbar(".p12 인증서 파일로 올려주세요")
            this.reset()
            return false
        }
        if(file.type!=="application/x-pkcs12"){
            this.snackbar(".p12 인증서 타입 파일로 올려주세요")
            this.reset()
            return false
        }
        return true
    }

    valid_cert(cb){
        if(!this.state.file) return false

        let reader = new FileReader();
        let contents
        let pkcs12Der
        let pkcs12B64
        reader.onload = function(e) {
            try{
                contents = e.target.result;

                pkcs12Der = ab2str(contents)

                pkcs12B64 = forge.util.encode64(pkcs12Der);

                //여기서 다시 decode 해보자
                /*console.log("====RECALL====")
                let _pkcs12Der = forge.util.decode64(pkcs12B64)
                console.log(_pkcs12Der)
                let _contents = str2ab(_pkcs12Der)
                console.log(_contents)
                let _f = new File([_contents], "test.p12", {type: "application/x-pkcs12"})
                console.log(_f)

                const path = window.URL.createObjectURL(_contents)
                const link = document.createElement('a')
                link.href = path
                link.download = "test.p12"
                link.click()
                link.remove() // IE 미지원*/

                let pkcs12Asn1 = forge.asn1.fromDer(pkcs12Der);

                let pkcs12 = forge.pkcs12.pkcs12FromAsn1(pkcs12Asn1, false, this.state.password, {algorithm: '3des'});

                let bags = pkcs12.getBags({bagType: forge.pki.oids.certBag});
                let cert = bags[forge.pki.oids.certBag][0].cert;

                /*console.log(cert.validity)
                console.log(cert.issuer)
                console.log(cert.issuer.attributes)
                console.log(cert.issuer.getField('CN'))
                console.log(cert.subject)
                console.log(cert.subject.attributes)
                console.log(typeof cert.subject.getField('CN').value)
                console.log(cert.subject.getField('CN').value)
                console.log(decodeURIComponent(escape(cert.subject.getField('CN').value)))
                console.log(decodeURIComponent(escape(cert.subject.getField('OU').value)))*/

                for(let i=0;i<this.state.list.length;i++){
                    if(this.state.list[i].cert.serialNumber===cert.serialNumber){
                        this.snackbar("이미 등록된 인증서입니다")
                        cb(false)
                        return false
                    }
                }

                let c = {
                    "file_name" : this.state.file.name,
                    "name" : decodeURIComponent(escape(cert.subject.getField('CN').value)),
                    "organization" : decodeURIComponent(escape(cert.subject.getField('OU').value)),
                    "expired" : moment(cert.validity.notAfter).format("YYYY-MM-DD"),
                    "serialNumber" : cert.serialNumber,
                    "pkcs12B64" : pkcs12B64
                }
                cb(c)
            }catch (e){
                this.snackbar("잘못된 인증정보입니다")
                cb(false)
            }
        }.bind(this)
        reader.readAsArrayBuffer(this.state.file);
    }

    file(){
        return (
            <Button fullWidth={true} style={{"position":"relative"}} className={"file_button"}>
                <input type="file" multiple={false} name={"cert"} className={"cert"} ref={(el) => this.onInput(el)} onChange={this.change_cert} accept={"application/pkcs12"}/>
                {this.state.file?
                    this.state.file.name:"공인인증서 파일을 올려주세요"
                }
            </Button>
        )
    }

    render() {
        let license_id_msg = null, helper=null, verified = false
        if(this.state.license_id){
            license_id_msg = this.state.license_id_msg
            if(!license_id_msg){
                verified = true
            }
        }
        let icon = null
        if(this.state.file){
            icon = <CheckOutlined color={"secondary"} />
        }
        return (
            <MuiThemeProvider theme={theme}>
                <div className="App">
                    <header className="App-header">
                        <CardHeader
                            style={{"padding":"0px", "width":"100%"}}
                            title={"롱텀 자동로그인"}
                            subheader={"0.1.4"}
                            action={
                                <IconButton >
                                    <CloseOutlined />
                                </IconButton>
                            }
                        />
                        <a id="newtab" href="https://longtermcare.or.kr/npbs/auth/login/loginForm.web?menuId=npe0000002160&rtnUrl=&zoomSize=&fce=1" target="_blank" style={{"display":"none"}}>gogo</a>

                        {this.state.list.length>0?<Typography variant={"subtitle2"} className={"title"}>계정 정보</Typography>:null}
                        <List
                            elevation={0}
                            component={Paper}
                            className={"list"}
                            disablePadding={true}
                        >
                            {
                                this.state.list.map(function(data, i){
                                    let subtitles = [data.cert.name+"("+data.cert.expired+")"]
                                    if(data.logined && data.logined>0){
                                        let m = moment.unix(data.logined)
                                        subtitles.push(m.fromNow())
                                    }
                                    return (
                                        <ListItem divider={true} button={true} dense={true} onClick={()=>this.open_longterm(data)}>
                                            <ListItemText
                                                color={"primary"}
                                                primary={data.license_id}
                                                primaryTypographyProps={{
                                                    "color" : "primary",
                                                    "variant" : "subtitle1"
                                                }}
                                                secondary={subtitles.join(" / ")}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton onClick={(e)=>this.delete_list(i, e)}>
                                                    <CloseOutlined />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    )
                                }.bind(this))
                            }
                            {!this.state.new?<ListItem divider={true} component={Button} type={"button"} variant={"contained"} disableElevation={true} color={"primary"} onClick={this.toggle_new} startIcon={<AddCircleOutlineOutlined fontSize={"large"} />} size={"large"} fullWidth={true}>계정 정보 추가</ListItem>:null}
                        </List>
                        {this.state.new?<form className={"form"} onSubmit={this.submit.bind(this)}>
                            <Typography variant={"subtitle2"} className={"title"}>새 계정 추가</Typography>
                            <TextField
                                autoFocus={true}
                                label="아이디"
                                value={this.state.license_id}
                                onChange={this.change_license_id}
                                placeholder={"센터 지정번호로 입력해주세요"}
                                variant={"outlined"}
                                required={true}
                                helperText={license_id_msg}
                                margin="dense"
                                error={Boolean(license_id_msg)}
                                style={{"color":"white"}}
                                InputProps={{
                                    endAdornment: verified?<InputAdornment position="start"><CheckOutlined color={"secondary"}/></InputAdornment>:null
                                }}
                                inputProps={{
                                    maxLength:11
                                }}
                            />

                            {!this.state.license_id_msg?<FormControl variant={"outlined"} required={true} margin="dense">
                                <InputLabel htmlFor={"cert"} shrink={true} style={{"backgroundColor":"white"}}>공인인증서</InputLabel>
                                <OutlinedInput
                                    margin="dense"
                                    variant={"outlined"}
                                    required={true}
                                    placeholder={"공인인증서를 업로드해주세요"}
                                    inputComponent={this.file}
                                    endAdornment={icon}
                                />
                            </FormControl>:null}

                            {this.state.file&&!this.state.license_id_msg?

                                <TextField
                                    autoFocus={true}
                                    label="인증서 비밀번호"
                                    value={this.state.password}
                                    type={"password"}
                                    onChange={this.change_password}
                                    placeholder={"인증서 비밀번호를 입력해주세요"}
                                    variant={"outlined"}
                                    required={true}
                                    margin="dense"
                                    style={{"color":"white"}}
                                    /*InputProps={{
                                      endAdornment: <InputAdornment position="start"><RemoveRedEyeOutlined color={"action"}/></InputAdornment>
                                    }}*/
                                /> :null
                            }
                            {this.state.file&&!this.state.license_id_msg&&Boolean(this.state.password)?[<FormControlLabel
                                key={0}
                                control={
                                    <Checkbox
                                        checked={this.state.checked}
                                        onChange={this.toggle_checked}
                                        name="checkedB"
                                        color="primary"
                                    />
                                }
                                label="저장 후 바로 롱텀 로그인"
                            />,
                                <ButtonGroup fullWidth={true} key={1}>
                                    <Button type={"submit"} variant={"contained"} disableElevation={true} color={"primary"}>저장</Button>
                                    <Button type={"button"} variant={"outlined"} color={"primary"} onClick={this.toggle_new}>닫기</Button>
                                </ButtonGroup>]:null}
                        </form>:null}
                    </header>

                    <Snackbar
                        anchorOrigin={{vertical: 'top',horizontal: 'left'}}
                        open={Boolean(this.state.snackbar)}
                        autoHideDuration={1000}
                        onClose={()=>this.snackbar(null)}
                        message={this.state.snackbar}
                        action={
                            <IconButton onClick={()=>this.snackbar(null)}>
                                <CloseOutlined color={"action"}/>
                            </IconButton>
                        }
                    />

                </div>
            </MuiThemeProvider>
        );
    }
};

export default Popup;
