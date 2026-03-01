import { Document, Model } from 'mongoose';
export interface IMessage extends Document {
    uuid: string;
    conversationUuid: string;
    senderId: number;
    type: string;
    content?: string;
    attachments?: Array<string>;
    editedAt?: Date | null;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MessageModel: Model<IMessage>;
