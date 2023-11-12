// Import the necessary modules here
import nodemailer from "nodemailer";
import mjml2html from "mjml";
import path from "path";

export const sendWelcomeEmail = async (user) => {
    console.log("this is user", user);

    
    // Create a Nodemailer transport
    const transport = nodemailer.createTransport({
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.STORFLEET_SMPT_MAIL,
        pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
      },
    });

    const mjmlTemplate = `
        <mjml>
        
        <mj-body background-color="#ffffff" font-size="13px">
          <mj-section background-color="#ffffff" padding-bottom="0px" padding-top="0">
            <mj-column vertical-align="top" width="100%">
              <mj-image src="https://files.codingninjas.in/logo1-32230.png?_ga=2.116099462.1481146397.1698892021-1403394722.1697792738" alt="" align="center" border="none" margin-top="10px" width="180px" padding-left="0px" padding-right="0px" padding-bottom="0px" padding-top="30px"></mj-image>
            </mj-column>
          </mj-section>
          <mj-section background-color="" vertical-align="top" padding-bottom="0px" padding-top="0">
            <mj-column vertical-align="top" width="100%">
              <mj-text align="left" color="#4f0e4f" font-size="45px" font-weight="bold" font-family="open Sans Helvetica, Arial, sans-serif" padding-left="40px" padding-right="25px" padding-bottom="30px" padding-top="50px">Welcome to StoreFleet </mj-text>
            </mj-column>
          </mj-section>
          <mj-section background-color="" padding-bottom="20px" padding-top="20px">
            <mj-column vertical-align="middle" width="100%">
              <mj-text align="center" color="#4f0e4f" font-size="22px" font-weight="bold" font-family="open Sans Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px"><span style="color:#4f0e4f">Hello ${user.name},</span><br /><br />Thank you for registering with StoreFleet,we were exited to have you as a new memnber of our community. </mj-text>
              
              <mj-button  background-color="#027bff" balign="center" font-size="22px" font-weight="bold" color="#ffffff" border-radius="10px" padding="10px" color="#1AA0E1" font-family="open Sans Helvetica, Arial, sans-serif">Login</mj-button>
              
            </mj-column>
          </mj-section>
        </mj-body>
      
        </mjml>
    `;

    const { html } = mjml2html(mjmlTemplate);

    const mailOptions = {
        from: 'storefleet2k23@gmail.com',
        to: user.email,
        subject: 'Welcome to StoreFleet',
        html: html
    };

    try {
        const result = await transport.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (err) {
        console.log('Email send failure with error: ' + err);
    }
};
