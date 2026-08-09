import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribePushDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class UnsubscribePushDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}

export class SendTestPushDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  url?: string;
}
