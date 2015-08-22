define([
  'angular',
  'app',
  'lodash',
  'config',
  'components/panelmeta',
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

  module.controller('TriggersPanelCtrl', function($scope, panelSrv, backendSrv) {

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

      /*return backendSrv.search(params).then(function(result) {
        $scope.dashList = result;
        $scope.panelRenderingComplete();
      });*/

      return $scope.datasource.zabbixAPI.getTriggers($scope.panel.limit)
        .then(function(result) {
          $scope.triggerList = _.map(result, function (trigger) {
            var lastchange = new Date(+trigger.lastchange * 1000);
            var age = new Date(Date.now() - lastchange);
            return {
              host: trigger.host,
              description: trigger.description,
              priority: trigger.priority,
              lastchange: lastchange.toUTCString(),
              age: age.toLocaleTimeString(),
            };
          });
          $scope.panelRenderingComplete();
        });
    };

    $scope.init();
  });
});
