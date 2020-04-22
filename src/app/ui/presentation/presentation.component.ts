import { Component, OnInit, AfterViewChecked, Inject, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { ViewportScroller, DOCUMENT } from '@angular/common';
import { PageScrollService, PageScrollInstance } from 'ngx-page-scroll-core';
import { DocWrapperComponent } from '../layout/doc-wrapper/doc-wrapper.component';
import {ScrollDispatcher} from '@angular/cdk/scrolling';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss'],
  host: {
    '[class.dox-content-panel]': 'true',
    '[class.content-area]': 'true'
  }
})
export class PresentationComponent implements OnInit, AfterViewChecked {

  constructor(
    private viewportScroller: ViewportScroller,
    @Inject(DOCUMENT) private document: any,
    private pageScrollService: PageScrollService,
    private scrollDispatcher: ScrollDispatcher,
    private cd: ChangeDetectorRef,
    private zone: NgZone
    ) { }

  @ViewChild('docWrapper')
  docWrapper: DocWrapperComponent;

  backOnTopBtnVisible = false;
  backToTopBtnScrollThreshold = 400;

  // get scrollPosition(): number {
  //   if (this.docWrapper) {
  //     if (this.docWrapper.scrollableArea) {
  //       console.log("scrollableElement", this.docWrapper.scrollableArea.nativeElement);
  //       let el = this.docWrapper.scrollableArea.nativeElement;
  //       console.log(el.scrollLeft, el.scrollTop);

  //       return 0;
  //     }
  //   }
  //   return -1;
  // }


  ngOnInit() {
  }

  ngAfterViewChecked(): void {
    this.scrollDispatcher.scrolled()
    .subscribe(event => {
      if (this.docWrapper && this.docWrapper.scrollableArea) {
         const isVisible = this.docWrapper.scrollableArea.nativeElement.scrollTop >= this.backToTopBtnScrollThreshold;
         if (isVisible !== this.backOnTopBtnVisible) {
          this.zone.run(() => this.backOnTopBtnVisible = isVisible)
          console.log("backOnTopBtnVisible", this.backOnTopBtnVisible);
         }
      }
    });
  }

  public onClick(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }

  public scrollTo(elementId: string): void {
    const pageScrollInstance: PageScrollInstance = this.pageScrollService.create({
      document: this.document,
      scrollTarget: elementId,
      scrollViews: [this.docWrapper.scrollableArea.nativeElement],
      scrollOffset: 110,
      duration: 500
    });
    console.log("scrollTo", elementId);
    this.pageScrollService.start(pageScrollInstance);

  }

}
