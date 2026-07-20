// server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

// === SERVICE MAP ===
// Replace the priceId placeholders below with the real Price IDs from Stripe.
const SERVICE_PRICE_MAP = {
  'personal-consulting': { priceId: 'price_REPLACE_PERSONAL_30', label: 'Personal Consulting' },
  'business-consulting': { priceId: 'price_REPLACE_BUSINESS_45', label: 'Business Consulting' },
  'remote-support': { priceId: 'price_REPLACE_REMOTE_40', label: 'Remote Support' },
  'system-optimization': { priceId: 'price_REPLACE_OPTIM_35', label: 'System Optimization' },
  'os-installation': { priceId: 'price_REPLACE_OS_50', label: 'OS Installation' },
  'cybersecurity-assessment': { priceId: 'price_REPLACE_CYBER_60', label: 'Cybersecurity Assessment' },
  'secure-configuration': { priceId: 'price_REPLACE_SECURE_40', label: 'Secure Configuration' },
  'cloud-security-review': { priceId: 'price_REPLACE_CLOUD_55', label: 'Cloud Security Review' },
  'network-design': { priceId: 'price_REPLACE_NETWORK_75', label: 'Network Design & Setup' }
};

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { service } = req.body;
    if (!service || !SERVICE_PRICE_MAP[service]) {
      return res.status(400).json({ error: 'Invalid or missing service slug' });
    }

    const { priceId, label } = SERVICE_PRICE_MAP[service];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/success.html?action=form&service=${encodeURIComponent(service)}`,
      cancel_url: `${process.env.SITE_URL}/services.html?canceled=true`,
      metadata: {
        service: service,
        service_label: label
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Server error creating checkout session' });
  }
});

// Webhook endpoint to receive checkout.session.completed
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment succeeded for service:', session.metadata?.service, 'session:', session.id);
    // TODO: persist to DB, send confirmation email, create ticket, etc.
  }

  res.json({ received: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));