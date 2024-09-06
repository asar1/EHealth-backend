'use strict';

const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    rating: {
        type: Number
    },
    feedback: {
        type: String
    },
    appointment: {
        type: mongoose.Types.ObjectId,
        ref: 'Appointment'
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    doctor: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const feedbackModel = mongoose.model('Feedback', feedbackSchema);

module.exports = feedbackModel;
