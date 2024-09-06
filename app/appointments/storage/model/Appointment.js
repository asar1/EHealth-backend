'use strict';

const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
    {
        schedule: {
            type: mongoose.Types.ObjectId,
            ref: 'Schedule'
        },
        doctor: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        patient: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date
        },
        timeSlot: { type: String },
        timeLable: { type: String },
        attachments: { type: Array },
        notes: { type: String },
        status: { type: String, default: 'booked' }
    },
    { timestamps: true }
);

const appointmentModel = mongoose.model('Appointment', appointmentSchema);

module.exports = appointmentModel;
