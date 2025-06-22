import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UsersModel} from "./entity/users.entity";
import {Repository} from "typeorm";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UsersModel)
        private readonly usersRepository: Repository<UsersModel>,
    ){    }

    async createUser(user : Pick<UsersModel, 'email'|'nickname'|'password'>){
        // 1. 닉네임 중복 확인. exists() 사용. 값이있으면 true 반환
        const isExistsNickName = await this.usersRepository.exists({
            where: {nickname: user.nickname},
        })
        if (isExistsNickName){
            throw new BadRequestException('Nickname already exists');
        }
        // 2. 이메일 중복 확인.
        const isExistsEmail = await this.usersRepository.exists({
            where: {email: user.email},
        });
        if (isExistsEmail){
            throw new BadRequestException('Email already exists');
        }
        const userObject = this.usersRepository.create({
            nickname : user.nickname,
            email : user.email, 
            password : user.password,
        });
        
        const savedUser = await this.usersRepository.save(user);
        
        return savedUser;
    }
    
    async getAllUsers(){
        return await this.usersRepository.find();
    }
    
    async getUserByEmail(email : string){
        return this.usersRepository.findOne({
            where: {
                email,
            },
        });
    }
}
