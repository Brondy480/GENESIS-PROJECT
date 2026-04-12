import Stripe from "stripe";
import crypto from "crypto";
import Transaction from "../models/Transactions.model.js";

// ⚡ Stripe instance (only used in production)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key");

/**
 * Main payment handler
 * @param {Object} deal - The deal object
 * @param {Object} user - The investor/user object
 * @param {Object} [session] - Optional mongoose session for transactions
 */
export const processPayment = async (deal, user, session = null) => {
  const mode = process.env.PAYMENT_MODE || "mvp";

  if (mode === "mvp") {
    return simulatePayment(deal, session);
  }

  if (mode === "production") {
    return processStripePayment(deal, user);
  }

  throw new Error("Invalid payment mode");
};

// ==========================
// MVP SIMULATED PAYMENT
// ==========================
const simulatePayment = async (deal, session = null) => {
  console.log("DEAL DATA:", deal);
  console.log("Investor:", deal.investor);
  console.log("Project:", deal.project);
  console.log("Amount:", deal.amount);

  // 1️⃣ generate fake payment reference
  const reference = "MVP-" + crypto.randomBytes(6).toString("hex");

  // 2️⃣ simulate gateway delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 3️⃣ optionally log a transaction inside session
  if (session) {
    await Transaction.create(
      [
        {
          investor: deal.investor,
          project: deal.project._id,
          amount: deal.amount,
          transactionReference: reference,
          status: "success",
        },
      ],
      { session }
    );
  }

  return {
    success: true,
    reference,
  };
};

// ==========================
// STRIPE PRODUCTION PAYMENT
// ==========================
const processStripePayment = async (deal, user) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: deal.amount * 100, // cents
    currency: "xaf",
    metadata: {
      dealId: deal._id.toString(),
      investorId: user._id.toString(),
    },
  });

  return {
    success: true,
    reference: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
};