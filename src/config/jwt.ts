import jwt from 'jsonwebtoken';

export const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
        expiresIn: '30d',
    });
};
