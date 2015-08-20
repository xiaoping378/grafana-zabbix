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

    $scope.dashList = [];

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

      return backendSrv.search(params).then(function(result) {
        $scope.dashList = result;
        $scope.panelRenderingComplete();
      });
    };

    $scope.init();
  });
});
