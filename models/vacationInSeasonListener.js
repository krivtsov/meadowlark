const mongoose = require('mongoose');

const vactionInSeasonListenerShema = mongoose.Schema({
  email: String,
  skus: [String],
});

const VacationInSeasonListener = mongoose.model('VacationInSeasonListener', vactionInSeasonListenerShema);

module.exports = VacationInSeasonListener;
