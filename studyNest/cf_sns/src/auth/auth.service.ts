import { Injectable } from '@nestjs/common';

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
}
