import { Model, Sequelize } from 'sequelize';

export interface IUser extends Model {
  id: number;
  uuid: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  password?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface IConversation extends Model {
  id: number;
  uuid: string;
  created_by: number;
}

export interface IConversationParticipant extends Model {
  id: number;
  conversation_id: number;
  user_id: number;
}

export interface IContact extends Model {
  id: number;
  user_id: number;
  contact_user_id: number;
}

export interface IDevice extends Model {
  id: number;
  user_id: number;
}

export interface ICallSession extends Model {
  id: number;
  conversation_id: number;
}

export interface ICallParticipant extends Model {
  id: number;
  call_session_id: number;
  user_id: number;
}

interface Database {
  User: typeof Model & { new(): IUser };
  Conversation: typeof Model & { new(): IConversation };
  ConversationParticipant: typeof Model & { new(): IConversationParticipant };
  Contact: typeof Model & { new(): IContact };
  Device: typeof Model & { new(): IDevice };
  CallSession: typeof Model & { new(): ICallSession };
  CallParticipant: typeof Model & { new(): ICallParticipant };
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

declare const db: Database;
export default db;
