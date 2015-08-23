define([
  'angular',
  'app',
  'lodash',
  'config',
  'components/panelmeta',
  'plugins/datasource/zabbix/helperFunctions',
],
function (angular, app, _, config, PanelMeta) {
  'use strict';

  var module = angular.module('grafana.panels.triggers', []);
  app.useModule(module);

  module.directive('grafanaPanelTriggers', function() {
    return {
      controller: 'TriggersPanelCtrl',
      templateUrl: 'app/panels/triggers/module.html',
    };
  });

  module.controller('TriggersPanelCtrl', function($scope, panelSrv, backendSrv, zabbixHelperSrv) {

    $scope.panelMeta = new PanelMeta({
      panelName: 'Zabbix triggers',
      editIcon:  "fa fa-star",
      fullscreen: true,
    });

    $scope.panelMeta.addEditorTab('Options', 'app/panels/triggers/editor.html');

    var defaults = {
      mode: 'starred',
      query: '',
      limit: 10,
      tags: []
    };

    $scope.modes = ['starred', 'search'];

    _.defaults($scope.panel, defaults);

    $scope.triggerList = [];

    $scope.init = function() {
      panelSrv.init($scope);
      if ($scope.panel.tag) {
        $scope.panel.tags = [$scope.panel.tag];
      }

      if ($scope.isNewPanel()) {
        $scope.panel.title = "Zabbix Triggers";
      }
    };

    $scope.refreshData = function() {
      var params = {
        limit: $scope.panel.limit
      };

      if ($scope.panel.mode === 'starred') {
        params.starred = "true";
      } else {
        params.query = $scope.panel.query;
        params.tag = $scope.panel.tags;
      }

      var triggerColors = {
        0: '#DBDBDB',
        1: '#D6F6FF',
        2: '#FFF6A5',
        //3: 'rgb(137, 15, 2)',
        3: '#FFB689',
        4: '#FF9999',
        5: '#FF3838',
      };
      $scope.triggerColors = triggerColors;

      return $scope.datasource.zabbixAPI.getTriggers($scope.panel.limit)
        .then(function(result) {
          $scope.triggerList = _.map(result, function (trigger) {
            var lastchange = new Date(+trigger.lastchange * 1000);
            var now = new Date();

            // Consider local time offset
            var ageUnix = now - lastchange + now.getTimezoneOffset() * 60000;
            var age = zabbixHelperSrv.toZabbixAgeFormat(ageUnix);
            return {
              host: trigger.host,
              description: trigger.description,
              priority: trigger.priority,
              lastchange: lastchange.toLocaleString(),
              age: age.toLocaleString(),
              url: trigger.url,
              color: triggerColors[trigger.priority],
            };
          });
          $scope.panelRenderingComplete();
        });
    };

    $scope.init();
  });
});
