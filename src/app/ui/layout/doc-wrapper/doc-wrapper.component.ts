import { Component, OnInit, Input, ViewChild, ElementRef, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-doc-wrapper',
  templateUrl: './doc-wrapper.component.html',
  styleUrls: ['./doc-wrapper.component.scss'],
  host: {
    '[class.dox-wrapper]': 'true',
  }
})
export class DocWrapperComponent implements OnInit {

  @Input() title = '';
  @Input() newLayout = false;
  sidePanelOpened = false;
  @Input()
  sidePanelTemplate: TemplateRef<any>;
  @Input()
  sidePanelContext: any;

  @ViewChild('sidePanel')
  sidePanel: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  get useNewLayout() {
    return !!this.newLayout;
  }

  togglePanel() {
    this.sidePanelOpened = !this.sidePanelOpened;
  }

  showSidePanel() {
    this.sidePanelOpened = true;
  }

}
