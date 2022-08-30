import { User } from '@prisma/client';

type Params = {
  magicLink: string;
  hostname: string;
  email: string;
  domainUrl: string;
  user?: User;
};

export const getMagicLinkTemplate = ({
  magicLink,
  hostname,
  user,
  email,
  domainUrl,
}: Params) => {
  const text = `
Here's your sign-in link for ${hostname}:

${magicLink}

${
  user
    ? `Welcome back ${user.email}!`
    : `
Clicking the link above will create a *new* account on ${hostname} with the email ${email}. Welcome!
If you'd instead like to change your email address for an existing account, please send an email to email-change@ar1.dev from the original email address.
      `.trim()
}

Thanks!

– Ahmed

P.S. If you did not request this email, you can safely ignore it.
  `.trim();

  const html = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <style type="text/css">
      @font-face {
        font-family: 'Matter';
        src: url('https://kcd-img.netlify.app/Matter-Medium.woff2') format('woff2'),
          url('https://kcd-img.netlify.app/Matter-Medium.woff') format('woff');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Matter';
        src: url('https://kcd-img.netlify.app/Matter-Regular.woff2') format('woff2'),
          url('https://kcd-img.netlify.app/Matter-Regular.woff') format('woff');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    </style>
  </head>
  <body style="font-family:Matter, sans-serif;">
    <div style="margin: 0 auto; max-width: 450px;">
      <h2 style="text-align: center">${
        user
          ? `Hey ${user.name}! Welcome back to ${hostname}!`
          : `Hey ${email}! Welcome to ${hostname}`
      }</h2>      
      <h3 style="text-align: center">Click the button below to login to ${hostname}</h3>
      <a href="${magicLink}" style="display: block; margin: 0 auto; width: 80%; padding: 1.5rem; background: #4f46e5; border-radius: 7px; border-width: 0; font-size: 1.1rem; text-align: center; font-family: sans-serif; text-decoration: none; color: white">
        ${user ? 'Login' : 'Create Account'}
      </a>
      <div style="text-align: center; margin-top: 1rem; font-size: .9rem">
        <div style="color: grey">This link is valid for 30 minutes.</div>
        <a href="${domainUrl}/login" style="margin-top: .4rem; display: block">Click here to request a new link.</a>
      </div>
        
      <hr style="width: 20%; height: 0px; border: 1px solid lightgrey; margin-top: 2rem; margin-bottom: 2rem">
        
      <div style="text-align: center; color: grey; font-size: .8rem; line-height: 1.2rem">
        You received this because your email address was used to sign up for an account on
        <a href="${domainUrl}" style="color: grey">${hostname}</a>. If you didn't sign up for an account,
        feel free to disregard this email.
      </div>
    </div>
  </body>
</html>`;

  return { html, text };
};
