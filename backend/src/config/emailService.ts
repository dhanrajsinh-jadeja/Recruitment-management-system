import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Check for Resend configuration in environment
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const fromName = fromEmail.includes('onboarding@resend.dev') ? 'Resend Sandbox' : 'RecruitHub';
const formattedFrom = `${fromName} <${fromEmail}>`;

let resendInstance: Resend | null = null;

if (resendApiKey) {
  resendInstance = new Resend(resendApiKey);
  console.log('Resend email client configured.');
} else {
  console.log('RESEND_API_KEY missing. Falling back to local logging (backend/email_logs.txt).');
}

// Helper to log emails locally
const logEmailLocally = (to: string, subject: string, text: string) => {
  const logFilePath = path.join(__dirname, '..', '..', 'email_logs.txt');
  const timestamp = new Date().toISOString();
  const logContent = `
=========================================
TIMESTAMP: ${timestamp}
TO: ${to}
FROM: ${fromEmail}
SUBJECT: ${subject}
-----------------------------------------
${text}
=========================================
\n`;

  fs.appendFileSync(logFilePath, logContent, 'utf-8');
  console.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject} (Logged to backend/email_logs.txt)`);
};

export const sendUpcomingInterviewEmail = async (
  candidateEmail: string,
  candidateName: string,
  applicationId: string,
  roundName: string,
  dateTime: Date,
  interviewLink: string
): Promise<boolean> => {
  const formattedDate = dateTime.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Upcoming Interview Reminder - ${roundName}`;
  const bodyText = `Hi ${candidateName},

This is a reminder that you have an upcoming interview round for the position you applied for.

Round: ${roundName}
Scheduled Time: ${formattedDate}
Interview Link/Location: ${interviewLink || 'Will be shared soon'}

CRITICAL REQUIREMENT:
Your unique Application ID is: ${applicationId}
You MUST use this ID ("${applicationId}") as your "Application Number" in the interview test. Please do not share this ID with anyone else.

Best of luck!
The Recruiting Team`;

  try {
    if (resendInstance) {
      await resendInstance.emails.send({
        from: formattedFrom,
        to: candidateEmail,
        subject: subject,
        text: bodyText,
      });
      console.log(`[RESEND EMAIL SENT] To: ${candidateEmail} | Subject: ${subject}`);
      return true;
    } else {
      logEmailLocally(candidateEmail, subject, bodyText);
      return true;
    }
  } catch (error: any) {
    console.error(`Failed to send Resend email to ${candidateEmail}: ${error.message}`);
    console.log('Falling back to local logging...');
    logEmailLocally(candidateEmail, subject, bodyText);
    return true;
  }
};

export const sendRoundPassedEmail = async (
  candidateEmail: string,
  candidateName: string,
  roundName: string,
  applicationId: string,
  jobTitle: string,
  companyName: string
): Promise<boolean> => {
  const subject = `Congratulations! You Have Qualified for the Next Round ${roundName}`;
  const bodyText = `Hi ${candidateName},

We are pleased to inform you that you have successfully cleared Round ${roundName} of the recruitment process for the position of ${jobTitle}.

Your unique Application ID is: ${applicationId}
Please keep this ID handy for reference.

You have been shortlisted for the next stage of the selection process.

Further details regarding the upcoming stage will be shared with you separately.

Best regards,
The Recruiting Team
${companyName}
`;

  try {
    if (resendInstance) {
      await resendInstance.emails.send({
        from: formattedFrom,
        to: candidateEmail,
        subject: subject,
        text: bodyText,
      });
      console.log(`[RESEND EMAIL SENT] To: ${candidateEmail} | Subject: ${subject}`);
      return true;
    } else {
      logEmailLocally(candidateEmail, subject, bodyText);
      return true;
    }
  } catch (error: any) {
    console.error(`Failed to send Resend email to ${candidateEmail}: ${error.message}`);
    console.log('Falling back to local logging...');
    logEmailLocally(candidateEmail, subject, bodyText);
    return true;
  }
};

export const sendCandidateHiredEmail = async (
  candidateEmail: string,
  candidateName: string,
  jobTitle: string,
  companyName: string
): Promise<boolean> => {
  const subject = `Congratulations! You are hired for the position of ${jobTitle}`;
  const bodyText = `Hi ${candidateName},

We are thrilled to inform you that you have been selected and hired for the position of ${jobTitle} at ${companyName}!

Congratulations on clearing the interview rounds! Our HR team will reach out to you with the official offer letter and onboarding details shortly.

We look forward to working with you!

Best regards,
The Recruiting Team
${companyName}`;

  try {
    if (resendInstance) {
      await resendInstance.emails.send({
        from: formattedFrom,
        to: candidateEmail,
        subject: subject,
        text: bodyText,
      });
      console.log(`[RESEND EMAIL SENT] To: ${candidateEmail} | Subject: ${subject}`);
      return true;
    } else {
      logEmailLocally(candidateEmail, subject, bodyText);
      return true;
    }
  } catch (error: any) {
    console.error(`Failed to send Resend email to ${candidateEmail}: ${error.message}`);
    console.log('Falling back to local logging...');
    logEmailLocally(candidateEmail, subject, bodyText);
    return true;
  }
};
