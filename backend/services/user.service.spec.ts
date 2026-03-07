import { UserService } from './user.service';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';

jest.mock('../repositories/user.repository');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
    userService = new UserService(userRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const userData = { username: 'testuser', password: 'password123', role: 'doctor' };
      (userRepository.create as jest.Mock).mockResolvedValue(new User(userData));

      const result = await userService.createUser(userData);
      expect(result).toEqual(expect.objectContaining(userData));
      expect(userRepository.create).toHaveBeenCalledWith(userData);
    });

    it('should throw an error if user creation fails', async () => {
      const userData = { username: 'testuser', password: 'password123', role: 'doctor' };
      (userRepository.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(userService.createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 1;
      const user = new User({ id: userId, username: 'testuser', role: 'doctor' });
      (userRepository.findById as jest.Mock).mockResolvedValue(user);

      const result = await userService.getUserById(userId);
      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user not found', async () => {
      const userId = 1;
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
    });
  });
});
