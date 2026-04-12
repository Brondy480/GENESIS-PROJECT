import nodemailer from "nodemailer";

////////////////////////////////////////////////////////
// CREATE TRANSPORTER (lazy — reads env at call time)
////////////////////////////////////////////////////////

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

////////////////////////////////////////////////////////
// SEND AGREEMENT SIGNING EMAIL
////////////////////////////////////////////////////////

export const sendAgreementSigningEmail = async ({
  recipientEmail,
  recipientName,
  role,
  projectTitle,
  dealAmount,
  escrowId,
}) => {
  console.log("📧 Attempting to send agreement email to:", recipientEmail);
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
  console.log("📧 EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  const subject = `Action Required — Sign Your Investment Agreement | Genesis Platform`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Genesis Platform</h1>
        <p style="color: #a0a0b0; margin: 8px 0 0;">Boosting African Innovation</p>
      </div>

      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Hello ${recipientName},</h2>

        <p style="color: #444; line-height: 1.6;">
          ${
            role === "investor"
              ? `Your payment for the investment deal on <strong>${projectTitle}</strong> has been confirmed and funds are now secured in escrow.`
              : `An investor has successfully completed payment for their investment in <strong>${projectTitle}</strong>.`
          }
        </p>

        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #1a1a2e;">Deal Summary</h3>
          <p style="margin: 4px 0; color: #444;"><strong>Project:</strong> ${projectTitle}</p>
          <p style="margin: 4px 0; color: #444;"><strong>Amount:</strong> ${dealAmount.toLocaleString()} FCFA</p>
          <p style="margin: 4px 0; color: #444;"><strong>Escrow ID:</strong> ${escrowId}</p>
        </div>

        <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <h3 style="margin: 0 0 8px; color: #92400e;">⚠️ Action Required</h3>
          <p style="margin: 0; color: #78350f; line-height: 1.6;">
            To complete this deal, you must <strong>sign the investment agreement</strong>. 
            Please log in to your Genesis dashboard, download the agreement document, 
            sign it, and upload the signed copy.
          </p>
        </div>

        <ol style="color: #444; line-height: 2;">
          <li>Log in to your Genesis Platform account</li>
          <li>Go to <strong>My Deals</strong> or <strong>Dashboard</strong></li>
          <li>Find the deal for <strong>${projectTitle}</strong></li>
          <li>Download the agreement document</li>
          <li>Sign it (physically or digitally)</li>
          <li>Upload the signed copy</li>
        </ol>

        <p style="color: #666; font-size: 14px;">
          Funds will remain securely in escrow until both parties have signed 
          and the agreement has been validated by our team.
        </p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Genesis Platform. Boosting African Innovation.
        </p>
      </div>

    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject,
      html,
    });
    console.log("✅ Agreement email sent to:", recipientEmail, "| ID:", info.messageId);
  } catch (err) {
    console.error("❌ Agreement email failed:", err.message);
    throw err;
  }
};

////////////////////////////////////////////////////////
// SEND PAYMENT CONFIRMED EMAIL (to creator)
////////////////////////////////////////////////////////

export const sendPaymentConfirmedEmail = async ({
  recipientEmail,
  recipientName,
  projectTitle,
  dealAmount,
  investorName,
}) => {
  console.log("📧 Attempting to send payment confirmed email to:", recipientEmail);

  const subject = `Payment Received — Investment in ${projectTitle} | Genesis Platform`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      
      <div style="background: #1a1a2e; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Genesis Platform</h1>
      </div>

      <div style="padding: 32px; background: #ffffff;">
        <h2 style="color: #1a1a2e;">Hello ${recipientName},</h2>

        <p style="color: #444; line-height: 1.6;">
          Great news! <strong>${investorName}</strong> has completed payment 
          of <strong>${dealAmount.toLocaleString()} FCFA</strong> for their investment
          in <strong>${projectTitle}</strong>.
        </p>

        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #065f46;">
            ✅ Funds are now secured in escrow and will be released to you 
            once both parties sign the investment agreement and our team validates it.
          </p>
        </div>

        <p style="color: #444;">Please log in to sign your copy of the agreement.</p>
      </div>

      <div style="background: #f5f5f5; padding: 20px; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} Genesis Platform.
        </p>
      </div>

    </div>
  `;

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject,
      html,
    });
    console.log("✅ Payment confirmed email sent to:", recipientEmail, "| ID:", info.messageId);
  } catch (err) {
    console.error("❌ Payment confirmed email failed:", err.message);
    throw err;
  }
};

export const sendEscrowReleasedEmail = async ({
    recipientEmail,
    recipientName,
    projectTitle,
    amount,
    platformFee,
    equity,
    role,
  }) => {
    console.log("📧 Sending escrow released email to:", recipientEmail);
  
    const subject = `Deal Completed — ${projectTitle} | Genesis Platform`;
  
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  
        <div style="background: #1a1a2e; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Genesis Platform</h1>
          <p style="color: #a0a0b0; margin: 8px 0 0;">Boosting African Innovation</p>
        </div>
  
        <div style="padding: 32px; background: #ffffff;">
          <h2 style="color: #1a1a2e;">Hello ${recipientName},</h2>
  
          ${role === "creator" ? `
            <p style="color: #444; line-height: 1.6;">
              Great news! The escrow for <strong>${projectTitle}</strong> has been released.
            </p>
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #065f46;">
                ✅ <strong>${Number(amount).toLocaleString()} FCFA</strong> has been credited to your Genesis wallet.
              </p>
              <p style="margin: 8px 0 0; color: #065f46; font-size: 13px;">
                Platform fee deducted: ${Number(platformFee).toLocaleString()} FCFA
              </p>
            </div>
          ` : `
            <p style="color: #444; line-height: 1.6;">
              Your investment deal for <strong>${projectTitle}</strong> is now complete.
            </p>
            <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #065f46;">
                ✅ You now own <strong>${equity}% equity</strong> in ${projectTitle}.
              </p>
              <p style="margin: 8px 0 0; color: #065f46; font-size: 13px;">
                Total invested: ${Number(amount).toLocaleString()} FCFA
              </p>
            </div>
          `}
  
          <p style="color: #666; font-size: 14px;">
            Thank you for being part of the Genesis Platform community.
          </p>
        </div>
  
        <div style="background: #f5f5f5; padding: 20px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Genesis Platform. Boosting African Innovation.
          </p>
        </div>
  
      </div>
    `;
  
    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipientEmail,
        subject,
        html,
      });
      console.log("✅ Escrow release email sent to:", recipientEmail, "| ID:", info.messageId);
    } catch (err) {
      console.error("❌ Escrow release email failed:", err.message);
      throw err;
    }
  };