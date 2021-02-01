// panel/index.js, this filename needs to match the one registered in package.json
var FS = require("fire-fs");
var PATH = require('fire-path');

// Editor.assetdb.remote.assetInfoByUuid("6d57f326-b0db-4b8a-a55f-a330a9e752b2")
// Editor.assetdb.remote.uuidToUrl("6d57f326-b0db-4b8a-a55f-a330a9e752b2")
// Editor.assetdb.remote.uuidToFspath("6d57f326-b0db-4b8a-a55f-a330a9e752b2")
// window.vue.$el.children.asset1.value
// ['openFile','openDirectory','multiSelections']

function createVue(elem) {
  return new Vue({
      el: elem,
      data: {
          resources: true,
          prefabPath : "db://assets/prefab",
          psdPath : null
      },
      watch: {
          resources() {
              this.refresh();
          },
      },
      methods: {
        fspath2url (path) {
          return Editor.assetdb.remote.fspathToUrl(path);
        },
        url2fspath (url) {
          return Editor.assetdb.remote.urlToFspath(url);
        },
        refresh() {
          if(!!this.prefabPath) {
            Editor.remote.assetdb.refresh(this.prefabPath);
          }
        },
        selectPrefabFolder () {
          var selectpath = Editor.Dialog.openFile({
            defaultPath: Editor.Project.path + "/asset/",
            properties: ['openDirectory']
          });
          // Editor.log(selectpath);
          if(selectpath && selectpath.length > 0) {
            this.prefabPath = this.fspath2url(selectpath[0]);
            Editor.log("预设生成目录" + this.prefabPath);
          }
          else {
            Editor.log("未选择预设生成的目录。");
          }
        },
        selectDefaultPrefabFolder () {
          this.prefabPath = "db://assets/prefab";
        },
        selectPsdFile () {
          var psdfiles = Editor.Dialog.openFile({
            title : "选择一个psd文件，必须是放在项目assets目录下",
            defaultPath: this.prefabPath,
            properties: ['openFile'],
            filters : [
              { name : 'PSD Files', extensions : ['psd']},
              { name : 'All Files', extensions : ['*']}
            ]
          });
          if(!!psdfiles && psdfiles != -1) {
            this.psdPath = this.fspath2url(psdfiles[0]);
            if(!!this.psdPath && this.psdPath.startsWith("db://")) {
              Editor.log("psd文件路径 " + this.psdPath);
            }
            else if(!!this.psdPath && this.psdPath.startsWith("file://")) {
              Editor.error("非项目里psd文件路径，会导致生成失败 " + this.psdPath);
            }
          }
          else {
            Editor.log("未选择psd文件");
          }
        },
        build () {
          var pass = true;
          if(!this.prefabPath) {
            pass = false;
            Editor.error("请先选择预设生成的目录..");
          }
          if(!this.psdPath) {
            pass = false;
            Editor.error("请选择psd文件..");
          }
          else if(this.psdPath.startsWith("file://")) {
            pass = false;
            Editor.error("非项目里psd文件路径，会导致生成失败 " + this.psdPath);
          }
          if(!pass) return;
          let projectPath = Editor.Project.path;
          let tool = PATH.join(projectPath, "packages/psd2cocos/tools/psdex.bat");
          Editor.log("正在生成psd的预设...");
          let callFile = require('child_process');
          let prefabPath = this.url2fspath( this.prefabPath );
          if(!FS.existsSync(prefabPath)) {
            FS.mkdirs(prefabPath);
          }
          let cmd = tool + " " + prefabPath + " " + this.url2fspath( this.psdPath );
          // let refreshpath = Editor.remote.assetdb.fspathToUrl(this.prefabPath)
          let ret = callFile.exec(cmd, function (err, stdOut) {
            if (err) {
              Editor.error("[生成失败:] " + err);
            } else {
            }
            // Editor.remote.assetdb.refresh(refreshpath);
            this.refresh();
            Editor.log("生成预设成功...");
          }.bind(this));
          
          ret.stdout.on('data', function (data) {
            // Editor.log(data);
          }.bind(this));

        }
      }
    });
}

Editor.Panel.extend({
  // css style for panel
  style: FS.readFileSync(Editor.url('packages://psd2cocos/panel/index.css', 'utf8')) + "",

  // html template for panel
  template: FS.readFileSync(Editor.url('packages://psd2cocos/panel/index.html', 'utf8')) + "",

  // element and variable binding
  $: {
    body : "#body"
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    window.vue = createVue(this.$body);
    window.vue.refresh();
  },

  // register your ipc messages here
  messages: {
    'psd2cocos:hello' (event) {
    }
  }
});