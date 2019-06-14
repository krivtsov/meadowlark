/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */

const expect = require('chai').expect;
const fortune = require('../lib/fortune.js');

suite('Fortune cookie tests', () => {
  test('getFortune() should return a fortune', () => {
    expect(typeof fortune.getFortune() === 'string');
  });
});
