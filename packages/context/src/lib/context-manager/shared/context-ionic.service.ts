import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ConfigService,
  RouteService,
  MessageService,
  LanguageService
} from '@igo2/core';

import { AuthService } from '@igo2/auth';
import { Platform } from '@ionic/angular';
import { File } from '@ionic-native/file/ngx';
import { ContextService } from './context.service';
import { ContextImportService } from '../../context-import-export/shared/context-import.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ContextsList, DetailedContext } from './context.interface';

@Injectable({
  providedIn: 'root'
})
export class ContextIonicService extends ContextService {
  public enhancedContexts$ = new BehaviorSubject<ContextsList>({ ours: [] });
  public defaultUri: string;
  private directory;

  constructor(
    http: HttpClient,
    authService: AuthService,
    languageService: LanguageService,
    messageService: MessageService,
    config: ConfigService,
    routeService: RouteService,
    private contextImportService: ContextImportService,
    private platform: Platform,
    private file: File,
    @Optional() route: RouteService
  ) {
    super(http, authService, languageService, messageService, config, routeService);
    this.options = Object.assign(
      {
        basePath: 'contexts',
        contextListFile: '_contexts.json',
        defaultContextUri: '_default'
      },
      this.config.getConfig('context')
    );

    this.baseUrl = this.options.url;

    this.readParamsFromRoute();

    this.platform.ready().then(() => {
      if (this.platform.is('cordova')) {
        if (this.platform.is('android')) {
          this.directory = this.config.getConfig('ExportContextDirectory');
          this.file.writeFile(this.directory, 'default_context.txt', '', { replace: false });
          this.defaultContextSetting.next(true);
          this.loadContexts();

          const reader = this.getMobileDefaultContextByUri();
          reader.then(text => {
              this.defaultUri = text;
          });

          setTimeout(() => {
          if (this.defaultUri !== undefined) {
            if (this.defaultUri.length !== 0) {
              this.file.resolveDirectoryUrl(this.directory).then(dir => {
                this.file.getFile(dir, `${this.defaultUri}.json`, { create: false }).then(contextFileEntry => {
                  contextFileEntry.file(contextFile => {
                    this.contextImportService.import(contextFile).subscribe(context => {
                      this.addIonicDefaultContext(context, this.defaultUri);
                    });
                  });
                }).catch((error) => {
                  this.contexts$.value.ours.forEach(disponibleContext => {
                    if (this.defaultUri === disponibleContext.uri) {
                      this.loadContext(disponibleContext.uri);
                    }
                  });
                });
              });
            } else {
              this.defaultUri = "_default"
              this.authService.authenticate$.subscribe(authenticated => {
              const contexts$$ = this.contexts$.subscribe(contexts => {
                if (contexts$$) {
                  contexts$$.unsubscribe();
                  this.handleContextsChange(contexts);
                }
              });
              this.loadContexts();
              });
            }
          } else {
            this.defaultUri = "_default"
            this.authService.authenticate$.subscribe(authenticated => {
            const contexts$$ = this.contexts$.subscribe(contexts => {
              if (contexts$$) {
                contexts$$.unsubscribe();
                this.handleContextsChange(contexts);
              }
            });
            this.loadContexts();
            });
          }
          }, 3000);
          }
      } else {
        this.defaultUri = "_default"
        this.authService.authenticate$.subscribe(authenticated => {
          const contexts$$ = this.contexts$.subscribe(contexts => {
            if (contexts$$) {
              contexts$$.unsubscribe();
              this.handleContextsChange(contexts);
            }
          });
          this.loadContexts();
        });
      }
    });
  }

  private getMobileDefaultContextByUri(): Promise<string> {
    if (this.file.checkFile(this.directory, 'default_context.txt')) {
      return this.file.readAsText(this.directory, 'default_context.txt');
    }
  }

  private addIonicDefaultContext(context: DetailedContext, contextTitle: string) {
    context.title = contextTitle;
    this.enhancedContexts$.value.ours = [];

    Object.keys(this.contexts$.value.ours).forEach(
        key =>
          (this.enhancedContexts$.value.ours.push(this.contexts$.value.ours[key]))
    );
    this.enhancedContexts$.value.ours.push(context);
    this.enhancedContexts$.next(this.enhancedContexts$.value);
    const rawContext = JSON.stringify(context);
    this.importedContext.push(context);
    this.loadContext(context.uri);
  }
}
