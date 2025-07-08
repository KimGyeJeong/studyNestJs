// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Client as SSHClient } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

// --- 여기에 모든 엔티티 클래스를 임포트하고 배열에 추가합니다. ---
import { PostsModel } from '../posts/entity/posts.entity';
import { UsersModel } from '../users/entity/users.entity';
import { ImageModel } from '../common/entity/image.entity';
import { ChatsModel } from '../chats/entity/chats.entity';
import { MessagesModel } from '../chats/messages/entity/messages.entity';
import { CommentsModel } from '../posts/comments/entity/comments.entity';
import { UserFollowersModel } from '../users/entity/user-followers.entity';

const entities = [
    PostsModel, UsersModel, ImageModel, ChatsModel, MessagesModel, CommentsModel, UserFollowersModel,
];
// --- 엔티티 추가 끝 ---

let sshClient: SSHClient | null = null;
let tunnelServer: net.Server | null = null;

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const isLocalDev = configService.get<string>('NODE_ENV') === 'development';

                // --- DEV_DB_ 접두사가 붙은 환경 변수들로 변경 ---
                const dbHost = configService.get<string>('DEV_DB_HOST');
                const dbPort = parseInt(configService.get<string>('DEV_DB_PORT') || '5432');
                const dbUsername = configService.get<string>('DEV_DB_USERNAME');
                const dbPassword = configService.get<string>('DEV_DB_PASSWORD');
                const dbDatabase = configService.get<string>('DEV_DB_DATABASE');

                const useSsl = configService.get<string>('DEV_DB_USE_SSL') === 'true';
                const sslCaPath = configService.get<string>('DEV_DB_SSL_CA_PATH');
                const rejectUnauthorized = configService.get<string>('DEV_DB_SSL_REJECT_UNAUTHORIZED') === 'true';
                // --- 변경 끝 ---

                const localTunnelPort = dbPort; // 로컬 터널 포트는 DB 포트와 동일하게 유지

                if (isLocalDev) {
                    console.log('[DatabaseModule] Local development environment detected. Setting up SSH tunnel...');

                    const bastionHost = configService.get<string>('BASTION_HOST');
                    const bastionPort = parseInt(configService.get<string>('BASTION_PORT') || '22');
                    const bastionUser = configService.get<string>('BASTION_USER');
                    const bastionPrivateKeyPath = configService.get<string>('BASTION_PRIVATE_KEY_PATH');

                    // 필수 환경 변수 누락 시 즉시 에러 발생
                    if (!bastionHost || !bastionPrivateKeyPath || !bastionUser || !dbHost || !dbUsername || !dbPassword || !dbDatabase) {
                        console.error('[DatabaseModule] Critical DB or Bastion environment variables are missing.');
                        throw new Error('Missing critical environment variables for DB or Bastion.');
                    }

                    const absolutePrivateKeyPath = path.resolve(bastionPrivateKeyPath);

                    // 기존 SSH 연결 및 터널 서버 종료 (HMR 대응)
                    if (sshClient) {
                        sshClient.end();
                        sshClient = null;
                        console.log('[DatabaseModule] Closed existing SSH connection (if any).');
                    }
                    if (tunnelServer && tunnelServer.listening) {
                        tunnelServer.close();
                        tunnelServer = null;
                        console.log('[DatabaseModule] Closed existing local tunnel server (if any).');
                    }

                    sshClient = new SSHClient();

                    return new Promise((resolve, reject) => {
                        sshClient!.on('ready', () => {
                            console.log('[DatabaseModule] SSH connection to Bastion established.');

                            tunnelServer = net.createServer((socket) => {
                                const sourceAddress = socket.remoteAddress || '127.0.0.1';
                                const sourcePort = socket.remotePort || 12345;

                                sshClient!.forwardOut(
                                    sourceAddress,
                                    sourcePort,
                                    dbHost,
                                    dbPort,
                                    (err, stream) => {
                                        if (err) {
                                            console.error('[DatabaseModule] SSH forwardOut failed for new client:', err);
                                            socket.destroy();
                                            return;
                                        }
                                        socket.pipe(stream).pipe(socket);
                                    }
                                );
                            });

                            tunnelServer.listen(localTunnelPort, '127.0.0.1', () => {
                                console.log(`[DatabaseModule] Local TCP tunnel server listening on 127.0.0.1:${localTunnelPort}`);
                                console.log(`[DatabaseModule] SSH tunnel established: 127.0.0.1:${localTunnelPort} -> ${dbHost}:${dbPort}`);

                                const typeOrmOptions: any = {
                                    type: 'postgres',
                                    host: '127.0.0.1', // SSH 터널을 통해 연결하므로 localhost (127.0.0.1) 사용
                                    port: localTunnelPort,
                                    username: dbUsername,
                                    password: dbPassword,
                                    database: dbDatabase,
                                    entities: entities,
                                    synchronize: true,
                                    logging: true,
                                };

                                if (useSsl) {
                                    if (!sslCaPath) {
                                        console.error('[DatabaseModule] DEV_DB_USE_SSL is true, but DEV_DB_SSL_CA_PATH is not set in .env. SSL will not be used.');
                                    } else {
                                        try {
                                            typeOrmOptions.ssl = {
                                                ca: fs.readFileSync(path.resolve(sslCaPath)).toString('utf8'),
                                                // rejectUnauthorized는 환경 변수에서 가져온 값을 직접 사용
                                                rejectUnauthorized: rejectUnauthorized,
                                                // checkServerIdentity 콜백은 rejectUnauthorized가 true일 때만 의미가 있습니다.
                                                // localhost 연결 시 인증서 호스트명 불일치 오류 회피
                                                checkServerIdentity: (host, cert) => {
                                                    if (host === 'localhost' || host === '127.0.0.1') {
                                                        return undefined; // 검증 성공으로 간주하여 오류 방지
                                                    }
                                                    // 그 외의 호스트에 대해서는 Node.js 기본 검증 사용
                                                    return null;
                                                },
                                            };
                                            console.log('[DatabaseModule] TypeORM configured with SSL/TLS with custom checkServerIdentity.');
                                        } catch (fileError) {
                                            console.error(`[DatabaseModule] Failed to read CA certificate file: ${fileError.message}`);
                                            return reject(new Error('Failed to read SSL CA certificate.'));
                                        }
                                    }
                                }

                                resolve(typeOrmOptions);
                            });

                            tunnelServer.on('error', (err: any) => {
                                console.error('[DatabaseModule] Local TCP tunnel server error:', err);
                                if (err.code === 'EADDRINUSE') {
                                    console.error(`[DatabaseModule] Port ${localTunnelPort} is already in use.`);
                                    reject(new Error(`Port ${localTunnelPort} already in use.`));
                                } else {
                                    reject(err);
                                }
                            });

                        }).on('error', (err) => {
                            console.error('[DatabaseModule] SSH connection error:', err);
                            if (sshClient) {
                                sshClient.end();
                                sshClient = null;
                            }
                            reject(err);
                        }).on('end', () => {
                            console.log('[DatabaseModule] SSH connection ended.');
                            if (tunnelServer && tunnelServer.listening) {
                                tunnelServer.close();
                                tunnelServer = null;
                            }
                        }).connect({
                            host: bastionHost,
                            port: bastionPort,
                            username: bastionUser,
                            privateKey: fs.readFileSync(path.resolve(absolutePrivateKeyPath)).toString('utf8'),
                        });
                    });

                } else {
                    // 배포 환경
                    console.log('[DatabaseModule] Production environment detected. Connecting to DB directly.');
                    if (sshClient) {
                        sshClient.end();
                        sshClient = null;
                        console.log('[DatabaseModule] Closed SSH connection for production mode.');
                    }
                    if (tunnelServer && tunnelServer.listening) {
                        tunnelServer.close();
                        tunnelServer = null;
                        console.log('[DatabaseModule] Closed local tunnel server for production mode.');
                    }

                    const typeOrmOptions: any = {
                        type: 'postgres',
                        host: dbHost, // 배포 환경에서는 DEV_DB_HOST (OCI DB의 사설 IP) 사용
                        port: dbPort,
                        username: dbUsername,
                        password: dbPassword,
                        database: dbDatabase,
                        entities: entities,
                        synchronize: false, // 프로덕션에서는 동기화 비활성화
                    };

                    if (useSsl) {
                        if (!sslCaPath) {
                            console.error('[DatabaseModule] DEV_DB_USE_SSL is true, but DEV_DB_SSL_CA_PATH is not set for production. SSL may not work.');
                        } else {
                            try {
                                typeOrmOptions.ssl = {
                                    ca: fs.readFileSync(path.resolve(sslCaPath)).toString('utf8'),
                                    rejectUnauthorized: rejectUnauthorized, // 프로덕션에서도 동일하게 설정 (true 권장)
                                };
                                console.log('[DatabaseModule] TypeORM configured with SSL/TLS for production.');
                            } catch (fileError) {
                                console.error(`[DatabaseModule] Failed to read CA certificate file for production: ${fileError.message}`);
                            }
                        }
                    }
                    return typeOrmOptions;
                }
            },
        }),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule {}