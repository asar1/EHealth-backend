'use strict';

const mongoose = require('mongoose');

const unavailabilitySchema = mongoose.Schema({
    day: {
        type: String
    },
    availability: {
        type: String
    },
    schedule: {
        type: mongoose.Types.ObjectId,
        ref: 'Schedule'
    },
    doctor: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
});

const availabilityModel = mongoose.model('Unavailability', unavailabilitySchema);

module.exports = availabilityModel;
