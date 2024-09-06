'use strict';

module.exports = {
    find: [{
        path: 'user',
        model: 'User'
    },
    {
        path: 'comments.user',
        model: 'User'
    }
    ],
    list: [{
        path: 'user',
        model: 'User'
    },
    {
        path: 'comments.user',
        model: 'User'
    }]
};
