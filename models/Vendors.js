const Mongoose = require('mongoose');

const VendorSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    phone_no: {
      type: String,
      require: true,
    },
    location: {
      type: String,
      require: true,
    },
    bank_details: {
      bank_name: {
        type: String,
        require: true,
      },
      acc_name: {
        type: String,
        require: true,
      },
      acc_no: {
        type: Number,
        require: true,
      },
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = Vendor = Mongoose.model('vendor', VendorSchema);
