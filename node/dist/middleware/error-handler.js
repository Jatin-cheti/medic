"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(req, _res, next) {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    if (statusCode >= 500) {
        console.error('Unhandled server error:', err);
    }
    res.status(statusCode).json({
        error: message,
        message,
    });
}
