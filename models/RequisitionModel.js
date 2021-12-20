const Mongoose = require('mongoose');

const RequestSchema = new Mongoose.Schema({
  user: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  itemName: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  ITRelated: {
    type: Boolean,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
  departmentalId: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  comment: {
    type: String,
  },
  inputter: {
    status: {
      type: Boolean,
      default: false
    },
  },
  verify: {
    status: {
      type: Boolean,
    },
    verifier: {
      type: String,
    },
  },
  acc_check: {
    status: {
      type: Boolean,
    },
    acc_checker: {
      type: String,
    },
  },
  authorize: {
    status: {
      type: Boolean,
    },
    authorizer: {
      type: String,
    },
  },
  approve: {
    status: {
      type: Boolean,
    },
    approver: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
},{ timestamps: true });

module.exports = Request = Mongoose.model('request', RequestSchema);
