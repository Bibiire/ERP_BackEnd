const Mongoose = require('mongoose');

const DepartmentSchema = new Mongoose.Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = Department = Mongoose.model('department', DepartmentSchema);
