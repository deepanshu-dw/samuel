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
    police_ACRO: { type: String, default: "pending" },
    bls_appointment: { type: String, default: "pending" },
    passport: { type: [fileInfoSchema], default: [] },
    proof_of_accomodation: { type: [fileInfoSchema], default: [] },
    proof_of_identity: { type: [fileInfoSchema], default: [] },
    passport_size_photo: { type: [fileInfoSchema], default: [] },
    bank_statement: { type: [fileInfoSchema], default: [] },
    health_insurance: { type: [fileInfoSchema], default: [] },
    criminal_record: { type: [fileInfoSchema], default: [] },
    employment_letter: { type: [fileInfoSchema], default: [] },
    travel_itinerary: { type: [fileInfoSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("UserDocument", documentSchema);
