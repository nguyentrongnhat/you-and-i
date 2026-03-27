import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { MESSAGE_TYPE } from "../core/enums";

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    constructor(protected messageService: MessageService) {}

    public showToast(messageType: MESSAGE_TYPE, summary: string, detail: string) {
        this.messageService.add({ severity: messageType, summary, detail });
    }
}