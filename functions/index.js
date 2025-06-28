
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.yourCallableFunction = functions.https.onCall((data, context) => {
  if (!context.app) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called from an App Check verified app.'
    );
  }
  return { message: "Cosmic Casino 🔥 is LIVE!" };
}); 
