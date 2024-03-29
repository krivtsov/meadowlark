/* eslint-disable array-callback-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* jshint esversion: 6 */
const express = require('express');
const formidable = require('formidable');
// const expressLogger = require('express-logger');
const morgan = require('morgan');
const cluster = require('cluster');
const domain = require('domain').create();
const mongoose = require('mongoose');

const app = express();

const handlebars = require('express-handlebars').create({
  defaultLayout: 'main',
  extname: 'handlebars',
  helpers: {
    section: (name, options) => {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    },
  },
});

const credentials = require('./credentials');
const Vacation = require('./models/vacation.js');

const opts = {
  useNewUrlParser: true,
  server: {
    socketOptions: { keepAlive: 1 },
  },
};

switch (app.get('env')) {
  case 'development':
    mongoose.connect(credentials.mongo.development.connectionString, opts);
    break;
  case 'production':
    mongoose.connect(credentials.mongo.production.connectionString, opts);
    break;
  default:
    throw new Error(`Error env = ${app.get('env')}`);
}

Vacation.find((err, vacations) => {
  if (vacations.length) return;

  new Vacation({
    name: 'Hood River Day Trip',
    slug: 'hood-river-day-trip',
    category: 'Day Trip',
    sku: 'HR199',
    description: 'Spend a day sailing on the Columbia and enjoying craft beers in Hood River!',
    priceInCents: 9995,
    tags: ['day trip', 'hood river', 'sailing', 'windsurfing', 'breweries'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Oregon Coast Getaway',
    slug: 'oregon-coast-getaway',
    category: 'Weekend Getaway',
    sku: 'OC39',
    description: 'Enjoy the ocean air and quaint coastal towns!',
    priceInCents: 269995,
    tags: ['weekend getaway', 'oregon coast', 'beachcombing'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
  }).save();

  new Vacation({
    name: 'Rock Climbing in Bend',
    slug: 'rock-climbing-in-bend',
    category: 'Adventure',
    sku: 'B99',
    description: 'Experience the thrill of rock climbing in the high desert.',
    priceInCents: 289995,
    tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing', 'hiking', 'skiing'],
    inSeason: true,
    requiresWaiver: true,
    maximumGuests: 4,
    available: false,
    packagesSold: 0,
    notes: 'The tour guide is currently recovering from a skiing accident.',
  }).save();
});

app.use((req, res, next) => {
  domain.on('error', (err) => {
    console.error('Error Domain\n', err.stack);
    try {
      setTimeout(() => {
        console.error('Stop 5 sec');
        process.exit(1);
      }, 5000);
      const { worker } = cluster.worker;
      if (worker) worker.disconnect();
      startServer.close();
      try {
        next(err);
      } catch (e) {
        console.error('Express Error,\n', e.stack);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('Error Server');
      }
    } catch (e) {
      console.error('Dont send response 500,\n', e.stack);
    }
  });

  domain.add(req);
  domain.add(res);
  domain.run(next);
});

app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
  resave: false,
  saveUninitialized: false,
  secret: credentials.cookieSecret,
}));

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

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

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


app.use((req, res, next) => {
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

switch (app.get('env')) {
  case 'production':
    // app.use(expressLogger({ path: `${__dirname}/log/requets.log` }));
    break;
  default:
    app.use(morgan('dev'));
    break;
}

app.use((req, res, next) => {
  if (cluster.isWorker) console.log('request %d', cluster.worker.id);
  next();
});

app.get('/', (req, res) => {
  res.cookie('monster', 'nom nom');
  res.cookie('signed_monster', 'Nom Nom', { signed: true });
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

app.get('/jquerytest', (req, res) => {
  res.render('jquerytest');
});

app.get('/newsletter', (req, res) => {
  res.render('newsletter', { csrf: 'CSRF token goes here' });
});

app.get('/vacations', (req, res) => {
  Vacation.find({ available: true }, (err, vacations) => {
    const context = {
      // test: 'ererr',
      vacations: vacations.map(vacation => ({
        sku: vacation.sku,
        name: vacation.name,
        description: vacation.description,
        price: vacation.getDisplayPrice(),
        inSeason: vacation.inSeason,
      })),
    };
    res.render('vacations', context);
  });
});

const VacationInSeasonListener = require('./models/vacationInSeasonListener');

app.get('/notify-me-when-in-season', (req, res) => {
  res.render('notify-me-when-in-season', { sku: req.query.sku });
});

app.post('/notify-me-when-in-season', (req, res) => {
  VacationInSeasonListener.update(
    { email: req.body.email },
    { $push: { skus: req.body.sku } },
    { upset: true },
    (err) => {
      if (err) {
        console.error(err.stack);
        req.session.flash = {
          type: 'danger',
          intro: 'Uuups!',
          message: 'an error occurred while processing your request',
        };
        return res.redirect(303, '/vacations');
      }
      req.session.flash = {
        type: 'success',
        intro: 'thanks',
        message: 'you will be notified when the season comes for this tour',
      };
      return res.redirect(303, '/vacations');
    },
  );
});

// app.get('/fail', (req, res) => {
//   throw new Error('No');
// });

// app.get('/epic-fail', (req, res) => {
//   process.nextTick(() => {
//     throw new Error('Boom');
//   });
// });

// const NewsletterSignup = () => { };

// //NewsletterSignup.prototype.save = cb => cb();

// app.post('/newsletter', (req, res) => {
//   const name = req.body.name || '';
//   const email = req.body.email || '';
//   // input validation
//   if (!email.match(VALID_EMAIL_REGEX)) {
//     if (req.xhr) return res.json({ error: 'Invalid name email address.' });
//     req.session.flash = {
//       type: 'danger',
//       intro: 'Validation error!',
//       message: 'The email address you entered was  not valid.',
//     };
//     return res.redirect(303, '/newsletter/archive');
//   }
//   new NewsletterSignup({ name: name, email: email }).save((err) => {
//     if (err) {
//       if (req.xhr) return res.json({ error: 'Database error.' });
//       req.session.flash = {
//         type: 'danger',
//         intro: 'Database error!',
//         message: 'There was a database error; please try again later.',
//       };
//       return res.redirect(303, '/newsletter/archive');
//     }
//     if (req.xhr) return res.json({ success: true });
//     req.session.flash = {
//       type: 'success',
//       intro: 'Thank you!',
//       message: 'You have now been signed up for the newsletter.',
//     };
//     return res.redirect(303, '/newsletter/archive');
//   });
// });

// app.get('/newsletter/archive', (req, res) => {
//   res.render('newsletter/archive');
// });

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
  res.render('500');
});

const startServer = () => {
  app.listen(app.get('port'), () => {
    console.log(`Express starting on  ${app.get('env')} http://localhost:${app.get('port')} press ctrl + C for Exit`);
  });
};

if (require.main === module) {
  startServer();
} else {
  module.exports = startServer;
}
