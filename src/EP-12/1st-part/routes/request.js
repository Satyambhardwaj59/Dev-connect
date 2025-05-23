const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const User = require('../models/user');
const ConnectionRequest = require('../models/connectionRequest');



requestRouter.post("/request/send/:status/:toUserId",userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const { status, toUserId }= req.params;

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            return res.status(400).send("Invalid status");
        };

        const userExists = await User.findById(toUserId);
        if(!userExists) {
            return res.status(404).json({message: "User not found"});
        };

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [{ fromUserId, toUserId }, 
                { fromUserId: toUserId, toUserId: fromUserId}
            ]
        });
        if(existingConnectionRequest) {
            return res.status(400).json({ message: "Connection request already exists" });
        }

        const connectionRequest = new ConnectionRequest( {
            fromUserId,
            toUserId,
            status
        });
        await connectionRequest.save();
        
        res.status(200).json({ message: `Connection request sent with status: ${status}` });

    } catch (error) {
        res.status(500).send("ERROR : " + error.message);
        
    }
})

module.exports = requestRouter;