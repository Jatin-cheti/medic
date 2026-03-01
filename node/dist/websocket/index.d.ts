import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
export declare function initSocket(server: HttpServer): Promise<Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>>;
