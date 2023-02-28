const express = require('express');
const router = express.Router();
const Organizer = require('../models/organizerModel');
const authMiddleware = require('../middlewares/authMiddleware');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel')

router.post("/get-organizer-info-by-user-id", authMiddleware, async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ userId: req.body.userId });

    res.status(200).send({
      success: true,
      message: " Organizer info fetched Successfully",
      data: organizer,
    });

  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting in Organizer Info", success: false, error });
  }
});

//retriving the data in booking part
router.post("/get-organizer-info-by-organizer-id", authMiddleware, async (req, res) => {
  try {
    const organizer = await Organizer.findOne({ _id: req.body.organizerId });

    res.status(200).send({
      success: true,
      message: " Organizer info fetched Successfully",
      data: organizer,
    });

  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting in Organizer Info", success: false, error });
  }
});

router.post("/update-organizer-profile", authMiddleware, async (req, res) => {
  try {
    //req.body.status = "approved";
    const organizer = await Organizer.findOneAndReplace(
      {userId: req.body.userId},
      req.body,
    );

    res.status(200).send({
      success: true,
      message: "Organizer profile Updated Successfully",
      data: organizer,
    });

  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating in Organizer Info", success: false, error });
  }
});

router.get("/get-all-requested-events", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).send({
      message: "Event fetched Successfully",
      success: true,
      data: events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: " Error in fetching data",
      success: false,
      error,
    });
  }
});

router.post("/change-event-status", authMiddleware, async (req, res) => {
  try {
    const {eventId , status } = req.body;
    const event = await Event.findByIdAndUpdate(eventId, {
      status
    });
  //sending notification to requested user 

    const user = await User.findOne({ _id: event.userId});
    console.log(user._id)
    const unseenNotifications = user.unseenNotifications
    unseenNotifications.push({
      type: "new-event-status-changed",
      message : `Your Event has been ${status}`,
      onClickPath : "/eventlist",
    })
    
    event.status = status=== "approved" ? true : false;
    await user.save();
    //User.findByIdAndUpdate(user._id, {unseenNotifications});

    res.status(200).send({
      message:"Event Updated Successfully",
      success: true,
      data: event,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in fetching Organizers List",
      success: false,
      error,
    });
  }
});



router.get(
  "/get-bookings-by-organizer-id",
  authMiddleware,
  async (req, res) => {
    try {
      const organizer = await Organizer.findOne({ userId: req.body.userId });
      const bookings = await Booking.find({ organizerId: organizer._id });
      res.status(200).send({
        message: "Booking fetched successfully",
        success: true,
        data: bookings,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error fetching Bookings",
        success: false,
        error,
      });
    }
  }
);


router.post("/change-venue-booking-status", authMiddleware, async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(bookingId, {
      status,
    });

    const user = await User.findOne({ _id: booking.userId });
    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "Booking-status-changed",
      message: `Your Booking request status has been ${status}`,
      onClickPath: "/bookings",
    });

    await user.save();

    res.status(200).send({
      message: "Booking status updated successfully",
      success: true
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error changing Booking status",
      success: false,
      error,
    });
  }
});

module.exports = router;