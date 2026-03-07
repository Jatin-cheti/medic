import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { validateLogin, validateSignup } from '../validators/authValidator';

class AuthController {
    async signup(req: Request, res: Response) {
        const { error } = validateSignup(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const user = await UserService.createUser(req.body);
        if (!user) return res.status(400).json({ message: 'User already exists' });

        res.status(201).json({ message: 'User created successfully', user });
    }

    async login(req: Request, res: Response) {
        const { error } = validateLogin(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const token = await UserService.loginUser(req.body);
        if (!token) return res.status(401).json({ message: 'Invalid credentials' });

        res.status(200).json({ token });
    }
}

export const authController = new AuthController();
