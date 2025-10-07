const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // official bcrypt

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true },
    nationality: { type: String, required: true },
    dateOfBirth: { type: String },
    gender: { type: String },
    zohoUserId: { type: String, required: true, unique: true },
    visaRefused: { type: Boolean },
    passportNo: { type: String },
    status: { type: String, default: "Active" }
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
