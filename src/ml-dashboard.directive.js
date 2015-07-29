(function () {

  'use strict';

  angular.module('ml.dashboard')
  .directive('mlDashboard', mlDashboardDirective)
  .controller('MLDashboardCtrl', MLDashboardCtrl);


  function mlDashboardDirective() {
    return {
      restrict: 'EA',
      replace: false,
      scope: {
        constraints: '='
      },
      templateUrl: '/templates/ml-dashboard.html',
      controller: 'MLDashboardCtrl'
      // ,
      // controllerAs: 'payorDashCtrl'
    };
  }

  MLDashboardCtrl.$inject = ['$scope', 'MLRest']; //, 'MLDashboardService'

  function MLDashboardCtrl($scope, mLRest) { //, payorService

    angular.extend($scope, {
      addWidget: addWidget,
      removeWidget: removeWidget,
      saveWidgets: saveWidgets,
      suggest: suggest,
      widgets: []
    });

    (function init() {
      getWidgets();
      groupConstraints();

      console.log( $scope.constraints )
      console.log( $scope.groupedConstraints )
    })();

    function groupConstraints() {
      $scope.groupedConstraints = $scope.groupedConstraints || {};

      _.each($scope.constraints, function(constraint) {
        var tokens = constraint.name.split('_'),
            group = tokens[0];

        constraint.ext = {
          prettyName: tokens.join(' '),
          extraPrettyName: tokens[1]
        };

        $scope.groupedConstraints[ group ] = $scope.groupedConstraints[ group ] || [];
        $scope.groupedConstraints[ group ].push( constraint );
        constraint.name.replace(/_/g, ' ');
      });
    }

    function addWidget() {
      $scope.widgets.push({
        dimensions: [],
        activeConstraints: [],
        size: 'Full',
        outputType: 'Table',
        resultLimit: 100
      });
    }

    function removeWidget(idx) {
      $scope.widgets.splice(idx, 1);
    }

    function saveWidgets() {
      mLRest.updateDocument($scope.widgets, {
        uri: '/widgets/widget.json',
        collection: 'widgets'
      });
    }

    function getWidgets() {
      mLRest.getDocument('/widgets/widget.json').then(function(resp) {
        var widgets = resp.data || [];

        _.each(widgets, function(widget) {
          widget.dimensions = _.map(widget.dimensions, function(dimension) {
            return _.find($scope.constraints, function(constraint) { return constraint.name === dimension.name; });
          });
        });

        $scope.widgets = widgets;
      });
    }

    function suggest(constraint, val) {
      var params = {
        format: 'json',
        'partial-q': val
      };

      var combined = {
        search: {
          query: {
            'and-query': []
          },
          options: {
            constraint: [_.omit(constraint, ['prettyName', 'extraPrettyName'])],
            'suggestion-source': [{
              ref: constraint.name,
              'suggestion-option': [
                'frequency-order',
                'descending'
              ]
            }],
            'default-suggestion-source': {
              ref: constraint.name
            }
          }
        }
      };
      return mLRest.suggest(params, combined).then(function(res) {
        return res.data.suggestions || [];
      });
    }
  }

})();
