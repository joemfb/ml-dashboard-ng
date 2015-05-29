(function () {

  'use strict';

  angular.module('ml.dashboard')
    .factory('MLDashboardService', MLDashboardService);

  MLDashboardService.$inject = ['$http', 'MLSearchFactory','MLRest'];

  function MLDashboardService($http, MLSearchFactory, mlRest) {
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

      var combinedQuery  = {
        search: {
          query: mlSearch.getQuery(),
          options: {
            constraint: allConstraints,
            tuples: [tuple]
          }
        }
      };

      var params = { format: 'json' }

      if ( limit ) {
        params.limit = limit;
      }

      return mlRest.values('payordash', params, combinedQuery).then(function(data) {
        return data.data;
      });
    }
  }
})();
