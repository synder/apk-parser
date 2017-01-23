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

    var aapt = path.join(__dirname, 'bin', 'aapt_' + os.platform());
    var command = aapt + " d badging " + filepath;

    exec(command, function (err, stdout, stderr) {
        if (err) {
            return callback(err);
        }

        if (stderr) {
            return callback(new Error(stderr));
        }

        var infos = stdout.split('\n');

        var permissions = [];
        var features = [];
        var impliedFeatures = [];
        var architectureInfo = [];
        var supportsScreens = [];
        var densities = [];

        var infosTemp = {};

        infos.forEach(function (info) {
            if (info) {
                // var t = info.split(':');
                var t = info.split(/:(.+)/);
                if (t.length === 3) {
                    var key = t[0].trim();
                    var value = t[1].trim().replace(new RegExp("'", 'g'), "");
                    infosTemp[key] = value;
                    if (key == 'uses-permission') {
                        permissions.push(value);
                    } else if (key == 'uses-feature') {
                        features.push(value);
                    } else if (key == 'uses-implied-feature') {
                        impliedFeatures.push(value);
                    } else if (key == 'native-code' && value && value.length) {
                        architectureInfo = value.trim().split(' ');
                    } else if (key == 'supports-screens' && value && value.length) {
                        supportsScreens = value.trim().split(' ');
                    } else if (key == 'densities' && value && value.length) {
                        densities = value.trim().split(' ');
                    }
                }
            }
        });

        try {
            var packageInfo = infosTemp['package'].split(' ');
            var packageInfoTemp = {};

            packageInfo.forEach(function (info) {
                if (info) {
                    var t = info.split('=');
                    if (t.length === 2) {
                        packageInfoTemp[t[0].trim()] = t[1].trim().replace('\'', '');
                    }
                }
            });

            var applicationLabel = null;

            var applicationInfo = infosTemp['application'].split(' ');
            applicationInfo.forEach(function (info) {
                if (info) {
                    var t = info.split('=');
                    if (t.length === 2) {
                        if (t[0].trim() == 'label') {
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
                useImpliedFeature: impliedFeatures.sort(),
                architectureInfo: architectureInfo,
                supportsScreens: supportsScreens,
                densities: densities
            });
        } catch (err) {
            callback(err);
        }
    });
};

