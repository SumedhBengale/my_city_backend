const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../middlewares/authMiddleware');
const { instantReservation, fetchResidenceById, fetchQuoteById } = require("../middlewares/guestyMiddleware");
const Trip = require("../models/Trip");
const { addNotification } = require("../middlewares/notificationMiddleware");
const jwt_decode = require("jwt-decode");


router.post("/create-payment-intent", async (req, res) => {
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
    description: 'Guesty Reservation Payment',
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router.post("/payment/success", async (req, res) => {
  const { paymentIntent, paymentStatus, quoteId, userToken } = req.body;
  //If token is not null decode it and get the sub
  const userId = userToken ? jwt_decode(userToken).sub : null;


  if (paymentStatus === "succeeded") {
    //Get the payment method from stripe
    const intent = await stripe.paymentIntents.retrieve(paymentIntent);
    console.log(intent)
    const paymentMethod = await stripe.paymentMethods.retrieve(intent.payment_method);
    const quote = await fetchQuoteById(quoteId);
    const guest = {
      firstName: paymentMethod.billing_details.name.split(" ")[0],
      lastName: paymentMethod.billing_details.name.split(" ")[1],
      email: paymentMethod.billing_details.email,
    }
    await instantReservation(quote._id, quote.rates.ratePlans[0].ratePlan._id, paymentMethod.id, guest).then(async (response) => {
      console.log("RESPONSE", response)
      const reservationId = response._id;
      const residence = await fetchResidenceById(quote.unitTypeId);
      //If user is authenticated then add the reservation to the user's upcoming trips
      const upcomingTrip = new Trip({
        reservationId: reservationId,
        userId: userId ? userId : null,
        residence: residence,
        checkInDate: quote.checkInDateLocalized,
        checkOutDate: quote.checkOutDateLocalized,
        paymentIntent: intent.id,
      });
      await upcomingTrip.save();
      if (userId !== null) {
        //Also add a notification to the user
        addNotification(userId, `Your booking for ${residence.title} has been confirmed!`);
        console.log("SAVED TRIP AND ADDED NOTIFICATION")
      }


      return res.send({ message: "Payment successful", response: response, residence, paymentIntent, reservationId });
    }).catch((err) => {
      console.log("ERROR", err)
      return res.send({ message: "Error", response: err });
    })
  }
});

module.exports = router;
