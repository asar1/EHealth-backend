'use strict';

const mongoose = require('mongoose');

const medicalRecordSchema = mongoose.Schema({
    testName: {
        type: String
    },
    date: {
        type: Date
    },
    from: {
        type: String
    },
    notes: {
        type: String
    },
    attachment: [
        {
            type: String
        }
    ],
    appointment: {
        type: mongoose.Types.ObjectId,
        ref: 'Appointment'
    },
    patient: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    doctor: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const medicalModel = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = medicalModel;
