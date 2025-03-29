import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserModel} from "./entity/user.entity";
import {StudentModel, TeacherModel} from "./entity/person.entity";
import {AirplaneModel, BookModel, CarModel, ComputerModel, SingleBaseModel} from "./entity/inheritance.entity";
import {ProfileModel} from "./entity/profile.entity";
import {PostModel} from "./entity/post.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserModel, ProfileModel, PostModel,
        ]),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5433,
            username: 'postgres',
            password: 'postgres',
            database: 'typeormstudy',
            entities: [UserModel, StudentModel, TeacherModel, BookModel, CarModel, ComputerModel, AirplaneModel, SingleBaseModel, ProfileModel, PostModel],
            synchronize: true,
        })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
