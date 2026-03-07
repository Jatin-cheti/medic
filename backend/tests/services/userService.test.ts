import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { mockUser, mockUserRepository } from './mocks/userMocks';

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
        it('should create a user successfully', async () => {
            (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
            const result = await userService.createUser(mockUser);
            expect(result).toEqual(mockUser);
            expect(userRepository.create).toHaveBeenCalledWith(mockUser);
        });

        it('should throw an error if user creation fails', async () => {
            (userRepository.create as jest.Mock).mockRejectedValue(new Error('Database error'));
            await expect(userService.createUser(mockUser)).rejects.toThrow('Database error');
        });
    });

    describe('getUserById', () => {
        it('should return user details for a valid ID', async () => {
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            const result = await userService.getUserById(1);
            expect(result).toEqual(mockUser);
            expect(userRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw an error if user not found', async () => {
            (userRepository.findById as jest.Mock).mockResolvedValue(null);
            await expect(userService.getUserById(999)).rejects.toThrow('User not found');
        });
    });
});
