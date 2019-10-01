/**
 * Created by synder on 2016/10/12.
 */


var os = require('os');
var path = require('path');
var exec = require('child_process').exec;

/**
 * @desc parse android apk info
 * */
exports.parse = function (filepath, callback) {

    var aapt = path.join(__dirname, 'bin', 'aapt_' + (os.platform() === 'win32' ? os.platform() + '.exe' : os.platform()));
    var command = aapt + " d badging " + filepath;

    exec(command, function (err, stdout, stderr) {
        if(err){
            return callback(err);
        }

        if(stderr){
            return callback(new Error(stderr));
        }

        var infos = stdout.split('\n');

        var permissions = [];
        var features = [];
        var impliedFeatures = [];

        var infosTemp = {};


        infos.forEach(function (info) {
            if(info){
                var t = info.split(':');
                if(t.length == 2){
                    var key = t[0].trim();
                    var value = t[1].trim().replace(new RegExp("'", 'g'), "");
                    infosTemp[key] = value;
                    if(key == 'uses-permission'){
                        permissions.push(value);
                    }else if(key == 'uses-feature'){
                        features.push(value);
                    }else if(key == 'uses-implied-feature'){
                        impliedFeatures.push(value);
                    }
                }
            }
        });

        var packageInfo = infosTemp['package'].split(' ');
        var packageInfoTemp = {};

        packageInfo.forEach(function (info) {
            if(info){
                var t = info.split('=');
                if(t.length === 2){
                    packageInfoTemp[t[0].trim()] = t[1].trim().replace('\'', '');
                }
            }
        });

        var applicationInfo = infosTemp['application'].split(' ');
        var applicationLabel = null;

        applicationInfo.forEach(function (info) {
            if(info){
                var t = info.split('=');
                if(t.length === 2){
                    if(t[0].trim() == 'label'){
                        applicationLabel = t[1].trim().replace('\'', '');
                    }
                }
            }
        });

        callback(null, {
            packageName: packageInfoTemp['name'],
            packageVersionName: packageInfoTemp['versionName'],
            packageVersionCode: parseInt(packageInfoTemp['versionCode']),
            applicationLabel: applicationLabel,
            sdkVersion: parseInt(infosTemp['sdkVersion']),
            targetSdkVersion: parseInt(infosTemp['targetSdkVersion']),
            usesPermission: permissions.sort(),
            usesFeature: features.sort(),
            useImpliedFeature: impliedFeatures.sort()
        });
    });
};

