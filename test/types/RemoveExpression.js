/* jshint globalstrict: true, es3: true, loopfunc: true */
/* globals require: false, describe: false, it: false */
'use strict';
var expect = require('expect.js'),
  types = require('../../types'),
  RemoveExpression = types.RemoveExpression,
  AqlError = require('../../errors').AqlError,
  isAqlError = function (e) {
    expect(e).to.be.an(AqlError);
  };

describe('RemoveExpression', function () {
  it('returns a statement', function () {
    var expr = new RemoveExpression(null, 'x', 'y');
    expect(expr).to.be.a(types._Statement);
    expect(expr.toAQL).to.be.a('function');
  });
  it('generates a REMOVE statement', function () {
    expect(new RemoveExpression(null, 'x', 'y').toAQL()).to.equal('REMOVE x IN y');
  });
  it('auto-casts expressions', function () {
    var arr = [42, 'id', 'some.ref', '"hello"', false, null];
    var ctors = [
      types.IntegerLiteral,
      types.Identifier,
      types.SimpleReference,
      types.StringLiteral,
      types.BooleanLiteral,
      types.NullLiteral
    ];
    for (var i = 0; i < arr.length; i++) {
      expect(new RemoveExpression(null, arr[i], 'y').expr.constructor).to.equal(ctors[i]);
    }
  });
  it('wraps Operation expressions in parentheses', function () {
    var op = new types._Operation();
    op.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, op, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps Statement expressions in parentheses', function () {
    var st = new types._Statement();
    st.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, st, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps PartialStatement expressions in parentheses', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return 'x';};
    expect(new RemoveExpression(null, ps, 'y').toAQL()).to.equal('REMOVE (x) IN y');
  });
  it('wraps well-formed strings as collection names', function () {
    var values = [
      '_',
      '_x',
      'all_lower_case',
      'snakeCaseAlso',
      'CamelCaseHere',
      'ALL_UPPER_CASE',
      '__cRaZy__'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(new RemoveExpression(null, 'x', values[i]).collection.toAQL()).to.equal(values[i]);
    }
  });
  it('does not accept malformed strings as collection names', function () {
    var values = [
      '',
      '-x',
      'in-valid',
      'also bad',
      'überbad',
      'spaß'
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new RemoveExpression(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('does not accept any other values as collection names', function () {
    var values = [
      new types.StringLiteral('for'),
      new types.RawExpression('for'),
      new types.SimpleReference('for'),
      new types.Keyword('for'),
      new types.NullLiteral(null),
      42,
      true,
      function () {},
      {},
      []
    ];
    for (var i = 0; i < values.length; i++) {
      expect(function () {new RemoveExpression(null, 'x', values[i]);}).to.throwException(isAqlError);
    }
  });
  it('converts preceding nodes to AQL', function () {
    var ps = new types._PartialStatement();
    ps.toAQL = function () {return '$';};
    expect(new RemoveExpression(ps, 'x', 'y').toAQL()).to.equal('$ REMOVE x IN y');
  });
  describe('options', function () {
    var expr = new RemoveExpression(null, 'x', 'y');
    it('returns a RemoveExpressionWithOptions', function () {
      var optExpr = expr.options({});
      expect(optExpr).to.be.a(types._RemoveExpressionWithOptions);
      expect(optExpr.toAQL).to.be.a('function');
    });
    it('wraps objects', function () {
      var obj = {a: 1, b: 2, c: 3};
      var optExpr = expr.options(obj);
      expect(optExpr.opts.value).to.be.an(Object);
      expect(Object.keys(optExpr.opts.value)).to.eql(Object.keys(obj));
    });
    it('clones ObjectLiteral instances', function () {
      var src = new types.ObjectLiteral({a: 1, b: 2, c: 3}),
        copy = expr.options(src).opts;
      expect(src.toAQL()).to.equal(copy.toAQL());
      expect(src).not.to.equal(copy);
    });
  });
});