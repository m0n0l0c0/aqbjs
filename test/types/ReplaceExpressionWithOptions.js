/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  ReplaceExpressionWithOptions = types.ReplaceExpressionWithOptions,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('ReplaceExpressionWithOptions', function () {
  it.skip('has tests', function () {
    expect(true).to.equal(false);
  });
});