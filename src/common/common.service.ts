import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Injectable()
export class CommonService {
  constructor() {}

  static getMulterStorage() {
    return diskStorage({
      destination: join(__dirname, '..', '..', 'uploads'),
      filename: (_, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
        callback(null, filename);
      },
    });
  }

  uploadFile(req: Request, file: Express.Multer.File): string {
    const host = req.get('host');
    const protocol = req.protocol;

    return `${protocol}://${host}/uploads/${file.filename}`;
  }
}
