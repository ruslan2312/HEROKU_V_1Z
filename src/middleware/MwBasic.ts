const basicAuth = require('express-basic-auth');

export const mwBasicAuth = basicAuth({
    users: {
        admin: 'qwerty',
    },
});