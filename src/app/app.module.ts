import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {CharLimitterDirective} from "./directives/char-limitter.directive";

@NgModule({
  declarations: [
    AppComponent,
    CharLimitterDirective,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
