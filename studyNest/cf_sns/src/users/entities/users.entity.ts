import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class UsersModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        // 1) 최대길이 20
        length: 20,
        // 2) 유일무이한 값
        unique: true,
    })
    nickname: string;

    @Column()
        // 1) 유일무이한 값
    email: string;

    @Column()
    password: string;
}