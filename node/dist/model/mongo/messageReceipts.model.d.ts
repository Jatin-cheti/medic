import { Document, Model } from 'mongoose';
export type ReceiptStatus = 'sent' | 'delivered' | 'read' | 'failed';
export interface IMessageReceipt extends Document {
    messageUuid: string;
    userId: number;
    status: ReceiptStatus;
    deliveredAt?: Date | null;
    readAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MessageReceiptModel: Model<IMessageReceipt>;
