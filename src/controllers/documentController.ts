import { Request, Response } from 'express';
import DocumentService from '../services/documentService';

class DocumentController {
    async uploadDocument(req: Request, res: Response) {
        try {
            const document = await DocumentService.uploadDocument(req.body, req.file);
            res.status(201).json(document);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async verifyDocument(req: Request, res: Response) {
        try {
            const { documentId, status } = req.body;
            const updatedDocument = await DocumentService.verifyDocument(documentId, status);
            res.status(200).json(updatedDocument);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getDocuments(req: Request, res: Response) {
        try {
            const documents = await DocumentService.getDocuments();
            res.status(200).json(documents);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new DocumentController();
