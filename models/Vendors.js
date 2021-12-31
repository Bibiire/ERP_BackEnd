const Mongoose = require('mongoose');

const VendorSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    location: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = Vendor = Mongoose.model('vendor', VendorSchema);
