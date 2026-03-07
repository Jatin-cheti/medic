import User from '../models/User';

class UserService {
    public async getUsersByRole(role: string) {
        return await User.find({ role }).exec();
    }
}

export default new UserService();
