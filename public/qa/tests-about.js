/* eslint-disable no-undef */
suite('Test page About', () => {
  test('страница должа содержать ссылку на страницу контактов', () => {
    assert($('a[href="/contact"]').length);
  });
});
