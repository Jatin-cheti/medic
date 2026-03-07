import { Request, Response, NextFunction } from 'express';
import { documentService } from '../services/documentService';

export const uploadDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const files = req.files as Express.Multer.File[];
    const result = await documentService.uploadDocuments(userId, files);
    res.status(201).json({ message: 'Documents uploaded successfully', data: result });
  } catch (error) {
    next(error);
  }
};
