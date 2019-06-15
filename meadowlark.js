/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* jshint esversion: 6 */
const express = require('express');
const formidable = require('formidable');

const app = express();

const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: {
    section: (name, options) => {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});

const getWeatherData = () => ({
  locations: [
    {
      name: 'Portland',
      forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
      weather: 'Overcast',
      temp: '54.1 F (12.3 C)',
    },
    {
      name: 'Bend',
      forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
      weather: 'Partly Cloudy',
      temp: '55.0 F (12.8 C)',
    },
    {
      name: 'Manzanita',
      forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
      iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
      weather: 'Light Rain',
      temp: '55.0 F (12.8 C)',
    },
  ],
});

const fortune = require('./lib/fortune');

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.set('port', process.env.PORT || 3000);

app.use(express.static(`${__dirname}/public`));
app.use(require('body-parser').urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
  next();
});

app.use((req, res, next) => {
  if (!res.locals.partials) res.locals.partials = {};
  res.locals.partials.weatherContext = getWeatherData();
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

app.get('/nursery-rhyme', (req, res) => {
  res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', (req, res) => {
  res.json({
    animal: 'бельчонок',
    bodyPart: 'хвост',
    adjective: 'пушистый',
    noun: 'гигант',
  });
});

app.get('/newsletter', (req, res) => {
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});

// app.post('/process', (req, res) => {
//   console.log(`Form (from querysrting): ${req.query.form}`);
//   console.log(`CSRF token (from hidden form field): ${req.body._csrf}`);
//   console.log(`Name (from visible form field): ${req.body.name}`);
//   console.log(`Email (from visible form field): ${req.body.email}`);
//   res.redirect(303, '/thank-you');
// });

app.post('/process', (req, res) => {
  if (req.xhr || req.accepts('json,html') === 'json') {
    // if there were an error, we would send { error: 'error description' }
    res.send({ success: true });
  } else {
  // if there were an error, we would redirect to an error page
    res.redirect(303, '/thank-you');
  }
});

app.get('/contest/vacation-photo', (req, res) => {
  const now = new Date();
  res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});

app.post('/contest/vacation-photo/:year/:month', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.redirect(303, '/error');
    }
    console.log('recieved fields');
    console.log(fields);
    console.log('recieved files: ');
    console.log(files);
    res.redirect(303, '/thank-you');
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
