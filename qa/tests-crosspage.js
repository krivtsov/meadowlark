/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
const Browser = require('zombie');

let browser;

suite('Cross-Page Tests', () => {
  setup(() => {
    browser = new Browser();
  });
  test('requesting a group rate quote from the hood river tour page'
  + 'should populate the referrer field', (done) => {
    const referrer = 'http://localhost:3000/tours/hood-river';
    browser.visit(referrer, () => {
      browser.clickLink('.requestGroupRate', () => {
        browser.assert.element('form input[name=referrer]', referrer);
        done();
      });
    });
  });

  test('requesting a group rate from the oregon coast tour page should '
  + 'populate the referrer field', (done) => {
    const referrer = 'http://localhost:3000/tours/oregon-coast';
    browser.visit(referrer, () => {
      browser.clickLink('.requestGroupRate', () => {
        browser.assert.element('form input[name=referrer]', referrer);
        done();
      });
    });
  });

  test('visiting the "request group rate" page dirctly should result '
  + 'in an empty referrer field', (done) => {
    browser.visit('http://localhost:3000/tours/request-group-rate',
      () => {
        browser.assert.element('form input[name=referrer]', '');
        done();
      });
  });
});
