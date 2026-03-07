import { Request, Response, NextFunction } from 'express';
import UserService from '../services/userService';

class UserController {
    public async getUsersByRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { role } = req.params;
            const users = await UserService.getUsersByRole(role);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();
