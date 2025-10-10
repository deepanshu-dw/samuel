const mongoose = require("mongoose");
// const bcrypt = require("bcrypt"); // official bcrypt

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    fullName: { type: String, default: null },
    email: { type: String, trim: true, unique: true },
    mobile: { type: String, trim: true },
    // password: { type: String, required: true },
    nationality: { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    // gender: { type: String, default: null },
    zohoUserId: { type: String, required: true, unique: true },
    profileImage: { type: String, default: null },
    visaRefused: { type: Boolean, default: false },
    passportNo: { type: String, default: null },
    dropBoxFolderId: { type: String, default: null },
    status: { type: String, default: "Active" },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (err) {
//         next(err);
//     }
// });

// Compare entered password with hashed password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("User", userSchema);
