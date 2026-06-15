const axios = require('axios');

async function sendPaymentConfirmation(fine) {
  const message = `Fine ${fine.reference_number} has been paid. Driver ${fine.driver_name} (${fine.vehicle_number}) may retrieve their license.`;

  await axios.post(
    process.env.SMS_GATEWAY_URL,
    { to: fine.officer_phone, message },
    { headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}` } }
  );
}

module.exports = { sendPaymentConfirmation };
