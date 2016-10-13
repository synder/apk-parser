# apker 
### A android platform-tool 'aapt' node wraper

## Install

   $ npm install -g apker
  
### Parse android APK info
```
apker -p <apk-path>
apker --path=<apk-path>
```
    
## Use in code
```js
var parser = require('apker');
parser.parse('./**.apk', function (err, info) {
   if(err){
       return console.error(err);
   }

   console.log(info);
});
```    