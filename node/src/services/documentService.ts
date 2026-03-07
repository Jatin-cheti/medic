import Document from '../models/Document';

class DocumentService {
  async uploadDocuments(userId: number, files: Express.Multer.File[]) {
    const documents = files.map((file) => ({
      userId,
      type: file.fieldname,
      filePath: file.path,
    }));

    return await Document.insertMany(documents);
  }
}

export const documentService = new DocumentService();
