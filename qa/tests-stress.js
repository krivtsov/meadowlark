/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
const loadtest = require('loadtest');
const expect = require('chai').expect;

suite('Stress tests', () => {
  test('Home page open 50 in sec', (done) => {
    const options = {
      url: 'https://localhost:3000',
      concurrency: 4,
      maxRequests: 50,
    };
    loadtest.loadTest(options, (err, result) => {
      expect(!err);
      expect(result.totalTimeSecondc < 1);
      done();
    });
  });
});
