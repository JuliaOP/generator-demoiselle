import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '@demoiselle/security';
import { NotificationService } from '../../core/notification.service';
import { ServiceWorkerService } from '../../core/sw.service';
import { CredentialManagementService } from '../credentials.service';
import { WebSocketService } from '../../core/websocket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  user: any = {
    username: 'admin@demoiselle.org',
    password: '123456'
  };
  supportAutoLogin = false;
  showQuickAuth = true;

  protected fingerprint;

  constructor(protected authService: AuthService,
    protected router: Router,
    protected notificationService: NotificationService,
    protected serviceWorkerService: ServiceWorkerService,
    protected credentialManagementService: CredentialManagementService,
    protected webSocketService: WebSocketService
  ) { }

  ngOnInit() {
    console.debug('[LoginComponent] initialized.');

    this.credentialManagementService.isCredentialsAvailable()
      .then(result => {
        if (result === true) {
          this.supportAutoLogin = true;
          this.showQuickAuth = true;
        }
      })
      .catch(err => {
        this.supportAutoLogin = false;
        this.showQuickAuth = false;
      });
  }

  login() {
    const payload = {
      username: this.user.username,
      password: this.user.password
    };

    this.loginWithPayload(payload);
  }

  autoLogin() {
    this.credentialManagementService.autoSignin()
      .then(credentials => {
        const payload = {
          username: credentials.id,
          password: credentials.password
        };
        this.loginWithPayload(payload);
      })
      .catch(err => {
        console.warn(err);
        this.showQuickAuth = false;
      });
  }

  loginWithPayload(payload) {
    const subs = this.authService.login(payload)
      .subscribe(result => {
        console.debug('Login realizado com sucesso!', result);
        this.notificationService.success('Login realizado com sucesso!');
        this._sendLoginWebSocket();
        this._getFingerprint().then((result) => {
          this._sendFingerprint();
        });
        this.credentialManagementService.store(payload)
      },
      error => this._showErrors(error),
      () => {
        subs.unsubscribe();
      });
  }

  private _getFingerprint() {
    return this.serviceWorkerService.getFingerprint()
      .then(fingerprint => {
        console.debug({ fingerprint });
        this.fingerprint = fingerprint;
      })
      .catch(error => console.error('Erro ao recuperar fingerprint:', error));
  }

  private _showErrors(error) {
    if (error.status === 401 || error.status === 406) {
      let errors = error.error;
      for (let err of errors) {
        this.notificationService.error(err.error);
      }
      this.user.password = '';
    }

  }

  private _sendFingerprint() {
    if (this.fingerprint) {
      this.serviceWorkerService.sendFingerprint(this.fingerprint)
        .subscribe(() => {
          console.debug('Fingerprint enviado.');
        }, (error) => console.error('Erro ao enviar fingerprint:', error));
    } else {
      console.error('Fingerprint não existente.');
    }
  }

  private _sendLoginWebSocket() {
    this.webSocketService.connect()
      .then((wsConnection) => {
        // console.info('[WS] conectado.');
        wsConnection.send({
          event: 'login',
          data: 'b83810af-7ba9-4aea-8bb6-f4992a72c5fb'
        });
      })
      .catch(error => console.error('Erro ao conectar com WebSocket.', error));
  }
}
