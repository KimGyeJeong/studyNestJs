import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export class Name{
    @Column()
    first: string;
    
    @Column()
    last: string;
}

@Entity()
export class StudentModel {
    @PrimaryGeneratedColumn()
    id: number;
    
    //Entity Embedding을 사용하면
    // 아래와 같은 firstName, lastName 중복된 것들을 class로 빼서 동일하게 사용할수 있음.
    
    // @Column()
    // firstName: string;
    //
    // @Column()
    // lastName: string;
    @Column(() => Name)
    name : Name;
    
    @Column()
    class: string;
}

@Entity()
export class TeacherModel{
    @PrimaryGeneratedColumn()
    id: number;

    // @Column()
    // firstName: string;
    //
    // @Column()
    // lastName: string;
    @Column(() => Name)
    name : Name;
    
    @Column()
    salary: number;
}

