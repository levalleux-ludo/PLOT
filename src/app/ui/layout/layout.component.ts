import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  template: `
    <clr-main-container>
    <app-header></app-header>
    <app-main>
      <ng-content></ng-content>
    </app-main>
  </clr-main-container>
  `,
  styles: []
})
export class LayoutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
