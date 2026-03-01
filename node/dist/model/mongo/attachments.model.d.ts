import { Document, Model } from 'mongoose';
export interface IAttachment extends Document {
    uuid?: string;
    filename: string;
    contentType: string;
    size: number;
    storageKey: string;
    uploadedBy: number;
    messageUuid?: string | null;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AttachmentModel: Model<IAttachment>;
