'use strict';

const mongoose = require('mongoose');

const specialitySchema = mongoose.Schema({
    speciality: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Speciality = mongoose.model('Speciality', specialitySchema);

module.exports = Speciality;
