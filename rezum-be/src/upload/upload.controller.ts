import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    // Add basic file validation
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    if (file.size > maxSize) {
      throw new HttpException(
        'File too large. Maximum size is 10MB.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fileId = this.uploadService.storeFile(file.originalname, file.buffer);

    return {
      message: 'File uploaded successfully',
      fileId,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get()
  getAllFiles() {
    return {
      files: this.uploadService.getAllFiles(),
    };
  }

  @Get(':fileId')
  getFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = this.uploadService.getFile(fileId);

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    // Set appropriate headers for file download
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileId}"`,
      'Content-Length': file.length,
    });

    // Send the file buffer
    res.send(file);
  }

  @Get('text/:fileId')
  async extractText(@Param('fileId') fileId: string) {
    const text = await this.uploadService.extractTextFromPDF(fileId);

    if (text === null) {
      throw new HttpException(
        'File not found or not a PDF',
        HttpStatus.NOT_FOUND,
      );
    }

    return { text };
  }

  @Get('analyze/:fileId')
  async analyzeResume(@Param('fileId') fileId: string) {
    const analysis = await this.uploadService.analyzeResume(fileId);

    if (analysis === null) {
      throw new HttpException(
        'File not found, not a PDF, or analysis failed',
        HttpStatus.NOT_FOUND,
      );
    }

    return analysis;
  }

  @Delete(':fileId')
  deleteFile(@Param('fileId') fileId: string) {
    const deleted = this.uploadService.deleteFile(fileId);

    if (!deleted) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'File deleted successfully' };
  }
}
