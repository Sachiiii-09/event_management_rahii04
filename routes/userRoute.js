const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Organizer = require("../models/organizerModel");
const Event = require("../models/eventModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const moment = require("moment");

// to register auth
router.post("/register", async (req, res) => {
  try {
    //console.log(`${req.body.email}`.toLowerCase())

    const userExist = await User.findOne({
      email: `${req.body.email}`.toLowerCase(),
    });
    if (userExist) {
      return res
        .status(200)
        .send({ message: "User is Already Exist", success: false });
    }

    const password = req.body.password;
    //encryption password by using bcrypt method
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    req.body.email = `${req.body.email}`.toLowerCase()

    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "User Created Successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error in creating User", success: false, error });
  }
});

//  to login route
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: `${req.body.email}`.toLowerCase(),
    });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User doesn't exist", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "Login Successfull", success: true, data: token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error in Logging in", success: false, error });
  }
});

//verifying user
router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "User doesn't exist", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user Info", success: false, error });
  }
});

//user applying for organizer account
router.post("/apply-organizer-account", authMiddleware, async (req, res) => {
  try {
    const neworganizer = new Organizer({ ...req.body, status: "pending" });
    await neworganizer.save();

    const adminUser = await User.findOne({ isAdmin: true });

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-organizer-request",
      message: `${neworganizer.firstName} ${neworganizer.lastName} has Applied for Organizer account`,
      date: {
        organizerId: neworganizer._id,
        name: neworganizer.firstName + " " + neworganizer.lastName,
      },
      onClickPath: "/admin/organizerslist",
    });
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
    res.status(200).send({
      success: true,
      message: "Organizer account applied Succeessfully..!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error applying in organizer account",
      success: false,
      error,
    });
  }
});

//to posting event
router.post("/post-event", authMiddleware, async (req, res) => {
  try {
    const newevent = new Event({ ...req.body, status: "pending" });
    await newevent.save();

    const organizerUser = await User.findOne({ isOrganizer: true });

    const unseenNotifications = organizerUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-event-post-request",
      message: `${newevent.firstName} ${newevent.lastName} wants to promote the ${newevent.eventName}, Kindly verify and take action`,
      date: {
        eventId: newevent._id,
        name: newevent.firstName + " " + newevent.lastName,
      },
      onClickPath: "/organizer/eventlist",
    });
    await User.findByIdAndUpdate(organizerUser._id, { unseenNotifications });
    res.status(200).send({
      success: true,
      message: "Event Posted Succeessfully..! wait for verification",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error Posting in Event account",
      success: false,
      error,
    });
  }
});

//creating end point for mark all notification as seen
router.post(
  "/mark-all-notifications-as-seen",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      const unseenNotifications = user.unseenNotifications;
      const seenNotifications = user.seenNotifications;
      //pushing the notification from unseen tab to seen / there may present already exisiting notification so using push
      seenNotifications.push(...unseenNotifications);

      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      updatedUser.password = undefined;
      res.status(200).send({
        success: true,
        message: "All Notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: "Error while marking as read in notfication",
        success: false,
        error,
      });
    }
  }
);

//delete all notifications
router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    //assigining empty array in Delete all notification
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Removed All Notifications",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Deleting notifications",
      success: false,
      error,
    });
  }
});

//get all approved organizers
router.get("/get-all-approved-organizers", authMiddleware, async (req, res) => {
  try {
    const organizers = await Organizer.find({ status: "approved" });
    res.status(200).send({
      message: "Organizers fetched Successfully..",
      success: true,
      data: organizers,
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

//get all approved events
router.get("/get-all-approved-events", authMiddleware, async (req, res) => {
  try {
    
    const events = await Event.find({ status: "approved" });
    res.status(200).send({
      message: "Events fetched Successfully..",
      success: true,
      data: events,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in fetching Events List",
      success: false,
      error,
    });
  }
});

//booking the venue
router.post("/book-venue", authMiddleware, async (req, res) => {
  try {
    req.body.status = "pending";
    if ((req.body.userInfo.isUser == false)&&(req.body.userInfo.isGuest == false)) {
      res.status(200).send({
        message: "You are blocked by Admin so You Can't Book",
        success: false,
      });
    }
    
   else if ((req.body.userInfo.isGuest == true)&&(req.body.userInfo.isUser ==false)) {
      res.status(200).send({
        message: "You can't Book using Guest Account Kindly Login by Your Account",
        success: false,
      });
    } 
    else {
      req.body.date = moment(req.body.date, "YYYY-MM-DD").toISOString();
      req.body.time = moment(req.body.time, "HH:mm").toISOString();

      const newBooking = new Booking(req.body);
      await newBooking.save();
      //pushing notification to doctor based on his userid
      const user = await User.findOne({ _id: req.body.organizerInfo.userId });
      user.unseenNotifications.push({
        type: "new-appointment-request",
        message: `A new booking request has been made by ${req.body.userInfo.name}`,
        onClickPath: "/organizer/venue-bookings",
      });
      await user.save();
      res.status(200).send({
        message: "Venue booked successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking venue",
      success: false,
      error,
    });
  }
});

router.post("/check-booking-avilability", authMiddleware, async (req, res) => {
  try {
    const date = moment(req.body.date, "YYYY-MM-DD").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(12, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(12, "hours").toISOString();
    const organizerId = req.body.organizerId;
    const bookings = await Booking.find({
      organizerId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (bookings.length > 0) {
      return res.status(200).send({
        message: " Booking not Available",
        success: false,
      });
    } else {
      res.status(200).send({
        message: " Booking Available",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error booking appointment",
      success: false,
      error,
    });
  }
});

router.get("/get-bookings-by-user-id", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.body.userId });
    res.status(200).send({
      message: "Bookings fetched successfully",
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error fetching appointments",
      success: false,
      error,
    });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const newPassword = req.body.values.newPassword;
  const oldPassword = req.body.values.oldpassword;
  
  //changeing password
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res
        .status(200)
        .send({ message: "Something went wrong", success: false });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(500)
        .send({ message: "Your Old Password is Incorrect", success: false });
    } else {
      //encrypting new password
      const password = req.body.values.newPassword;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      req.body.password = hashedPassword;
      //reassigning password
      user.password = req.body.password;

      //saving new password in DB
      await user.save();
      res
        .status(200)
        .send({ message: "Password Changed Successfully..!", success: true });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus({ message: "Error in Password Change", success: false });
  }
});

router.post("/user-self-profile-update", authMiddleware, async (req, res) => {

  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200), send({ message: " User Doesn't Exist" });
    }
    const isMatch = await bcrypt.compare(
      req.body.values.password,
      user.password
    );
    if (!isMatch) {
      return res.status(500).send({ message: "You Entered wrong password" });
    } else {
      console.log(user.password);
      console.log(user.password);
      user.name = req.body.values.name;
      user.email = `${req.body.values.email}`.toLowerCase();
      await user.save();
      res.status(200).send({ message: "Profile updated successfully " });
      
    }
  } catch {
    console.log(error);
    res.status(500).send({ message: "Error in Profile Update", success: false });
  }
});



module.exports = router;
