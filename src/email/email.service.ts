import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

type MailgunMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
};

type VerifierResult =
  | { status: true; email: string; domain: string }
  | {
      status: false;
      error: { code: number; message: string };
    };

@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendEmail({ to, from, subject, text, html }: MailgunMessage) {
    const key = this.configService.get('MAILGUN_KEY');
    const domain = this.configService.get('MAILGUN_DOMAIN');

    if (!html) html = text;

    const auth = Buffer.from(`api:${key}`).toString('base64');

    const body = new URLSearchParams({
      to,
      from,
      subject,
      text,
      html,
    });

    try {
      await this.httpService.axiosRef.post(
        `https://api.mailgun.net/v3/${domain}/messages`,
        body,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );
    } catch (error: unknown) {
      console.log(error);
    }
  }

  async verifyEmailAddress(emailAddress: string) {
    const apiKey = this.configService.get('VERIFIER_API_KEY');

    const verifierUrl = new URL(
      `https://verifier.meetchopra.com/verify/${emailAddress}`,
    );
    verifierUrl.searchParams.append('token', apiKey);

    try {
      const { data } = await this.httpService.axiosRef.get<VerifierResult>(
        verifierUrl.toString(),
      );

      if (data.status === false) {
        const message = `I tried to verify that email and got this error message: "${data.error.message}". If you think this is wrong, shoot an email to team@ar1.dev.`;
        throw new BadRequestException(message);
      }
    } catch (error: unknown) {
      console.error(`There was an error verifying an email address:`, error);
    }
  }
}
