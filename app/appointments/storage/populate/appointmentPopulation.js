'use strict';

module.exports = {
    find: [{
        path: 'schedule',
        model: 'Schedule'
    },
    {
        path: 'doctor',
        model: 'User'
    },
    {
        path: 'patient',
        model: 'User'
    }],
    list: [{
        path: 'schedule',
        model: 'Schedule'
    },
    {
        path: 'doctor',
        model: 'User'
    },
    {
        path: 'patient',
        model: 'User'
    }]
};
