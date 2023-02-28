const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema(
  {
    userId:{
        type:String,
        required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    venueName: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    feePerBooking: {
      type: Number,
      required: true,
    },
    timings: {
      type: Array,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);

const organizerModel = mongoose.model("organizer", organizerSchema);
module.exports = organizerModel;
