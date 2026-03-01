"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMongo = initMongo;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongo_1 = require("../model/mongo");
dotenv_1.default.config();
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/chatdb';
async function initMongo() {
    try {
        // connect
        await mongoose_1.default.connect(MONGO_URL, {
        // use new parser / topology are defaults on modern drivers
        // keep retryWrites/defaults as desired
        });
        console.log('MongoDB connected to', MONGO_URL);
        // initialize models & ensure indexes
        await (0, mongo_1.initMongooseModels)();
        // optionally expose connection
        return mongoose_1.default.connection;
    }
    catch (err) {
        console.error('MongoDB connection error', err);
        throw err;
    }
}
