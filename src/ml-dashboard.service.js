(function () {

  'use strict';

  angular.module('ml.dashboard')
    .factory('MLDashboardService', MLDashboardService);

  MLDashboardService.$inject = ['$http', 'MLSearchFactory'];

  function MLDashboardService($http, MLSearchFactory) {
    var mlSearch = MLSearchFactory.newContext();
    var service = {
      getTuples: getTuples
    };

    return service;

    function getTuples(dimensions, allConstraints, constraints, query, limit) {
      var tuple = {
        name: 'payordash',
        'values-option': [
          'descending',
          'frequency-order'
        ]
      };

      // build tuples from dimensions
      _.each(dimensions, function(dimension) {
        if (!dimension.name) {
          return;
        }

        if (dimension.uri) {
          tuple.uri = dimension.uri;
        }
        else {
          _.each(dimension, function(value, key) {
            if (key !== 'name' && key !== 'prettyName' && key !== 'extraPrettyName') {
              if (!tuple[key]) {
                tuple[key] = [];
              }
              tuple[key].push(value);
            }
          });
        }
      });

      mlSearch.clearAllFacets();
      mlSearch.setText(query);

      // build facets from constraints
      _.each(constraints, function(constraint) {
        if (constraint.constraint && constraint.value) {
          var type = constraint.constraint.collection ? 'collection' :
            constraint.constraint.custom ? 'custom' :
            constraint.constraint.range.type;
          mlSearch.selectFacet(constraint.constraint.name, constraint.value, type);
        }
      });

      var options  = {
        search: {
          query: mlSearch.getQuery(),
          options: {
            constraint: allConstraints,
            tuples: [tuple]
          }
        }
      };

      var url = '/v1/values/payordash?format=json';
      if (limit) {
        url = url + '&limit=' + limit;
      }
      return $http.post(url, options).then(function(data) {
        return data.data;
      });
    }
  }
})();
