/**
 * Created by synder on 2016/10/12.
 */


var x = require('../index');

x.parse('./zssq-duowei-1652-1010.apk', function (err, info) {
   if(err){
       return console.error(err);
   }

   console.log(info);
});