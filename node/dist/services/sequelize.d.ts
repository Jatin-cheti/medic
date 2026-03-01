import { Sequelize as SequelizeType } from 'sequelize';
declare let sequelize: SequelizeType;
export { sequelize };
export declare function initSequelize(): Promise<void>;
