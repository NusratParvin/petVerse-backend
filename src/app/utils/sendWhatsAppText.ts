import twilio from 'twilio';
import config from '../config';

const twilioClient = twilio(config.twilio_acc_sid, config.twilio_auth_token);

export const sendWhatsAppText = async (phone: string, message: string) => {
  const result = await twilioClient.messages.create({
    body: message,
    from: `whatsapp:${config.twilio_whatsapp_from}`,
    to: `whatsapp:${phone}`,
  });

  console.log(` WhatsApp sent to ${phone} — SID: ${result.sid}`);
  return result;
};
