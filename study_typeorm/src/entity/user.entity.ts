import {
    Column,
    CreateDateColumn,
    Entity,
    Generated, JoinColumn, OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn
} from 'typeorm';
import {ProfileModel} from "./profile.entity";
import {PostModel} from "./post.entity";

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

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

    // @Column({
    //     // db가 인지하는 칼럼 타입
    //     // 자동으로 매치 시켜줌
    //     // varchar는 길이 지정 가능하나 text는 불가능함
    //     // type: 'text',
    //     type: 'varchar',
    //     // db 칼럼 이름
    //     // 프로퍼티 이름으로 자동 유추됨
    //     name: 'title',
    //     // 값의 길이
    //     // 입력할 수 있는 글자의 길이
    //     length: 300,
    //     // null 이 가능한지
    //     nullable: true,
    //     // update가 false 면 처음 저장할때만 값 지정 가능, 이후에는 값 변경 불가능
    //     update: false,
    //     // select find()를 실행할 때 기본으로 값을 불러올지
    //     // 기본값이 true
    //     select: false,
    //     // 기본 으로 입력되게 되는 값.
    //     // 아무것도 입력되지 않았을때 저장되는 값.
    //     default: 'default value',
    //     // 칼럼 중에서 유일무이한 값이 되어야 하는지. 기본값 false
    //     unique: false,
    //
    // })
    // title: string;

    @Column()
    email: string;

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

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @OneToOne(() => ProfileModel, (profile) => profile.user, {
        // find() 샐힝할때마다 항상 같이 가져올 relation
        // true : ***Repository.find({relations: profile:true}) 처럼 사용하지 않고 .find({}) 으로 자동으로 만들어줌
        // 기본값. eager:false
        // eager : true,
        eager: false,

        // true : 저장할때 relation을 한번에 같이 저장 가능
        // 기본값. cascade: false
        cascade: true,

        // 기본값. true
        // null을 넣어도 가능한지.
        // cascade 와 같이쓰는걸추천
        nullable: true,

        // ~했을때. 
        // 삭제했을때. 관계가 삭제되었을때.
        // no action : 아무것도 안함
        // cascade : 참조하는 Row도 같이 삭제
        // set null : 참조하는 Row에서 참조 id를 null로 변경
        // set default : 기본 세팅으로 설정(테이블의 기본 세팅)
        // restrict : 참조하고 있는 Row가 있는 경우 참조당하는 Row 삭제 불가
        // 추가.
        //@JoinColumn() 이 profile.entity쪽에 걸려있으면
        // profile이 삭제되어도 user는 삭제되지 않음.
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    profile: ProfileModel;

    @OneToMany(() => PostModel, (post) => post.author)
    posts: PostModel[];

    @Column({
        default: 0
    })
    count: number;

    //additionalId 와 PrimaryGeneratedColumn 차이점은?
    // 기본키와 보조키로 사용하는점이 다름
}
