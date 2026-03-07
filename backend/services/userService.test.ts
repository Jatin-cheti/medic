import { UserService } from './userService';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/user';

jest.mock('../repositories/userRepository');

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
      const userData = { username: 'testUser', password: 'password123', role: 'doctor' };
      (userRepository.createUser as jest.Mock).mockResolvedValue(new User(1, userData.username, userData.role));

      const result = await userService.createUser(userData);
      expect(result).toEqual(expect.objectContaining({ username: 'testUser', role: 'doctor' }));
      expect(userRepository.createUser).toHaveBeenCalledWith(userData);
    });

    it('should throw an error if user creation fails', async () => {
      const userData = { username: 'testUser', password: 'password123', role: 'doctor' };
      (userRepository.createUser as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(userService.createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userId = 1;
      const user = new User(userId, 'testUser', 'doctor');
      (userRepository.getUserById as jest.Mock).mockResolvedValue(user);

      const result = await userService.getUserById(userId);
      expect(result).toEqual(user);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user not found', async () => {
      const userId = 1;
      (userRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
    });
  });
});
