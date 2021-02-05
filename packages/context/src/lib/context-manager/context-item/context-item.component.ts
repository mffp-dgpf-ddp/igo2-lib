import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { StorageService } from '@igo2/core';
import { AuthService } from '@igo2/auth';
import { TypePermission } from '../shared/context.enum';
import { DetailedContext } from '../shared/context.interface';
import { MessageService, LanguageService, ConfigService } from '@igo2/core';
import { ContextService } from '../shared/context.service';
import { File } from '@ionic-native/file/ngx';
import { ToolService } from '@igo2/common';

@Component({
  selector: 'igo-context-item',
  templateUrl: './context-item.component.html',
  styleUrls: ['./context-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContextItemComponent {
  public typePermission = TypePermission;
  public color = 'primary';
  public collapsed = true;
  public defaultContextSetting: boolean;
  public defaultUri: string;
  private directory: string;

  @Input()
  get context(): DetailedContext {
    return this._context;
  }
  set context(value: DetailedContext) {
    this._context = value;
  }
  private _context: DetailedContext;

  @Input()
  get default(): boolean {
    return this._default;
  }
  set default(value: boolean) {
    this._default = value;
  }
  private _default = false;

  @Input() selected: boolean;

  @Output() edit = new EventEmitter<DetailedContext>();
  @Output() delete = new EventEmitter<DetailedContext>();
  @Output() save = new EventEmitter<DetailedContext>();
  @Output() clone = new EventEmitter<DetailedContext>();
  @Output() hide = new EventEmitter<DetailedContext>();
  @Output() show = new EventEmitter<DetailedContext>();
  @Output() favorite = new EventEmitter<DetailedContext>();
  @Output() managePermissions = new EventEmitter<DetailedContext>();
  @Output() manageTools = new EventEmitter<DetailedContext>();

  get hidden(): boolean {
    return this.context.hidden;
  }

  get canShare(): boolean {
    return this.storageService.get('canShare') === true;
  }

  constructor(
    public auth: AuthService,
    private storageService: StorageService,
    private messageService: MessageService,
    private languageService: LanguageService,
    private config: ConfigService,
    private file: File,
    private contextService: ContextService,
    private toolService: ToolService 
    ) {
      this.defaultUri = this.contextService.defaultUri;
      this.directory = this.config.getConfig('ExportContextDirectory');
      this.contextService.defaultContextSetting.subscribe(res => this.defaultContextSetting = res);
    }

  favoriteClick(context) {
    if (this.auth.authenticated) {
      this.favorite.emit(context);
    }
  }

  defineDefaultContext(contextTitle: string, contextUri: string) {
    this.toolService.toolbox.activateTool('mapDetails');
    this.file.writeFile(this.directory, 'default_context.txt', contextUri, { replace: true });
    this.handleDefaultContextChange(contextTitle, this.messageService, this.languageService);

    this.contextService.defaultUri = contextUri;
    this.defaultUri = this.contextService.defaultUri;
  }

  private handleDefaultContextChange(
    contextTitle: string,
    messageService: MessageService,
    languageService: LanguageService
    ) {
    const translate = languageService.translate;
    const messageTitle = translate.instant('igo.context.contextManager.defaultContextChange.success.title');
    const message = translate.instant('igo.context.contextManager.defaultContextChange.success.text', {
        value: contextTitle
    });
    messageService.success(message, messageTitle);
  }
}
