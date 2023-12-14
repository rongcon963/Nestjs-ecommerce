import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FileService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
    // THIS IS THE POLICY
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
            Effect: 'Allow',
            Principal: {
            AWS: ['*'],
            },
            Action: [
            's3:ListBucketMultipartUploads',
            's3:GetBucketLocation',
            's3:ListBucket',
            ],
            Resource: [`arn:aws:s3:::${this.configService.get<string>('MINIO_BUCKET_NAME')}`], // Change this according to your bucket name
        },
        {
            Effect: 'Allow',
            Principal: {
            AWS: ['*'],
            },
            Action: [
            's3:PutObject',
            's3:AbortMultipartUpload',
            's3:DeleteObject',
            's3:GetObject',
            's3:ListMultipartUploadParts',
            ],
            Resource: [`arn:aws:s3:::${this.configService.get<string>('MINIO_BUCKET_NAME')}/*`], // Change this according to your bucket name
        },
      ],
    };
    this.minioClient.setBucketPolicy(
      this.configService.get<string>('MINIO_BUCKET_NAME'),
      JSON.stringify(policy),
      function (err) {
      if (err) throw err;

      console.log('Bucket policy set');
      },
    );
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');
    this.baseUrl = this.configService.get<string>('MINIO_BASE_URL') || 'http://localhost:9000';
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const metaData = {
      'Content-Type': file.mimetype,
      'Content-Length': file.size,
    };

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      metaData,
    );

    return `${this.baseUrl}/${this.bucketName}/${fileName}`;
  }

  async getFileUrl(fileName: string) {
    return await this.minioClient.presignedUrl('GET', this.bucketName, fileName);
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
