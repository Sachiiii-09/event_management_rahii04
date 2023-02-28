const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userId:{
        type:String,
        required: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    organizerNumber: {
      type: Number,
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
    sociallink: {
      type: String,
      required: true,
    },
    venueName: {
      type: String,
      required: true,
    },
    VenueOwnerNumber: {
      type: String,
      required: true,
    },
    eventLink: {
        type: String,
        required: true,
      
    },
    timings: {
      type: Array,
      required: true,
    },
    eventDate: {
        type: Array,
        required: true,
      },
    status:{
        type:String,
        default:"pending",
    }
  },
  {
    timestamps: true,
  }
);

const eventModel = mongoose.model("event", eventSchema);
module.exports = eventModel;