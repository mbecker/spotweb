'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            8080,

  firebase: {
        apiKey: "AIzaSyB6NW9Z-UEEEgyv262uXJLzSHCALFkVOPI",
      authDomain: "safaridigitalapp.firebaseapp.com",
      databaseURL: "https://safaridigitalapp.firebaseio.com",
      storageBucket: "safaridigitalapp.appspot.com",
      messagingSenderId: "78200485035"
    },

    gcloud: {
      projectId: "safaridigitalapp"
    }

};