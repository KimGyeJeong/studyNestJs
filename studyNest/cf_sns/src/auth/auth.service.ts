import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import {UsersModel} from "../users/entities/users.entity";
import {HASH_ROUNDS, JWT_SECRET} from "./const/auth.const";
import {UsersService} from "../users/users.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    /**
     * 우리가 만드려는 기능
     * 1) registerWithEmail
     * - 이메일로 회원가입
     * - email, nickname, password 를 입력받고 사용자를 생성
     * - 생성이 완료되면 accessToken 과 refreshToken 을 반환
     *      - 회원가입 후 다시 로그인하는 과정을 방지하기 위해
     *
     * 2) loginWithEmail
     * - 이메일을 이용한 로그인
     * - email, password 를 입력하면 사용자 검증을 진행
     * - 검증이 완료되면 accessToken 과 refreshToken 을 반환함
     *
     * 3) loginUser
     * - 1), 2) 에서 필요한 accessToken 과 refreshToken 을 반환하는 로직
     *
     * 4) signToken
     * - 3) 에서 필요한 accessToken 과 refreshToken 을 sign 하는 로직
     * - 토큰을 생성하는 로직
     *
     * 5) authenticateWithEmailAndPassword
     * - 2) 에서 로그인을 진행할때 필요한 기본적인 검증 진행
     *      1. 사용자가 존재하는지 확인(email)
     *      2. 비밀번호가 맞는지 확인
     *      3. 모두 통과되면 찾은 사용자 정보 반환
     *      ----- 까지 진행후 return
     *      4. loginWithEmail 에서 반환된 데이터를 기반으로 토큰 생성
     */

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UsersService,
    ) {
    }

    /**
     * 토큰을 사용하게 되는 방식
     *
     * 1. 사용자가 로그인 또는 회원가입을 진행하면 accessToken과 refreshToken을 발급받는다.
     * 2. 로그인 할때에는 Basic 토큰과 함께 요청을 보낸다.
     *      - Basic 토큰은 '이메일:비밀번호'를 Base64로 인코딩한 형태이다.
     *      - 예) {authorization : 'Basic {token}'}
     * 3. 아무나 접근 할 수 없는 정보(private route)를 접근 할때는 accessToken을 Header에 추가해서 요청과 함께 보낸다.
     *      - 예) {authorization : 'Bearer {token}'}
     * 4. 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
     *      - 예) 현재 로그인한 사용자가 작성한 포스트만 가져오려면 토큰의 sub 값에 입력되어있는 사용자의 포스트만 따로 필터링할 수 있다.
     *      - 예) 특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근하지 못한다.
     * 5. 모든 토큰은 만료기간이 있으며, 만료기간이 지나면 새로 토큰을 발급받아야 한다.
     *      그렇지 않으면 jwtService.verify() 에서 인증이 통과가 되지 않는다.
     *      그러니 access 토큰을 새로 발급 받을 수 있는 /auth/token/access와
     *      refresh 토큰을 새로 발급 받을 수 있는 /auth/token/refresh가 필요하다.
     * 6. 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청을 해서 새로운 토큰을 발급받고 새로운 토큰을 사용해서 private route에 접근한다.
     */

    /**
     * Header 로 부터 토큰을 받을때
     *
     * {authorization: 'Basic {token}'}
     * {authorization: 'Bearer {token}'}
     */
    extractTokenFromHeader(header: string, isBearer: boolean) {
        const splitToken = header.split(" ");
        const prefix = isBearer ? "Bearer" : "Basic";
        if (splitToken.length !== 2 || splitToken[0] !== prefix) {
            throw new UnauthorizedException("Invalid token");
        }

        return splitToken[1];
    }

    // 1. base64로 인코딩된 문자열을 -> email:password 형식으로 변환
    // 2. email:password -> [email:password]
    // 3. return {email: email, password: password}
    decodeBasicToken(base64String: string) {
        const decoded = Buffer.from(base64String, 'base64').toString('utf8');
        const split = decoded.split(':');
        if (split.length !== 2) {
            throw new UnauthorizedException("Invalid Base token");
        }
        return {email: split[0], password: split[1]};
    }

    // 토큰 검증
    verifyToken(token: string) {
        return this.jwtService.verify(token, {
            secret: JWT_SECRET,
        });
    }

    rotateToken(token: string, isRefreshToken: boolean) {
        const decoded = this.jwtService.verify(token, {
            secret: JWT_SECRET,
        });

        // sub : id, email : email, type: 'access' | 'refresh'
        if (decoded.type !== 'refresh') {
            throw new UnauthorizedException("토큰 재발급은 refresh 토큰으로만 가능합니다.");
        }

        return this.signToken({...decoded}, isRefreshToken);
    }


    /**
     * Payload에 들어갈 정보
     * 1) email
     * 2) sub -> id
     * 3) type : 'accessToken' | 'refreshToken'
     */
    signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
        const payload = {
            email: user.email,
            sub: user.id,
            type: isRefreshToken ? 'refresh' : 'access',
        };

        return this.jwtService.sign(payload, {
            secret: JWT_SECRET,
            // 초 단위
            // expiresIn: isRefreshToken ? 60 * 60 : 60 * 5,
            expiresIn: isRefreshToken ? 60 * 60 * 24 : 60 * 60,
        });
    }

    loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
        return {
            accessToken: this.signToken(user, false),
            refreshToken: this.signToken(user, true),
        }
    }

    async authenticateWithEmailAndPassword(user: Pick<UsersModel, 'email' | 'password'>) {
        // 1. 사용자가 존재하는지 확인(email)
        const existingUser = await this.userService.getUserByEmail(user.email);
        if (!existingUser) {
            throw new UnauthorizedException('존재하지 않는 사용자입니다.');
        }
        // 2. 비밀번호가 맞는지 확인
        // 파라미터. 1. 입력된 비밀번호, 2. 기존 해시(hash) -> 사용자 정보에 저장되어있는 hash
        const passOk = await bcrypt.compare(user.password, existingUser.password);
        if (!passOk) {
            throw new UnauthorizedException('비밀번호가 틀렸습니다.');
        }
        // 3. 모두 통과되면 찾은 사용자 정보 반환
        return existingUser;
    }

    async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
        const existingUser = await this.authenticateWithEmailAndPassword(user);

        return this.loginUser(existingUser);
    }

    async registerWithEmail(user: Pick<UsersModel, 'nickname' | 'email' | 'password'>) {
        const hash = await bcrypt.hash(user.password, HASH_ROUNDS);

        const newUser = await this.userService.createUser({...user, password: hash});

        return this.loginUser(newUser);
    }
}
