import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); 

const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'aed',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(200).json({
      success: true,
      message: "Payment intent created successfully",
      clientSecret: paymentIntent.client_secret,
      data: paymentIntent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating payment intent",
      error: error.message,
    });
  }
}

export { createPayment };