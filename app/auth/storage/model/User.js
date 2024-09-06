'use strict';

const mongoose = require('mongoose');
const userFieldValidation = require('../validation/UserFieldValidation');

const userSchema = mongoose.Schema(
    {
        facebookId: {
            type: String
        },
        googleId: {
            type: String
        },
        fireBaseId: {
            type: String
        },
        firstName: {
            type: String,
            sparse: true
        },
        lastName: {
            type: String,
            sparse: true
        },
        name: {
            type: String
        },
        email: {
            type: String,
            sparse: true,
            unique: true,
            lowercase: true,
            validate: userFieldValidation.validateEmail(this)
        },
        dob: {
            type: Date
        },
        gender: {
            type: String
        },
        phoneNo: {
            type: String,
            unique: true,
            sparse: true
        },
        userName: {
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        suspend: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: 'user'
        },
        doctors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        allergies: [{
            allergyType: { type: String },
            reaction: { type: String },
            serverity: { type: String },
            Notes: { type: String }
        }],
        specialities: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Speciality'
            }
        ],
        resetPaswordToken: {
            type: String,
            required: false
        },
        resetPaswordExpires: {
            type: String,
            required: false
        },
        isProfileCompleted: {
            type: Boolean,
            default: false
        },
        fee: {
            type: Number,
            default: 0
        },
        rating: {
            type: Number,
            default: 0
        },
        feedbacks: {
            type: Number,
            default: 0
        },
        isSponsored: {
            type: Boolean,
            default: false
        },
        sponsorshipExpiresIn: {
            type: Date
        },
        profileImg: {
            type: String,
            default: ''
        },
        openingHours: {
            type: String,
            default: '12 a.m - 8 a.m'
        },
        bio: {
            type: String
        },
        experience: {
            type: String
        },
        pmdcInfo: {
            status: { type: String, default: 'IN-ACTIVE' },
            number: { type: String },
            validated: { type: String }
        }
    },
    { timestamps: true }
);

userSchema.index({ name: 'text' });
userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    return obj;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
