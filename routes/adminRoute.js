const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Organizer = require("../models/organizerModel");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/get-all-organizers", authMiddleware, async (req, res) => {
  try {
    const organizers = await Organizer.find({});
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


router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      message: "User fetched Successfully",
      success: true,
      data: users,
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



router.post("/change-organizer-account-status", authMiddleware, async (req, res) => {
  try {
    const {organizerId , status } = req.body;
    const organizer = await Organizer.findByIdAndUpdate(organizerId, {
      status
    });
  //sending notification to requested user 

    const user = await User.findOne({_id: organizer.userId});

    const unseenNotifications = user.unseenNotifications
    unseenNotifications.push({
      type: "new-organizer-request-changed",
      message : `Your Organizer Account has been ${status}`,
      onClickPath : "/notifications",
    })
    
    user.isOrganizer = status=== "approved" ? true : false; 
    //{user.isOrganizer = status=== "pending" ? false : true; }
   // {user.isOrganizer = status=== "blocked" ? false : true; }
    
    
    await user.save();
    //User.findByIdAndUpdate(user._id, {unseenNotifications});

    res.status(200).send({
      message:" Organizer Account Status Updated Successfully",
      success: true,
      data: organizer,
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

router.post("/change-user-account-status", authMiddleware, async (req, res) => {
  try {
    const {usersId , isUser } = req.body;
    const users = await User.findByIdAndUpdate(usersId, {
      isUser
    });
 
    const user = await User.findOne({_id : usersId})
    
    const unseenNotifications = user.unseenNotifications
    unseenNotifications.push(
      {type: "Your account Blocked",
       message: `Your Account has been ${user.isUser ===true ? "Blocked" : "Unblocked"}`,
         onClickPath: '/notifications'
        }
    )
    await user.save();
    //blocking user by admin
    if(users.isUser)
    {
      users.isUser = false;
    }
    else{
      users.isUser = true;
    }
   
    
    
    await users.save();
  

    res.status(200).send({
      message:" User Account Blocked Successfully",
      success: true,
      data: users,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      
      message: "Error in Blocking Account",
      success: false,
      error,
    });
  }
});

module.exports = router;
