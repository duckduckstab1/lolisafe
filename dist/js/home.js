var lsKeys={token:"token",chunkSize:"chunkSize",parallelUploads:"parallelUploads",uploadsHistoryOrder:"uploadsHistoryOrder",previewImages:"previewImages",fileLength:"fileLength",uploadAge:"uploadAge",stripTags:"stripTags"},page={token:localStorage[lsKeys.token],apiChecked:!1,private:null,enableUserAccounts:null,maxSize:null,chunkSizeConfig:null,temporaryUploadAges:null,fileIdentifierLength:null,stripTagsConfig:null,album:null,parallelUploads:null,previewImages:null,fileLength:null,uploadAge:null,stripTags:null,maxSizeBytes:null,urlMaxSize:null,urlMaxSizeBytes:null,chunkSize:null,tabs:[],activeTab:null,albumSelect:null,albumSelectOnChange:null,previewTemplate:null,dropzone:null,clipboardJS:null,lazyLoad:null,urlsQueue:[],activeUrlsQueue:0,imageExts:[".webp",".jpg",".jpeg",".bmp",".gif",".png",".tiff",".tif",".svg"],videoExts:[".webm",".mp4",".wmv",".avi",".mov",".mkv",".m4v",".m2ts"],albumTitleMaxLength:70,albumDescMaxLength:4e3,onInitError:function(e){document.querySelector("#albumDiv").classList.add("is-hidden"),document.querySelector("#tabs").classList.add("is-hidden"),document.querySelectorAll(".tab-content").forEach((function(e){return e.classList.add("is-hidden")}));var a=document.querySelector("#loginToUpload");a.innerText="An error occurred. Try to reload?",a.classList.remove("is-loading"),a.classList.remove("is-hidden"),a.addEventListener("click",(function(){window.location.reload()})),e.response?page.onAxiosError(e):page.onError(e)},onError:function(e){console.error(e);var a=document.createElement("div");return a.innerHTML="<code>"+e.toString()+"</code>",swal({title:"An error occurred!",icon:"error",content:a})},onAxiosError:function(e,a){a||console.error(e);var t={520:"Unknown Error",521:"Web Server Is Down",522:"Connection Timed Out",523:"Origin Is Unreachable",524:"A Timeout Occurred",525:"SSL Handshake Failed",526:"Invalid SSL Certificate",527:"Railgun Error",530:"Origin DNS Error"}[e.response.status]||e.response.statusText;if(a)return e.response.data&&e.response.data.description?e.response:{data:{success:!1,description:e.response?e.response.status+" "+t:e.toString()}};var n=e.response.data&&e.response.data.description?e.response.data.description:"There was an error with the request, please check the console for more information.";return swal(e.response.status+" "+t,n,"error")},checkClientVersion:function(e){var a=document.querySelector("#mainScript").src.match(/\?_=(\d+)$/);if(a&&a[1]&&a[1]!==e)return swal({title:"Updated detected!",text:"Client assets have been updated. Reload to display the latest version?",icon:"info",buttons:{confirm:{text:"Reload",closeModal:!1}}}).then((function(){window.location.reload()}))},checkIfPublic:function(){return axios.get("api/check",{onDownloadProgress:function(){"undefined"==typeof render||render.done?page.apiChecked||(page.apiChecked=!0):render.do()}}).then((function(e){return e.data.version&&page.checkClientVersion(e.data.version),page.private=e.data.private,page.enableUserAccounts=e.data.enableUserAccounts,page.maxSize=parseInt(e.data.maxSize),page.maxSizeBytes=1e6*page.maxSize,page.chunkSizeConfig={max:e.data.chunkSize&&parseInt(e.data.chunkSize.max)||95,default:e.data.chunkSize&&parseInt(e.data.chunkSize.default)},page.temporaryUploadAges=e.data.temporaryUploadAges,page.fileIdentifierLength=e.data.fileIdentifierLength,page.stripTagsConfig=e.data.stripTags,page.preparePage()})).catch(page.onInitError)},preparePage:function(){if(!page.private)return page.prepareUpload();if(page.token)return page.verifyToken(page.token,!0);var e=document.querySelector("#loginToUpload");e.href="auth",e.classList.remove("is-loading"),page.enableUserAccounts?e.innerText="Anonymous upload is disabled.\nLog in or register to upload.":e.innerText="Running in private mode.\nLog in to upload."},verifyToken:function(e,a){return axios.post("api/tokens/verify",{token:e}).then((function(t){return!1===t.data.success?swal({title:"An error occurred!",text:t.data.description,icon:"error"}).then((function(){a&&(localStorage.removeItem("token"),window.location.reload())})):(localStorage[lsKeys.token]=e,page.token=e,page.prepareUpload())})).catch(page.onInitError)},prepareUpload:function(){if(page.token){var e=document.querySelector('#linksColumn a[href="auth"]');e&&e.setAttribute("href","dashboard"),document.querySelector("#albumDiv").classList.remove("is-hidden"),page.albumSelect=document.querySelector("#albumSelect"),page.albumSelectOnChange=function(){page.album=parseInt(page.albumSelect.value),"function"==typeof page.prepareShareX&&page.prepareShareX()},page.albumSelect.addEventListener("change",page.albumSelectOnChange),page.fetchAlbums()}else page.enableUserAccounts&&(document.querySelector("#loginLinkText").innerHTML="Create an account and keep track of your uploads");page.prepareUploadConfig(),document.querySelector("#maxSize > span").innerHTML=page.getPrettyBytes(page.maxSizeBytes),document.querySelector("#loginToUpload").classList.add("is-hidden"),page.prepareDropzone(),"function"==typeof page.prepareShareX&&page.prepareShareX();var a=document.querySelector("#urlMaxSize");a&&(page.urlMaxSize=parseInt(a.innerHTML),page.urlMaxSizeBytes=1e6*page.urlMaxSize,a.innerHTML=page.getPrettyBytes(page.urlMaxSizeBytes),document.querySelector("#uploadUrls").addEventListener("click",(function(e){page.addUrlsToQueue()})));for(var t=document.querySelector("#tabs"),n=t.querySelectorAll("li"),r=function(e){var a=n[e].dataset.id,t=document.querySelector("#"+a);t&&(n[e].addEventListener("click",(function(){page.setActiveTab(e)})),page.tabs.push({tab:n[e],content:t}))},i=0;i<n.length;i++)r(i);page.tabs.length&&(page.setActiveTab(0),t.classList.remove("is-hidden"))},setActiveTab:function(e){for(var a=0;a<page.tabs.length;a++)a===e?(page.tabs[a].tab.classList.add("is-active"),page.tabs[a].content.classList.remove("is-hidden"),page.activeTab=e):(page.tabs[a].tab.classList.remove("is-active"),page.tabs[a].content.classList.add("is-hidden"))},fetchAlbums:function(){return axios.get("api/albums",{headers:{token:page.token}}).then((function(e){if(!1===e.data.success)return swal("An error occurred!",e.data.description,"error");if(Array.isArray(e.data.albums)&&e.data.albums.length)for(var a=0;a<e.data.albums.length;a++){var t=e.data.albums[a],n=document.createElement("option");n.value=t.id,n.innerHTML=t.name,page.albumSelect.appendChild(n)}})).catch(page.onInitError)},prepareDropzone:function(){var e=document.querySelector("#tpl");page.previewTemplate=e.innerHTML,e.parentNode.removeChild(e);var a=document.querySelector("#tab-files"),t=document.createElement("div");t.className="control is-expanded",t.innerHTML='\n    <div id="dropzone" class="button is-danger is-outlined is-fullwidth is-unselectable">\n      <span class="icon">\n        <i class="icon-upload-cloud"></i>\n      </span>\n      <span>Click here or drag & drop files</span>\n    </div>\n  ',a.querySelector(".dz-container").appendChild(t);var n=a.querySelector("#tab-files .field.uploads");page.dropzone=new Dropzone(document.body,{url:"api/upload",paramName:"files[]",clickable:a.querySelector("#dropzone"),maxFilesize:page.maxSizeBytes/1024/1024,parallelUploads:page.parallelUploads,uploadMultiple:!1,previewsContainer:n,previewTemplate:page.previewTemplate,createImageThumbnails:!1,autoProcessQueue:!0,headers:{token:page.token},chunking:Boolean(page.chunkSize),chunkSize:1e6*page.chunkSize,parallelChunkUploads:!1,timeout:0,init:function(){this.on("addedfile",(function(e){0!==page.activeTab&&page.setActiveTab(0),a.querySelector(".uploads").classList.remove("is-hidden"),e.previewElement.querySelector(".name").innerHTML=e.name,e.previewElement.querySelector(".descriptive-progress").innerHTML="Waiting in queue…"})),this.on("sending",(function(e,a){a.ontimeout||(a.ontimeout=function(){var e=page.dropzone.getUploadingFiles().filter((function(e){return e.xhr===a}));page.dropzone._handleUploadError(e,a,"Connection timed out. Try to reduce upload chunk size.")}),void 0===a._uplSpeedCalc&&(a._uplSpeedCalc={lastSent:0,data:[{timestamp:Date.now(),bytes:0}]}),e.upload.chunked||(null!==page.album&&a.setRequestHeader("albumid",page.album),null!==page.fileLength&&a.setRequestHeader("filelength",page.fileLength),null!==page.uploadAge&&a.setRequestHeader("age",page.uploadAge),null!==page.stripTags&&a.setRequestHeader("striptags",page.stripTags)),e.upload.chunked?1===e.upload.chunks.length&&(e.previewElement.querySelector(".descriptive-progress").innerHTML="Uploading chunk 1/"+e.upload.totalChunkCount+"…"):e.previewElement.querySelector(".descriptive-progress").innerHTML="Uploading…"})),this.on("uploadprogress",(function(e,a){var t,n=Math.max(e.size,e.upload.total),r=(e.upload.bytesSent/n*100).toFixed(0),i=e.upload.chunked?e.upload.chunks[e.upload.chunks.length-1]:e.upload,l=i.xhr||e.xhr,o="Uploading…",s=!1;if(e.upload.chunked){var u=i.bytesSent===i.total,p=e.upload.chunks.length===e.upload.totalChunkCount,d=e.upload.chunks.length;u&&!p&&(d++,s=!0),o="Uploading chunk "+d+"/"+e.upload.totalChunkCount+"…"}if(!s){var c=Date.now(),g=i.bytesSent-l._uplSpeedCalc.lastSent;l._uplSpeedCalc.lastSent=i.bytesSent,l._uplSpeedCalc.data.push({timestamp:c,bytes:g});var m=l._uplSpeedCalc.data.length;if(m>2){for(var f=0,h=0,v=!1,b=m-1;b--;)if(v)l._uplSpeedCalc.data.splice(b,1);else if((f=c-l._uplSpeedCalc.data[b].timestamp)>1e3){var y=f-1e3,S=f-(c-l._uplSpeedCalc.data[b+1].timestamp);h+=(S-y)/S*l._uplSpeedCalc.data[b+1].bytes,v=!0}else h+=l._uplSpeedCalc.data[b+1].bytes;v||(h*=1e3/f),t=page.getPrettyBytes(h)}}e.previewElement.querySelector(".descriptive-progress").innerHTML=o+" "+r+"%"+(t?" at "+t+"/s":"")})),this.on("success",(function(e,a){a&&(e.previewElement.querySelector(".descriptive-progress").classList.add("is-hidden"),!1===a.success&&(e.previewElement.querySelector(".error").innerHTML=a.description,e.previewElement.querySelector(".error").classList.remove("is-hidden")),Array.isArray(a.files)&&a.files[0]&&page.updateTemplate(e,a.files[0]))})),this.on("error",(function(e,a,t){var n=a;"object"==typeof a&&a.description?n=a.description:t?n=page.onAxiosError({response:{status:t.status,statusText:t.statusText}},!0).data.description:a instanceof Error&&(n=a.toString()),/^File is too big/.test(n)&&/File too large/.test(n)&&(n="File too large ("+page.getPrettyBytes(e.size)+")."),page.updateTemplateIcon(e.previewElement,"icon-block"),e.previewElement.querySelector(".descriptive-progress").classList.add("is-hidden"),e.previewElement.querySelector(".error").innerHTML=n,e.previewElement.querySelector(".error").classList.remove("is-hidden")}))},chunksUploaded:function(e,a){return e.previewElement.querySelector(".descriptive-progress").innerHTML="Rebuilding "+e.upload.totalChunkCount+" chunks…",axios.post("api/upload/finishchunks",{files:[{uuid:e.upload.uuid,original:e.name,type:e.type,albumid:page.album,filelength:page.fileLength,age:page.uploadAge}]},{headers:{token:page.token,striptags:page.stripTags}}).catch((function(e){return page.onAxiosError(e,!0)})).then((function(t){return e.previewElement.querySelector(".descriptive-progress").classList.add("is-hidden"),!1===t.data.success&&(e.previewElement.querySelector(".error").innerHTML=t.data.description,e.previewElement.querySelector(".error").classList.remove("is-hidden")),t.data.files&&t.data.files[0]&&page.updateTemplate(e,t.data.files[0]),a()}))}})},addUrlsToQueue:function(){var e=document.querySelector("#urls").value.split(/\r?\n/).filter((function(e){return e.trim().length}));if(!e.length)return swal("An error occurred!","You have not entered any URLs.","error");var a=document.querySelector("#tab-urls");a.querySelector(".uploads").classList.remove("is-hidden");for(var t=0;t<e.length;t++){var n=document.createElement("template");n.innerHTML=page.previewTemplate.trim();var r=n.content.firstChild;r.querySelector(".name").innerHTML=e[t],r.querySelector(".descriptive-progress").innerHTML="Waiting in queue…",a.querySelector(".uploads").appendChild(r),page.urlsQueue.push({url:e[t],previewElement:r})}page.processUrlsQueue(),document.querySelector("#urls").value=""}};page.processUrlsQueue=function(){if(page.urlsQueue.length)return a();function e(e){return e.previewElement.querySelector(".descriptive-progress").innerHTML="Waiting for server to fetch URL…",axios.post("api/upload",{urls:[e.url]},{headers:{token:page.token,albumid:page.album,age:page.uploadAge,filelength:page.fileLength}}).catch((function(e){return page.onAxiosError(e,!0)})).then((function(t){return function(e,t){if(e.previewElement.querySelector(".descriptive-progress").classList.add("is-hidden"),!1===t.success){var n=t.description.match(/ over limit: (\d+)$/);n&&n[1]&&(t.description="File exceeded limit of "+page.getPrettyBytes(n[1])+"."),e.previewElement.querySelector(".error").innerHTML=t.description,e.previewElement.querySelector(".error").classList.remove("is-hidden")}return Array.isArray(t.files)&&t.files[0]&&page.updateTemplate(e,t.files[0]),page.activeUrlsQueue--,a()}(e,t.data)}))}function a(){for(;page.urlsQueue.length&&page.activeUrlsQueue<page.parallelUploads;)page.activeUrlsQueue++,e(page.urlsQueue.shift())}},page.updateTemplateIcon=function(e,a){var t=e.querySelector(".icon");t&&(t.classList.add(a),t.classList.remove("is-hidden"))},page.updateTemplate=function(e,a){if(a.url){var t=e.previewElement.querySelector(".link"),n=t.querySelector("a"),r=e.previewElement.querySelector(".clipboard-mobile > .clipboard-js");n.href=n.innerHTML=r.dataset.clipboardText=a.url,t.classList.remove("is-hidden"),r.parentElement.classList.remove("is-hidden");var i=/.[\w]+(\?|$)/.exec(a.url),l=i&&i[0]?i[0].toLowerCase():null;if(page.imageExts.includes(l))if(page.previewImages){var o=e.previewElement.querySelector("img");o.setAttribute("alt",a.name||""),o.dataset.src=a.url,o.classList.remove("is-hidden"),o.onerror=function(a){a.currentTarget.classList.add("is-hidden"),page.updateTemplateIcon(e.previewElement,"icon-picture")},page.lazyLoad.update(e.previewElement.querySelectorAll("img"))}else page.updateTemplateIcon(e.previewElement,"icon-picture");else page.videoExts.includes(l)?page.updateTemplateIcon(e.previewElement,"icon-video"):page.updateTemplateIcon(e.previewElement,"icon-doc-inv");if(a.expirydate){var s=e.previewElement.querySelector(".expiry-date");s.innerHTML="EXP: "+page.getPrettyDate(new Date(1e3*a.expirydate)),s.classList.remove("is-hidden")}}},page.createAlbum=function(){var e=document.createElement("div");e.innerHTML='\n    <div class="field">\n      <div class="controls">\n        <input id="swalName" class="input" type="text" placeholder="Name" maxlength="'+page.albumTitleMaxLength+'">\n      </div>\n      <p class="help">Max length is '+page.albumTitleMaxLength+' characters.</p>\n    </div>\n    <div class="field">\n      <div class="control">\n        <textarea id="swalDescription" class="textarea" placeholder="Description" rows="2" maxlength="'+page.albumDescMaxLength+'"></textarea>\n      </div>\n      <p class="help">Max length is '+page.albumDescMaxLength+' characters.</p>\n    </div>\n    <div class="field">\n      <div class="control">\n        <label class="checkbox">\n          <input id="swalDownload" type="checkbox" checked>\n          Enable download\n        </label>\n      </div>\n    </div>\n    <div class="field">\n      <div class="control">\n        <label class="checkbox">\n          <input id="swalPublic" type="checkbox" checked>\n          Enable public link\n        </label>\n      </div>\n    </div>\n  ',swal({title:"Create new album",icon:"info",content:e,buttons:{cancel:!0,confirm:{closeModal:!1}}}).then((function(e){if(e){var a=document.querySelector("#swalName").value.trim();axios.post("api/albums",{name:a,description:document.querySelector("#swalDescription").value.trim(),download:document.querySelector("#swalDownload").checked,public:document.querySelector("#swalPublic").checked},{headers:{token:page.token}}).then((function(e){if(!1===e.data.success)return swal("An error occurred!",e.data.description,"error");var t=document.createElement("option");page.albumSelect.appendChild(t),t.value=e.data.id,t.innerHTML=a,t.selected=!0,page.albumSelectOnChange(),swal("Woohoo!","Album was created successfully.","success")})).catch(page.onError)}}))},page.prepareUploadConfig=function(){var e={chunkSize:page.chunkSizeConfig.default,parallelUploads:2},a=Array.isArray(page.temporaryUploadAges)&&page.temporaryUploadAges.length,t=page.fileIdentifierLength&&"number"==typeof page.fileIdentifierLength.min&&"number"==typeof page.fileIdentifierLength.max,n={siBytes:{label:"File size display",select:[{value:"default",text:"1000 B = 1 kB = 1 Kilobyte"},{value:"0",text:"1024 B = 1 KiB = 1 Kibibyte"}],help:"This will be used in our homepage, dashboard, and album public pages.",valueHandler:function(){}},fileLength:{display:t,label:"File identifier length",number:t?{min:page.fileIdentifierLength.min,max:page.fileIdentifierLength.max,default:page.fileIdentifierLength.default,round:!0}:void 0,help:!0,disabled:t&&page.fileIdentifierLength.force},uploadAge:{display:a,label:"Upload age",select:[],help:"Whether to automatically delete your uploads after a certain amount of time."},stripTags:{display:page.stripTagsConfig,label:"Strip tags",select:page.stripTagsConfig?[{value:page.stripTagsConfig.default?"default":"1",text:"Yes"},{value:page.stripTagsConfig.default?"0":"default",text:"No"}]:null,help:"Whether to strip tags (e.g. EXIF) from your uploads.<br>\n        This only applies to regular image"+(page.stripTagsConfig&&page.stripTagsConfig.video?" and video":"")+" uploads (i.e. not URL uploads).",disabled:page.stripTagsConfig&&page.stripTagsConfig.force},chunkSize:{display:Boolean(page.chunkSizeConfig.default),label:"Upload chunk size (MB)",number:{min:1,max:page.chunkSizeConfig.max,default:e.chunkSize,suffix:" MB",round:!0},help:!0},parallelUploads:{label:"Parallel uploads",number:{min:1,max:10,default:e.parallelUploads,round:!0},help:!0},uploadsHistoryOrder:{label:"Uploads history order",select:[{value:"default",text:"Older files on top"},{value:"0",text:"Newer files on top"}],help:'"Newer files on top" will use a CSS technique, which unfortunately come with <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction#Accessibility_Concerns" target="_blank" rel="noopener">some undesirable side effects</a>.<br>\n        This also affects text selection, such as when trying to select text from top to bottom will result in them being selected from bottom to top instead, and vice versa.',valueHandler:function(e){if("0"===e)for(var a=document.querySelectorAll(".tab-content > .uploads"),t=0;t<a.length;t++)a[t].classList.add("is-reversed")}},previewImages:{label:"Load images for preview",select:[{value:"default",text:"Yes"},{value:"0",text:"No"}],help:"By default, uploaded images will be loaded as their previews.",valueHandler:function(e){page.previewImages="0"!==e}}};if(a)for(var r=parseFloat(localStorage[lsKeys.uploadAge]),i=0;i<page.temporaryUploadAges.length;i++){var l=page.temporaryUploadAges[i];n.uploadAge.select.push({value:0===i?"default":String(l),text:page.getPrettyUploadAge(l)}),l===r&&(n.uploadAge.value=r)}if(t){var o=parseInt(localStorage[lsKeys.fileLength]);!page.fileIdentifierLength.force&&!isNaN(o)&&o>=page.fileIdentifierLength.min&&o<=page.fileIdentifierLength.max&&(n.fileLength.value=o)}var s=document.querySelector("#tab-config"),u=document.createElement("form");u.addEventListener("submit",(function(e){return e.preventDefault()}));for(var p=Object.keys(n),d=0;d<p.length;d++){var c=p[d],g=n[c];if(!1!==g.display){var m=document.createElement("div");m.className="field";var f=void 0;if(!g.disabled){if(void 0!==g.value)f=g.value;else if(void 0!==g.number){var h=parseInt(localStorage[lsKeys[c]]);!isNaN(h)&&h<=g.number.max&&h>=g.number.min&&(f=h)}else{var v=localStorage[lsKeys[c]];f=Array.isArray(g.select)?g.select.find((function(e){return e.value===v}))?v:void 0:v}"function"==typeof g.valueHandler?g.valueHandler(f):void 0!==f?page[c]=f:void 0!==e[c]&&(page[c]=e[c])}var b=void 0;if(Array.isArray(g.select)){(b=document.createElement("div")).className="select is-fullwidth";for(var y=[],S=0;S<g.select.length;S++){var w=g.select[S],k=f&&w.value===String(f)||void 0===f&&"default"===w.value;y.push('\n          <option value="'+w.value+'"'+(k?" selected":"")+">\n            "+w.text+("default"===w.value?" (default)":"")+"\n          </option>\n        ")}b.innerHTML='\n        <select id="'+c+'">\n          '+y.join("\n")+"\n        </select>\n      "}else g.number&&((b=document.createElement("input")).id=b.name=c,b.className="input is-fullwidth",b.type="number",void 0!==g.number.min&&(b.min=g.number.min),void 0!==g.number.max&&(b.max=g.number.max),"number"==typeof f?b.value=f:void 0!==g.number.default&&(b.value=g.number.default));var L=void 0;if(g.disabled)Array.isArray(g.select)?b.querySelector("select").disabled=g.disabled:b.disabled=g.disabled,L="This option is currently not configurable.";else if("string"==typeof g.help)L=g.help;else if(!0===g.help&&void 0!==g.number){var x=[];void 0!==g.number.default&&x.push("Default is "+g.number.default+(g.number.suffix||"")+"."),void 0!==g.number.min&&x.push("Min is "+g.number.min+(g.number.suffix||"")+"."),void 0!==g.number.max&&x.push("Max is "+g.number.max+(g.number.suffix||"")+"."),L=x.join(" ")}m.innerHTML='\n      <label class="label">'+g.label+'</label>\n      <div class="control"></div>\n      '+(L?'<p class="help">'+L+"</p>":"")+"\n    ",m.querySelector("div.control").appendChild(b),u.appendChild(m)}}var T=document.createElement("div");T.className="field",T.innerHTML='\n    <p class="control">\n      <button id="saveConfig" type="submit" class="button is-danger is-outlined is-fullwidth">\n        <span class="icon">\n          <i class="icon-floppy"></i>\n        </span>\n        <span>Save & reload</span>\n      </button>\n    </p>\n    <p class="help">\n      This configuration will only be used in this browser.<br>\n      After reloading the page, some of them will also be applied to the ShareX config that you can download by clicking on the ShareX icon below.\n    </p>\n  ',u.appendChild(T),u.querySelector("#saveConfig").addEventListener("click",(function(){if(u.checkValidity()){for(var e=Object.keys(n).filter((function(e){return!1!==n[e].display&&!0!==n[e].disabled})),a=0;a<e.length;a++){var t=e[a],r=void 0;if(void 0!==n[t].select)"default"!==u.elements[t].value&&(r=u.elements[t].value);else if(void 0!==n[t].number){var i=parseInt(u.elements[t].value);isNaN(i)||i===n[t].number.default||(r=Math.min(Math.max(i,n[t].number.min),n[t].number.max))}void 0!==r?localStorage[lsKeys[t]]=r:localStorage.removeItem(lsKeys[t])}swal({title:"Woohoo!",text:"Configuration saved into this browser.",icon:"success"}).then((function(){window.location.reload()}))}})),s.appendChild(u)},page.getPrettyUploadAge=function(e){if(0===e)return"Permanent";if(e<1){var a=60*e;return a+" minute"+(1===a?"":"s")}if(e>=24){var t=e/24;return t+" day"+(1===t?"":"s")}return e+" hour"+(1===e?"":"s")},window.addEventListener("paste",(function(e){for(var a=(e.clipboardData||e.originalEvent.clipboardData).items,t=Object.keys(a),n=0;n<t.length;n++){var r=a[t[n]];if("file"===r.kind){var i=r.getAsFile(),l=new File([i],"pasted-image."+i.type.match(/(?:[^/]*\/)([^;]*)/)[1],{type:i.type});page.dropzone.addFile(l)}}})),window.addEventListener("DOMContentLoaded",(function(){window.cookieconsent&&window.cookieconsent.initialise({cookie:{name:"cookieconsent_status",path:window.location.pathname,expiryDays:730,secure:"https:"===window.location.protocol},palette:{popup:{background:"#282828",text:"#eff0f1"},button:{background:"#209cee",text:"#ffffff"}},theme:"classic",position:"bottom-left",content:{message:"We use cookies to offer you a better browsing experience and to analyze our traffic. You consent to our cookies if you continue to use this website.",dismiss:"Got it!",link:"Details in our Cookie Policy",href:"cookiepolicy"}}),page.checkIfPublic(),page.clipboardJS=new ClipboardJS(".clipboard-js"),page.clipboardJS.on("success",(function(){return swal("","The link has been copied to clipboard.","success",{buttons:!1,timer:1500})})),page.clipboardJS.on("error",page.onError),page.lazyLoad=new LazyLoad({elements_selector:".field.uploads img"}),document.querySelector("#createAlbum").addEventListener("click",(function(){page.createAlbum()}))}));
//# sourceMappingURL=home.js.map
