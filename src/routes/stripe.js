const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../middlewares/authMiddleware');


router.post("/create-payment-intent", requireAuth, async (req, res) => {
  const quote = req.body;
  console.log("QUOTE", quote)
  const amount = quote.rates.ratePlans[0].ratePlan.money.hostPayout;
  const currency = quote.rates.ratePlans[0].ratePlan.money.currency;
  console.log("AMOUNT", amount)
  console.log("CURRENCY", currency)
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: currency,
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
module.exports = router;