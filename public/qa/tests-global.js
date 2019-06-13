/* eslint-disable no-undef */
suite('Global Tests', () => {
  test('У данной страницы заголовок', () => {
    assert(document.title && document.title.match(/\S/) && document.title.toUpperCase() !== 'TODO');
  });
});
