import {
    Column,
    CreateDateColumn,
    Entity,
    Generated,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn
} from 'typeorm';

@Entity()
export class UserModel {
    /**
     * @PrimaryGeneratedColumn()
     * Primary Column은 모든 테이블에서 기본적으로 존재해야 한다.
     * 테이블 안에서 각각의 Row를 구분 할 수 있는 컬럼이다.
     *
     * @PrimaryColumn
     *
     *
     * @PrimaryGeneratedColumn('uuid')
     * PrimaryGeteratedColumn --> 순서대로 위로 올라감
     * 1, 2, 3, 4 ... 999 이런식으로 올라감
     *
     * uuid는 특수한 키로 생성되어짐
     */
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    // 데이터가 생성되는 날짜와 시간
    @CreateDateColumn()
    createdAt: Date;

    // 데이터가 업데이트 되는 날짜와 시간
    @UpdateDateColumn()
    updatedAt: Date;

    // 데이터가 업데이트 될때마다 1씩 올라감
    // 새로 생성되면 값은 1
    // save() 함수가 몇번 불렸는지 기억함.
    @VersionColumn()
    version: number;

    @Column()
    @Generated('increment') // 1씩 올라가는 값
        // @Generated('uuid') // 새로 생기는 값 이때 string 형식으로 사용 
    additionalId: number;
    
    //additionalId 와 PrimaryGeneratedColumn 차이점은?
    // 기본키와 보조키로 사용하는점이 다름
}
