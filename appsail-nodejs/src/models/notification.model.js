const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    // sender_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "users",
    //     required: true,
    // },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    // type: {
    //     type: String,
    //     required: true,
    //     enum: [
    //         "Document_Uploaded",
    //         "Verification_Pending",
    //         "Verification_Approved",
    //         "Verification_Rejected",
    //         "Admin_Update",
    //         "Job_Invite",
    //         "Employee_Profile_Hold",
    //         "New_Match",
    //         "Marked_Interested",
    //         "Marked_Hired",
    //         "Match_Rejected",
    //         "Invoice_Generated",
    //     ],
    // },
    // Optional redirect page (frontend route)
    redirect_url: {
        type: String,
        required: false,
        default: null,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Deleted"],
        default: "Active",
    },
    // meta: {
    //     // Extra info (e.g., document type, visa id, etc.)
    //     type: mongoose.Schema.Types.Mixed,
    //     default: {},
    // },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
