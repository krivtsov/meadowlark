/* eslint-disable no-console */
const express = require('express');

const app = express();

const handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

const fortune = require('./lib/fortune');

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js',
  });
});

app.use((req, res) => {
  res.status(404);
  res.render('404');
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500);
  res.render('home');
});

app.listen(app.get('port'), () => {
  console.log(`Express starting on http://localhost:${app.get('port')} press ctrl + C for Exit`);
});
