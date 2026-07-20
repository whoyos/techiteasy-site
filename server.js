// server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4242;

// Use JSON parser for webhook raw body later
app.use(cors());
app.use(express.json());

// Map service slugs to Stripe Price IDs (create these in Stripe Dashboard)
const SERVICE_PRICE_MAP = {
  // Example: 'service-slug': { priceId: 'price_XXXX', label: 'Display Label' }
  'personal-consulting': { priceId: 'price_PERSONAL_30', label: 'Personal Consulting' },
  'business-consulting': { priceId: 'price_BUSINESS_45', label: 'Business Consulting' },
  'remote-support': { priceId: 'price_REMOTE_40', label: 'Remote Support' },
  'system-optimization': { priceId: 'price_OPTIM_35', label: 'System Optimization' },
  'os-installation': { priceId: 'price_OS_50', label: 'OS Installation' },
  'cybersecurity-assessment': { priceId: 'price_CYBER_60', label: 'Cybersecurity Assessment' },
  'secure-configuration': { priceId: 'price_SECURE_40', label: 'Secure Configuration' },
  'cloud-security-review': { priceId: 'price_CLOUD_55', label: 'Cloud Security Review' },
  'network-design': { priceId: 'price_NETWORK_75', label: 'Network Design & Setup' }
};

// Create a Checkout Session for a paid service
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { service } = req.body;
    if (!service || !SERVICE_PRICE_MAP[service]) {
      return res.status(400).json({ error: 'Invalid or missing service slug' });
    }

    const priceId = SERVICE_PRICE_MAP[service].priceId;
    const displayLabel = SERVICE_PRICE_MAP[service].label;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      // After successful payment, Stripe will redirect to success.html with action=form and service slug
      success_url: `${process.env.SITE_URL}/success.html?action=form&service=${encodeURIComponent(service)}`,
      cancel_url: `${process.env.SITE_URL}/services.html?canceled=true`,
      metadata: {
        service: service,
        service_label: displayLabel
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating checkout session' });
  }
});

// Stripe webhook endpoint to receive checkout.session.completed events (optional but recommended)
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // If no webhook secret provided (not recommended), parse body
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // You can use session.metadata.service to know which service was purchased
    console.log('Payment succeeded for service:', session.metadata?.service, session.id);
    // TODO: Save to DB, send email, create ticket, etc.
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});