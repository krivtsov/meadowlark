const mongoose = require('mongoose');

const vacationShema = mongoose.Schema({
  name: String,
  slug: String,
  category: String,
  sku: String,
  description: String,
  priceInCents: Number,
  tags: [String],
  inSeason: Boolean,
  avialible: Boolean,
  requireWaiver: Boolean,
  maximumGuests: Number,
  notes: String,
  packagesSold: Number,
});

vacationShema.methods.getDisplayPrice = () => `$ ${(this.priceInCents / 100).toFixed(2)}`;

const Vacation = mongoose.model('Vacation', vacationShema);

module.exports = Vacation;
