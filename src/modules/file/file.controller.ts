import { Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('file')
@Controller('file')
export class FileController {
  constructor(private readonly minioService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    await this.minioService.createBucketIfNotExists();
    const fileName = await this.minioService.uploadFile(file);
    return fileName;
  }

  @Get(':fileName')
  async getFile(@Param('fileName') fileName: string) {
    const fileUrl = await this.minioService.getFileUrl(fileName);
    return fileUrl;
  }

  @Delete(':fileName')
  async deleteFile(@Param('fileName') fileName: string) {
    await this.minioService.deleteFile(fileName);
    return fileName;
  }
}
