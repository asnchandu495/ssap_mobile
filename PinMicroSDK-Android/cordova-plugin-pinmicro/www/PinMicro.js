var exec = require('cordova/exec');

exports.beaconInitialize = function (refId, success, error) {
    exec(success, error, 'PinMicro', 'beaconInitialize', refId);
};

exports.startScanning = function (success, error) {
    exec(success, error, 'PinMicro', 'startScanning', []);
};

exports.stopScanning = function (success, error) {
    exec(success, error, 'PinMicro', 'stopScanning', []);
};

exports.resetSDK = function (success, error) {
    exec(success, error, 'PinMicro', 'resetSDK', []);
};

exports.disableBattery = function (success, error) {
    exec(success, error, 'PinMicro', 'disableBattery', []);
};
