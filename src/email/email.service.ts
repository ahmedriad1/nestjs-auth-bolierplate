import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Sendgrid from '@sendgrid/mail';
import { InjectSentry, SentryService } from '@xiifain/nestjs-sentry';

type VerifierResult =
  | { status: true; email: string; domain: string }
  | {
      status: false;
      error: { code: number; message: string };
    };

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectSentry() private readonly sentry: SentryService,
  ) {
    Sendgrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(data: Sendgrid.MailDataRequired) {
    try {
      const transport = await Sendgrid.send(data);
      return transport;
    } catch (error: unknown) {
      this.sentry.instance().captureException(error);
      this.logger.error('Failed to send email !');
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
