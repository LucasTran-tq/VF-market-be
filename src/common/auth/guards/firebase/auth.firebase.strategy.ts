/* eslint-disable @typescript-eslint/no-unused-vars */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { ConfigService } from '@nestjs/config';
import * as firebaseConfig from './firebase.config.json';
import * as firebase from 'firebase-admin';
// import { UserService } from '../user.service';
import { JwtService } from '@nestjs/jwt';
import { HelperEncryptionService } from 'src/common/helper/services/helper.encryption.service';

const firebase_params = {
    type: firebaseConfig.type,
    projectId: firebaseConfig.project_id,
    privateKeyId: firebaseConfig.private_key_id,
    privateKey: firebaseConfig.private_key,
    clientEmail: firebaseConfig.client_email,
    clientId: firebaseConfig.client_id,
    authUri: firebaseConfig.auth_uri,
    tokenUri: firebaseConfig.token_uri,
    authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
    clientC509CertUrl: firebaseConfig.client_x509_cert_url,
};

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
    private defaultApp: any;

    constructor(
        private readonly helperEncryptionService: HelperEncryptionService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
        this.defaultApp = firebase.initializeApp({
            credential: firebase.credential.cert(firebase_params),
            // databaseURL: '',
        });
    }

    async validate(token: string) {
        console.log('token:', token);

        // const firebaseUser: any = await this.defaultApp
        //   .auth()
        //   .verifyIdToken(token, true)
        //   .catch((err) => {
        //     console.log(err);

        //     throw new UnauthorizedException(err.message);
        //   });

        const decodeToken: any = this.helperEncryptionService.jwtDecrypt(token);
        console.log('decodeToken:', decodeToken);

        const firebaseUser: any = await this.defaultApp
            .auth()
            .getUser(decodeToken.user_id);
        console.log('firebaseUser:', firebaseUser);

        if (!firebaseUser) {
            throw new UnauthorizedException();
        }

        if (decodeToken.user_id != firebaseUser.uid) {
            throw new UnauthorizedException();
        }

        return firebaseUser;
    }
}
