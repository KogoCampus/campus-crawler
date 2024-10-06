import {
  S3Client,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';

export interface S3ClientOptions {
  region: string;
  bucketName: string;
}

const bucketConfig = {
  staging: {
    region: 'us-west-2',
    bucketName: 'kogo-campus-crawler-staging-data',
  },
  production: {
    region: 'us-west-2',
    bucketName: 'kogo-campus-crawler-production-data',
  },
};

export default class CommonS3Client {
  private s3: S3Client;
  private config: S3ClientOptions;

  constructor() {
    const env = process.env.NODE_ENV == 'production' ? 'production' : 'staging';
    this.config = bucketConfig[env];
    this.s3 = new S3Client({ region: this.config.region });
  }

  async listObjects(params: Omit<ListObjectsV2CommandInput, 'Bucket'> = {}) {
    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      ...params,
    });
    return await this.s3.send(command);
  }

  async getObject(key: string | string[], params: Omit<GetObjectCommandInput, 'Bucket' | 'Key'> = {}) {
    const formattedKey = this.formatKey(key); // Format the key

    const command = new GetObjectCommand({
      Bucket: this.config.bucketName,
      Key: formattedKey,
      ...params,
    });
    return await this.s3.send(command);
  }

  async putObject(
    key: string | string[],
    body: PutObjectCommandInput['Body'],
    params: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'> = {},
  ) {
    const formattedKey = this.formatKey(key); // Format the key

    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: formattedKey,
      Body: body,
      ...params,
    });
    return await this.s3.send(command);
  }

  private formatKey(key: string | string[]): string {
    if (Array.isArray(key)) {
      return key.join('/');
    }
    return key;
  }
}
