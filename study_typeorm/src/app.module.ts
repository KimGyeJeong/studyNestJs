import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UserModel} from "./entity/user.entity";
import {StudentModel, TeacherModel} from "./entity/person.entity";
import {AirplaneModel, BookModel, CarModel, ComputerModel, SingleBaseModel} from "./entity/inheritance.entity";

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
            entities: [UserModel, StudentModel, TeacherModel, BookModel, CarModel, ComputerModel, AirplaneModel, SingleBaseModel],
            synchronize: true,
        })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
