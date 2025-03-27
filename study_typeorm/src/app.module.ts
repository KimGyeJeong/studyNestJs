import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserModel} from "./entity/user.entity";
import {StudentModel, TeacherModel} from "./entity/person.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserModel,
        ]),
        TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5433,
        username: 'postgres',
        password: 'postgres',
        database: 'typeormstudy',
        entities: [UserModel, StudentModel, TeacherModel],
        synchronize: true,
    })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
