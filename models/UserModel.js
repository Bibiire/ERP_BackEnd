const Mongoose = require('mongoose');

const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  position: {
    type: String
  },
  departmentId: {
    type: Mongoose.Schema.Types.ObjectId,
    ref: 'department',
  },
  roles: {
    type: [String],
    require: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = User = Mongoose.model('user', UserSchema);
