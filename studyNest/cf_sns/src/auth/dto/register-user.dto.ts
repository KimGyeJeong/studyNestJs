import {UsersModel} from "../../users/entity/users.entity";
import {PickType} from "@nestjs/mapped-types";

export class RegisterUserDTO extends PickType(UsersModel, ['nickname','email','password']){
}