'use strict';

module.exports = {
    validateEmail: (email) => {
        return {
            validator: email => {
                var match = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                return (match.test(email));
            },
            message: 'Email must in valid format.'
        };
    }
};
