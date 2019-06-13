const express = require('express');

const app = express();

app.set('port', process.env.PORT || 3000);

app.use((req, res) => {
  res.type('text/plain');
  res.status(404);
  res.send('404 - not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500);
  res.send('500 - server error');
});

app.listen(app.get('port'), () => {
  console.log(`Express starting on http://localhost:${app.get('port')} press ctrl + C for Exit`);
});