const mongoose = require("mongoose");

const fileInfoSchema = new mongoose.Schema({
    dropboxPath: { type: String },
    fileUrl: { type: String },
    fileId: { type: String },
    uploadedBy: { type: String, default: "user", enum: ["user", "admin"] },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // one record per user
    },
    policeACRO: { type: String, default: "none" },
    blsAppointment: { type: String, default: "none" },
    passport: { type: [fileInfoSchema], default: [] },
    proofOfAccomodation: { type: [fileInfoSchema], default: [] },
    proofOfIdentity: { type: [fileInfoSchema], default: [] },
    passportSizePhoto: { type: [fileInfoSchema], default: [] },
    bankStatement: { type: [fileInfoSchema], default: [] },
    healthCertificate: { type: [fileInfoSchema], default: [] },
    criminalRecord: { type: [fileInfoSchema], default: [] },
    employmentLetter: { type: [fileInfoSchema], default: [] },
    travelItinerary: { type: [fileInfoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("UserDocument", documentSchema);
