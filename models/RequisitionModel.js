const Mongoose = require('mongoose');

const RequestSchema = new Mongoose.Schema({
  // user: {
  //   type: Mongoose.Schema.Types.ObjectId,
  //   ref: 'user',
  // },
  // dob: {
  //   type: Date,
  //   required: true,
  // },
  // status: {
  //   type: Boolean,
  //   default: true,
  // },
  // imgUrl: {
  //   type: String,
  // },
  // date: {
  //   type: Date,
  //   default: Date.now,
  // },
});

module.exports = Request = Mongoose.model('request', RequestSchema);
