import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await adminService.createAdmin(req.body);
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await adminService.getAdmins();
        res.status(200).json(admins);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        await adminService.deleteAdmin(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
