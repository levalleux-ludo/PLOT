import { Component, OnInit, Input, ViewChild, ElementRef, TemplateRef, AfterViewChecked } from '@angular/core';
// import { ScrollDispatcher } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-doc-wrapper',
  templateUrl: './doc-wrapper.component.html',
  styleUrls: ['./doc-wrapper.component.scss'],
  host: {
    '[class.dox-wrapper]': 'true',
  }
})
export class DocWrapperComponent implements OnInit, AfterViewChecked {

  @Input() title = '';
  @Input() newLayout = false;
  sidePanelOpened = false;
  @Input()
  sidePanelTemplate: TemplateRef<any>;
  @Input()
  sidePanelContext: any;
  @Input()
  tocTemplate: TemplateRef<any>;
  @Input()
  tocContext: any;

  @ViewChild('sidePanel')
  sidePanel: ElementRef;

  @ViewChild('scrollableArea')
  _scrollableArea: ElementRef;

  constructor(
    // private scrollDispatcher: ScrollDispatcher
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewChecked(): void {
    // this.scrollDispatcher.scrolled()
    // .subscribe(event => {
    //   console.log('scrolled');
    // });
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

  public get scrollableArea(): ElementRef {
    return this._scrollableArea;
  }

}
