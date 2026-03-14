import twilio from 'twilio';
import config from '../config';
import { sendEmail } from './sendEmail';
import cron from 'node-cron';
import { PetServices } from '../modules/pets/pets.service';

const twilioClient = twilio(config.twilio_acc_sid, config.twilio_auth_token);

export const sendWhatsApp = async (
  phone: string,
  petName: string,
  recordTitle: string,
  daysLeft: number,
  dueDate: Date,
  vetName?: string,
) => {
  await twilioClient.messages.create({
    contentSid: 'HX674e9f417150ebd3c1d0b93b913870a6',
    contentVariables: JSON.stringify({
      petName,
      recordTitle,
      daysLeft: String(daysLeft),
      dueDate: dueDate.toDateString(),
      vetName: vetName || 'N/A',
    }),
    from: `whatsapp:${config.twilio_whatsapp_from}`,
    to: `whatsapp:${phone}`,
  });
};

export const sendReminderEmail = async (
  email: string,
  ownerName: string,
  petName: string,
  recordTitle: string,
  daysLeft: number,
  dueDate: Date,
  vetName?: string,
) => {
  const vetText = vetName ? `<p>📍 Vet: <strong>${vetName}</strong></p>` : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #0A7C6E;">🐾 PetVerse Health Reminder</h2>
      <p>Hi <strong>${ownerName}</strong>,</p>
      <p>Your pet <strong>${petName}</strong> has an upcoming health record:</p>
      <div style="background:#f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p>📋 <strong>${recordTitle}</strong></p>
        <p>📅 Due: <strong>${dueDate.toDateString()}</strong> (${daysLeft} day(s) away)</p>
        ${vetText}
      </div>
      <p>Stay on top of your pet's health!</p>
      <p style="color: #888; font-size: 12px;">— PetVerse UAE Team</p>
    </div>
  `;

  await sendEmail(
    email,
    `🐾 Reminder: ${petName}'s ${recordTitle} due in ${daysLeft} day(s)`,
    html,
  );
};

export const startReminderCron = () => {
  cron.schedule(
    '0 5 * * *',
    async () => {
      console.log('Running daily reminder check...');

      try {
        const reminders = await PetServices.getAllUpcomingRemindersFromDB();
        console.log(`${reminders.length} to send `);

        for (const reminder of reminders) {
          try {
            await sendReminderEmail(
              reminder.ownerEmail,
              reminder.ownerName,
              reminder.petName,
              reminder.recordTitle,
              reminder.daysLeft,
              reminder.nextDueDate,
              reminder.vetName,
            );
            console.log(`Email → ${reminder.ownerEmail}`);
          } catch (err) {
            console.error(`Email failed:`, err);
          }
          if (reminder.whatsappNumber) {
            try {
              await sendWhatsApp(
                reminder.whatsappNumber,
                reminder.petName,
                reminder.recordTitle,
                reminder.daysLeft,
                reminder.nextDueDate,
                reminder.vetName,
              );
              console.log(`WhatsApp → ${reminder.whatsappNumber}`);
            } catch (err) {
              console.error(`WhatsApp failed:`, err);
            }
          }
        }

        console.log('Reminder check complete');
      } catch (error) {
        console.error('Cron error:', error);
      }
    },
    {
      timezone: 'Asia/Dubai',
    },
  );

  console.log('Cron scheduled — daily 9am UAE');
};
