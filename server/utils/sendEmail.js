import sgMail from "@sendgrid/mail";

const sendEmail = async (options) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email,
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    templateId: options.templateId,
    dynamicTemplateData: options.dynamicTemplateData,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully via SendGrid");
  } catch (error) {
    console.error("SendGrid Error:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error("Email could not be sent.");
  }
};

export default sendEmail;
