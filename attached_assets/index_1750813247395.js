const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.mintNFT = functions.https.onRequest(async (req, res) => {
  const customerId = req.body.customerId;
  const nftDetails = {
    tokenId: "333-VIP-CHAOSKEY",
    mintTxHash: "0xChaosMintHash"
  };
  return res.json({ status: "success", nftDetails });
});

exports.generateReferral = functions.https.onRequest(async (req, res) => {
  const { customerId, customerName } = req.body;
  const referralCode = `VIP-${customerId}-${Date.now()}`;
  await admin.firestore().collection('referrals').doc(customerId).set({
    customerName,
    referralCode,
    referrals: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  res.json({ referralCode });
});
