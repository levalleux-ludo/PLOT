import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  template: `
    <div class="content-container">
    <div class="content-area">
      <ng-content></ng-content>
    </div>
    <app-sidebar class="sidenav"></app-sidebar>
  </div>
  `,
  styles: []
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
