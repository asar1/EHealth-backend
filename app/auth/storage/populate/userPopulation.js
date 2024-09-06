// 'use strict';

// module.exports = {
//     find: ['doctors'],
//     list: ['doctors']
// };

'use strict';

module.exports = {
    find: [{
        path: 'doctors',
        model: 'User'
    },
    {
        path: 'specialities',
        model: 'Speciality'
    }
    ],
    list: [{
        path: 'doctors',
        model: 'User'
    },
    {
        path: 'specialities',
        model: 'Speciality'
    }]
};
