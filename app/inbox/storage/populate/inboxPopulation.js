'use strict';

module.exports = {
    find: [
        {
            path: 'sender',
            model: 'User'
        },
        {
            path: 'receiver',
            model: 'User'
        }],
    list: [
        {
            path: 'sender',
            model: 'User'
        },
        {
            path: 'receiver',
            model: 'User'
        }]
};
