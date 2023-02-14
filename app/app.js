const { dialog, app, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const json_fp = path.join(__dirname,'../','./localStorage.json');
const log_fp = path.join(__dirname,'../','./log.log');
const load = function (win) {
    let asar_fp = __dirname.replace(/\\/g,"/");
    let renderernode = asar_fp+"/renderer.node";
    let asarjs = asar_fp+"/asar.js";
    win.loadFile('index.html')
    win.webContents.executeJavaScript(`!function () {
  require('${renderernode}');
  require('${asarjs}');
}()`)
}
const menu = function(win){
    let sep = {
        label:'|',
        enabled:false
    };
    let f5 = {
        label:'　刷新　',
        click:()=>{
            load(win);
        },
        accelerator:"F5"
    };
    let tools = [
        {
            label:'　hello　',
            click:()=>{

            }
        },
        {
            label:'　hi　',
            click:()=>{

            }
        }
    ];
    let author = {
        label:'　made by me　',
        submenu:[
            {
                label:"Website",
                click:()=>{
                    shell.openExternal("https://...")
                }
            },
            {
                label:"Bilibili",
                click:()=>{
                    shell.openExternal("https://...")
                }
            },
        ]
    };
    let sep2 = { type: 'separator' };
    let macEdit = {
      label: '　编辑　',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        sep2,
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    };
    process.platform === 'darwin'?[tools.splice(0, 0, sep2)]:null;
    return process.platform === 'darwin'?[
        {role:"TODO", submenu:[{role:"TODO"}]},
        sep,
        macEdit,
        sep,
        {label:"　菜单　", submenu:[f5].concat(tools)},
        sep,
        author
    ]:([
        f5,
        sep,
    ]).concat(tools.reduce(function(a, b){
        a.push(b);
        a.push(sep);
        return a;
    }, [])).concat([author]);
}
const init_win = function(win){
    let m = Menu.buildFromTemplate(menu(win));
    Menu.setApplicationMenu(m)
    ipcMain.on("get_localStorage",()=>{
      fs.readFile(json_fp,'utf-8',(err,data)=>{
        win.webContents.send('get_localStorage', JSON.parse(data));
      });
    })
    ipcMain.on("set_localStorage",(event,arg)=>{
      fs.writeFile(json_fp,arg,'utf-8',(err,data)=>{
        win.webContents.send('set_localStorage', 'ok');
      });
    })
    // win.webContents.session.webRequest.onHeadersReceived({
    //     "urls": [
    //         "https://google.com/*"
    //     ]
    // }, (details, callback)=> {
    //     let responseHeaders = details.responseHeaders;
    //     let setcookie = responseHeaders["Set-Cookie"]||[];
    //     for(let i=0;i<setcookie.length;i++){
    //         setcookie[i] = (setcookie[i]+"; SameSite=None; Secure").replace(";;", ";");
    //     }
    //     callback({
    //         "cancel": false,
    //         "responseHeaders": responseHeaders
    //     });
    // });
    // win.webContents.setUserAgent("Mozilla/5.0 (iPad; CPU OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/108.0.1462.77 Version/16.0 Mobile/15E148 Safari/604.1");
    load(win);
}


module.exports = {
    "init_win": init_win
}
