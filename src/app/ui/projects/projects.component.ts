import { Component, OnInit, ViewChild } from '@angular/core';
import { DocWrapperComponent } from '../layout/doc-wrapper/doc-wrapper.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styles: [],
  host: {
    '[class.dox-content-panel]': 'true',
    '[class.content-area]': 'true'
  }
})
export class ProjectsComponent implements OnInit {

  @ViewChild('docWrapper')
  docWrapper: DocWrapperComponent;

  rootDirectory: any[] = [
    {
        name: "Applications",
        icon: "folder",
        expanded: true,
        files: [
            {
                icon: "calendar",
                name: "Calendar",
                active: false
            },
            {
                icon: "line-chart",
                name: "Charts",
                active: false
            },
            {
                icon: "dashboard",
                name: "Dashboard",
                active: false
            },
            {
                icon: "map",
                name: "Maps",
                active: false
            }
        ]
    },
    {
        name: "Files",
        icon: "folder",
        expanded: true,
        files: [
            {
                icon: "file",
                name: "Cover Letter.doc",
                active: false
            }
        ]
    },
    {
        name: "Images with a very long title to activate overflow-x",
        icon: "folder",
        expanded: true,
        files: [
          {
            icon: "image",
            name: "Screenshot.png with a very long title to activate overflow-x",
            active: false
        },
        {
          icon: "image",
          name: "Screenshot.png",
          active: false
      },
      {
        icon: "image",
        name: "Screenshot.png",
        active: false
    },
    {
      icon: "image",
      name: "Screenshot.png",
      active: false
  },
  {
    icon: "image",
    name: "Screenshot.png",
    active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
},
{
  icon: "image",
  name: "Screenshot.png",
  active: false
}

        ]
    }
];


  constructor() { }

  ngOnInit(): void {
  }

  _activeFile = undefined;

  selectFile(directory: any, file: any) {
    this._activeFile = file;
    // alert('open file \'' + directory.name + '/' + file.name + '\'');
    this.docWrapper.showSidePanel();

  }

  isActive(file) {
    return file === this._activeFile;
  }

  getSidePanelContext() {
    return {fileName: this._activeFile ? this._activeFile.name : ''};
  }

}
