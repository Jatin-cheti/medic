import DocumentModel from '../models/Document';

class DocumentService {
    async uploadDocument(data: any, file: Express.Multer.File) {
        const document = new DocumentModel({
            doctorId: data.doctorId,
            filePath: file.path,
        });
        return await document.save();
    }

    async verifyDocument(documentId: string, status: string) {
        return await DocumentModel.findByIdAndUpdate(documentId, { status }, { new: true });
    }

    async getDocuments() {
        return await DocumentModel.find();
    }
}

export default new DocumentService();
