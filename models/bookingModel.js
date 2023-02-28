const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    organizerId: {
      type: String,
      required: true,
    },
    organizerInfo: {
      type: Object,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const bookingModel = mongoose.model("bookings", bookingSchema);
module.exports = bookingModel;
