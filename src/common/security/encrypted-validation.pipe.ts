import { ArgumentMetadata, BadRequestException, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { decryptPayloadEnvelope, isEncryptedPayloadEnvelope } from './payload-crypto';

export class EncryptedValidationPipe extends ValidationPipe {
  constructor(
    private readonly secret: string,
    options: ValidationPipeOptions,
  ) {
    super(options);
  }

  override async transform(value: unknown, metadata: ArgumentMetadata) {
    let nextValue = value;

    if (metadata.type === 'body' && value && typeof value === 'object' && isEncryptedPayloadEnvelope(value)) {
      if (!this.secret) {
        throw new BadRequestException('Missing PAYLOAD_ENCRYPTION_SECRET');
      }

      try {
        nextValue = decryptPayloadEnvelope(value, this.secret);
      } catch {
        throw new BadRequestException('Invalid encrypted payload');
      }
    }

    return super.transform(nextValue, metadata);
  }
}
