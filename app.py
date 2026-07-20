# app.py
import os, json
from flask import Flask, request, jsonify, abort
import stripe
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

SERVICE_PRICE_MAP = {
  'personal-consulting': {'priceId': 'price_REPLACE_PERSONAL_30', 'label': 'Personal Consulting'},
  'business-consulting': {'priceId': 'price_REPLACE_BUSINESS_45', 'label': 'Business Consulting'},
  'remote-support': {'priceId': 'price_REPLACE_REMOTE_40', 'label': 'Remote Support'},
  'system-optimization': {'priceId': 'price_REPLACE_OPTIM_35', 'label': 'System Optimization'},
  'os-installation': {'priceId': 'price_REPLACE_OS_50', 'label': 'OS Installation'},
  'cybersecurity-assessment': {'priceId': 'price_REPLACE_CYBER_60', 'label': 'Cybersecurity Assessment'},
  'secure-configuration': {'priceId': 'price_REPLACE_SECURE_40', 'label': 'Secure Configuration'},
  'cloud-security-review': {'priceId': 'price_REPLACE_CLOUD_55', 'label': 'Cloud Security Review'},
  'network-design': {'priceId': 'price_REPLACE_NETWORK_75', 'label': 'Network Design & Setup'}
}

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.get_json()
    service = data.get('service')
    if not service or service not in SERVICE_PRICE_MAP:
        return jsonify({'error': 'Invalid or missing service slug'}), 400

    price_id = SERVICE_PRICE_MAP[service]['priceId']
    label = SERVICE_PRICE_MAP[service]['label']

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='payment',
            success_url=f"{os.environ.get('SITE_URL')}/success.html?action=form&service={service}",
            cancel_url=f"{os.environ.get('SITE_URL')}/services.html?canceled=true",
            metadata={'service': service, 'service_label': label}
        )
        return jsonify({'url': session.url})
    except Exception as e:
        print('Stripe error:', e)
        return jsonify({'error': 'Server error creating checkout session'}), 500

@app.route('/webhook', methods=['POST'])
def webhook_received():
    payload = request.data
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            event = json.loads(payload)
    except Exception as e:
        print('Webhook error:', e)
        return abort(400)

    if event.get('type') == 'checkout.session.completed':
        session = event['data']['object']
        print('Payment succeeded for service:', session.get('metadata', {}).get('service'), session.get('id'))
        # TODO: persist, email, ticketing, etc.

    return jsonify({'received': True})

if __name__ == '__main__':
    app.run(port=int(os.environ.get('PORT', 4242)))