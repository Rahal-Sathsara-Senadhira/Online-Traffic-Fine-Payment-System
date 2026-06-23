const axios = require('axios');

async function sendPaymentConfirmation(fine) {
  const message = `Fine ${fine.reference_number} has been paid. Driver ${fine.driver_name} (${fine.vehicle_number}) may retrieve their license.`;
  const officerPhone = fine.officer?.phone;

  if (!officerPhone) {
    console.warn('SMS skipped: no officer phone number available for fine', fine.reference_number);
    return;
  }

  await axios.post(
    process.env.SMS_GATEWAY_URL,
    { to: officerPhone, message },
    { headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}` } }
  );
}

module.exports = { sendPaymentConfirmation };
