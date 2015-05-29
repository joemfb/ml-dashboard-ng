/* global describe, beforeEach, module, it, expect, inject */

describe('MLDashboard', function () {
  'use strict';

  var $q, $httpBackend, factory, dashboardService

  beforeEach(module('ml.dashboard'));

  beforeEach(inject(function ($injector) {
    $q = $injector.get('$q');
    $httpBackend = $injector.get('$httpBackend');
    factory = $injector.get('MLSearchFactory', $q, $httpBackend);
    dashboardService = $injector.get('MLDashboardService', $httpBackend, factory);
  }));

  it('exists', function() {
    expect(dashboardService).toBeDefined;
  });
});
