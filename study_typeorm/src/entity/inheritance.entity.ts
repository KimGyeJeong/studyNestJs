import {
    ChildEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    TableInheritance,
    UpdateDateColumn
} from "typeorm";

// BookModel, CarModel 테이블 둘다 존재, 테이블 안에 공통된 컬럼들을 모아놓은 BaseModel
export class BaseModel{
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity()
export class BookModel extends BaseModel{
    @Column()
    name: string;
}

@Entity()
export class CarModel extends BaseModel{
    @Column()
    brand: string;
}

/////////////////
// SingleBaseModel의 테이블에 ComputerModel, AirplaneModel이 동시에 존재
@Entity()
@TableInheritance({
    column : {
        name: 'type',
        type: 'varchar',
    }
})
export class SingleBaseModel{
    @PrimaryGeneratedColumn()
    id: number;
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}

@ChildEntity()
export class ComputerModel extends SingleBaseModel{
    @Column()
    brand: string;
}

@ChildEntity()
export class AirplaneModel extends SingleBaseModel{
    @Column()
    country: string;
}