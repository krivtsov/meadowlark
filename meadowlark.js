/* eslint-disable no-console */
/* jshint esversion: 6 */
const express = require('express');

const app = express();

const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: {
    section: (name, options) => {
      if (!this.sections) this.sections = {};
      this.sections[name] = options.fn(this);
      return null;
    },
  },
});

const fortune = require('./lib/fortune');

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

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

app.get('/tours/hood-river', (req, res) => {
  res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', (req, res) => {
  res.render('tours/request-group-rate');
});

app.get('/tours/oregon-coast', (req, res) => {
  res.render('tours/oregon-coast');
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
