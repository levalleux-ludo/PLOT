import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {ScrollingModule, ScrollDispatcher} from '@angular/cdk/scrolling';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UiModule } from './ui/ui.module';
import { NgxPageScrollModule } from 'ngx-page-scroll';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UiRoutingModule } from './ui/ui-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    UiRoutingModule, // must be put before main RouterModule
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    UiModule,
    FlexLayoutModule,
    NgxPageScrollModule,
    ScrollingModule
  ],
  providers: [ScrollDispatcher],
  bootstrap: [AppComponent]
})
export class AppModule { }
