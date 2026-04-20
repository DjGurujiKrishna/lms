import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

/**
 * Amazon SES (TASK step 18). If `SES_FROM_EMAIL` and AWS credentials
 * are not set, all methods no-op (local dev without email).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly client: SESClient | null;
  private readonly from: string | null;

  constructor(private readonly config: ConfigService) {
    this.from = this.config.get<string>('SES_FROM_EMAIL')?.trim() || null;
    const region = this.config.get<string>('AWS_REGION') ?? 'ap-south-1';
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (this.from && accessKeyId && secretAccessKey) {
      this.client = new SESClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.client = null;
    }
  }

  isEnabled(): boolean {
    return this.client !== null && !!this.from;
  }

  async sendLoginCredentials(params: {
    to: string;
    name: string;
    password: string;
    appName?: string;
  }): Promise<void> {
    const app = params.appName ?? 'LMS';
    const text = [
      `Hello ${params.name},`,
      '',
      `Your account for ${app} is ready.`,
      '',
      `Login email: ${params.to}`,
      `Temporary password: ${params.password}`,
      '',
      'Sign in with these credentials and change your password when prompted.',
      '',
      '— Institute LMS',
    ].join('\n');

    await this.sendPlain({
      to: params.to,
      subject: `Your ${app} login credentials`,
      text,
    });
  }

  /** Generic notification (e.g. exam result — TASK step 18). */
  async sendPlain(params: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    if (!this.client || !this.from) {
      this.logger.debug(`Email skipped (SES not configured): ${params.subject}`);
      return;
    }

    await this.client.send(
      new SendEmailCommand({
        Source: this.from,
        Destination: { ToAddresses: [params.to] },
        Message: {
          Subject: { Data: params.subject, Charset: 'UTF-8' },
          Body: { Text: { Data: params.text, Charset: 'UTF-8' } },
        },
      }),
    );
  }
}
