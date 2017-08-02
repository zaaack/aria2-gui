(function () {
    'use strict';

    angular.module('ariaNg').factory('aria2SettingService', ['aria2AllOptions', 'aria2GlobalAvailableOptions', 'aria2QuickSettingsAvailableOptions', 'aria2TaskAvailableOptions', 'aria2RpcService', 'ariaNgLogService', function (aria2AllOptions, aria2GlobalAvailableOptions, aria2QuickSettingsAvailableOptions, aria2TaskAvailableOptions, aria2RpcService, ariaNgLogService) {
        var processStatResult = function (stat) {
            if (!stat) {
                return stat;
            }

            var activeCount = parseInt(stat.numActive);
            var waitingCount = parseInt(stat.numWaiting);
            var totalRunningCount = activeCount + waitingCount;

            stat.totalRunningCount = totalRunningCount;

            return stat;
        };

        return {
            getAvailableGlobalOptionsKeys: function (type) {
                if (type === 'basic') {
                    return aria2GlobalAvailableOptions.basicOptions;
                } else if (type === 'http-ftp-sftp') {
                    return aria2GlobalAvailableOptions.httpFtpSFtpOptions;
                } else if (type === 'http') {
                    return aria2GlobalAvailableOptions.httpOptions;
                } else if (type === 'ftp-sftp') {
                    return aria2GlobalAvailableOptions.ftpSFtpOptions;
                } else if (type === 'bt') {
                    return aria2GlobalAvailableOptions.btOptions;
                } else if (type === 'metalink') {
                    return aria2GlobalAvailableOptions.metalinkOptions;
                } else if (type === 'rpc') {
                    return aria2GlobalAvailableOptions.rpcOptions;
                } else if (type === 'advanced') {
                    return aria2GlobalAvailableOptions.advancedOptions;
                } else {
                    return false;
                }
            },
            getaria2QuickSettingsAvailableOptions: function (type) {
                if (type === 'globalSpeedLimit') {
                    return aria2QuickSettingsAvailableOptions.globalSpeedLimitOptions;
                } else {
                    return false;
                }
            },
            getAvailableTaskOptionKeys: function (status, isBittorrent) {
                var allOptions = aria2TaskAvailableOptions.taskOptions;
                var availableOptions = [];

                for (var i = 0; i < allOptions.length; i++) {
                    var option = allOptions[i];
                    var optionKey = {
                        key: option.key,
                        category: option.category
                    };

                    if (option.canShow && option.canShow.indexOf(status) < 0) {
                        continue;
                    }

                    if (option.category === 'http' && isBittorrent) {
                        continue;
                    } else if (option.category === 'bittorrent' && !isBittorrent) {
                        continue;
                    }

                    if (option.canUpdate && option.canUpdate.indexOf(status) < 0) {
                        optionKey.readonly = true;
                    }

                    availableOptions.push(optionKey);
                }

                return availableOptions;
            },
            getNewTaskOptionKeys: function () {
                var allOptions = aria2TaskAvailableOptions.taskOptions;
                var availableOptions = [];

                for (var i = 0; i < allOptions.length; i++) {
                    var option = allOptions[i];
                    var optionKey = {
                        key: option.key,
                        category: option.category
                    };

                    if (option.canShow && option.canShow.indexOf('new') < 0) {
                        continue;
                    }

                    if (option.canUpdate && option.canUpdate.indexOf('new') < 0) {
                        optionKey.readonly = true;
                    }

                    availableOptions.push(optionKey);
                }

                return availableOptions;
            },
            getSpecifiedOptions: function (keys, extendSettings) {
                var options = [];

                if (!keys) {
                    return options;
                }

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var readonly = false;
                    var category = null;

                    if (angular.isObject(key)) {
                        var optionKey = key;

                        key = optionKey.key;
                        readonly = !!optionKey.readonly;
                        category = optionKey.category;
                    }

                    var option = aria2AllOptions[key];

                    if (!option) {
                        continue;
                    }

                    option = angular.extend({
                        key: key,
                        nameKey: 'options.' + key + '.name',
                        descriptionKey: 'options.' + key + '.description'
                    }, option);

                    if (category) {
                        option.category = category;
                    }

                    if (option.type === 'boolean') {
                        option.options = ['true', 'false'];
                    }

                    if (readonly) {
                        option.readonly = true;
                    }

                    if (extendSettings && extendSettings.disableRequired) {
                        option.required = false;
                    }

                    if (option.options) {
                        var availableOptions = [];

                        for (var j = 0; j < option.options.length; j++) {
                            availableOptions.push({
                                name: 'options.' + option.options[j],
                                value: option.options[j]
                            });
                        }

                        option.options = availableOptions;
                    }

                    options.push(option);
                }

                return options;
            },
            getGlobalOption: function (callback, silent) {
                return aria2RpcService.getGlobalOption({
                    silent: !!silent,
                    callback: callback
                });
            },
            setGlobalOption: function (key, value, callback, silent) {
                var data = {};
                data[key] = value;

                return aria2RpcService.changeGlobalOption({
                    options: data,
                    silent: !!silent,
                    callback: callback
                });
            },
            getAria2Status: function (callback, silent) {
                return aria2RpcService.getVersion({
                    silent: !!silent,
                    callback: callback
                });
            },
            getGlobalStat: function (callback, silent) {
                return aria2RpcService.getGlobalStat({
                    silent: !!silent,
                    callback: function (response) {
                        if (!callback) {
                            ariaNgLogService.warn('[aria2SettingService.getGlobalStat] callback is null');
                            return;
                        }

                        var stat = processStatResult(response);
                        callback(stat);
                    }
                });
            },
            saveSession: function (callback, silent) {
                return aria2RpcService.saveSession({
                    silent: !!silent,
                    callback: callback
                });
            },
            shutdown: function (callback, silent) {
                return aria2RpcService.shutdown({
                    silent: !!silent,
                    callback: callback
                });
            }
        };
    }]);
}());
