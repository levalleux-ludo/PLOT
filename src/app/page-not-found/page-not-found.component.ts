import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  template: `
  <div class="div">
    <img src="../assets/PLOT.png" class="img">
    <p class="fhf">404</p>
    <p class="pnf">Page Not Found</p>
  </div>
  `,
  styles: [
    `.div {
      position: absolute;
      height: 100%;
      width: 100%;
      text-align: center;
    }`,
    `.fhf {
      font-weight: 400;
      font-size: 6em;
      line-height: 1em;
    }`,
    `.pnf {
      font-weight: 400;
      font-size: 2em;
      line-height: 1em;
    }`,
    `.img {
      height: 30%;
      opacity: 0.5;
    }`
  ]
})
export class PageNotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
