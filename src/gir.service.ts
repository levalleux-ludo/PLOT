import { today, addDays, daysBetween } from './utils';
import { GlobalInfectionRecord } from './global-infection-record';
import * as fs from 'fs';
import * as path from 'path';

// tslint:disable: max-classes-per-file

export interface BloomFilterParams {
  sizeInBits: number;
  nbHashes: number;
}

export const BLOOM_FILTERS_PARAMS = {
  sizeInBits: 32 * 1024,
  nbHashes: 12,
};

export interface GIRInfos {
  minDay: number;
  maxDay: number;
  bloomFilter: BloomFilterParams;
}

class GIRService {
  private girsPerDay: Map<number, GlobalInfectionRecord[]> = new Map();
  private minDay: number = 0;
  private maxDay: number = 0;
  private rootFolder: string = '';

  public getInfos(): GIRInfos {
    return {
      minDay: this.minDay,
      maxDay: this.maxDay,
      bloomFilter: BLOOM_FILTERS_PARAMS,
    };
  }
  public getRecords(day: number): GlobalInfectionRecord[] | undefined {
    return this.girsPerDay.get(day);
  }
  public getARecord(
    day: number,
    index: number
  ): GlobalInfectionRecord | undefined {
    const girs = this.getRecords(day);
    if (girs && girs.length > index) {
      return girs[index];
    }
    return undefined;
  }
  public getNbRecords(day: number): number {
    const girs = this.getRecords(day);
    if (girs) {
      return girs.length;
    }
    return -1;
  }
  public mergeIntoRecord(day: number, data: number[]) {
    const date = new Date(day);
    console.log(
      `merge into record day=${new Date(day).toDateString()} minDay=${new Date(
        this.minDay
      ).toDateString()} maxDay=${new Date(this.maxDay).toDateString()}`
    );
    this.minDay = this.minDay === 0 ? day : Math.min(this.minDay, day);
    this.maxDay = this.maxDay === 0 ? day : Math.max(this.maxDay, day);
    console.log(
      `after: minDay=${new Date(this.minDay).toDateString()} maxDay=${new Date(
        this.maxDay
      ).toDateString()}`
    );
    let girs = this.getRecords(day);
    if (!girs) {
      girs = [];
      this.girsPerDay.set(day, girs);
    }
    if (girs.length === 0) {
      girs.push(
        new GlobalInfectionRecord(
          this.getInfos().bloomFilter.sizeInBits,
          this.getInfos().bloomFilter.nbHashes
        )
      );
    }
    let gir = girs[girs.length - 1];
    if (gir.isFull()) {
      gir = new GlobalInfectionRecord(
        this.getInfos().bloomFilter.sizeInBits,
        this.getInfos().bloomFilter.nbHashes
      );
      girs.push(gir);
    }
    gir.merge(data);
    this.storeDay(date, this.rootFolder);
  }
  public store(rootFolder: string) {
    const days = daysBetween(new Date(this.minDay), new Date(this.maxDay));
    for (const day of days) {
      this.storeDay(day, rootFolder);
    }
  }
  public storeDay(day: Date, rootFolder: string) {
    this.rootFolder = rootFolder;
    if (!fs.existsSync(this.rootFolder)) {
      fs.mkdirSync(this.rootFolder);
    }
    const girs = this.girsPerDay.get(day.valueOf());
    if (!girs) {
      console.error(`No record found for day ${day.toDateString()}`);
      return;
    }
    this.saveFilesForDay(day, girs);
  }
  public load(minDay: number, maxDay: number, rootFolder: string) {
    this.rootFolder = rootFolder;
    this.minDay = minDay;
    this.maxDay = maxDay;
    this.girsPerDay = new Map();
    const days = daysBetween(new Date(minDay), new Date(maxDay));
    for (const day of days) {
      const girs = this.loadFilesForDay(day);
      console.log(`Found ${girs.length} records for day ${day.toDateString()}`);
      this.girsPerDay.set(day.valueOf(), girs);
    }
  }

  public getFolderForDay(day: Date): string {
    return path.join(
      this.rootFolder,
      `${day.getUTCFullYear()}-${day.getUTCMonth() + 1}-${day.getUTCDate()}`
    );
  }

  private saveFilesForDay(day: Date, girs: GlobalInfectionRecord[]) {
    const folder = this.getFolderForDay(day);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
    for (let i = 0; i < girs.length; i++) {
      const filename = this.getFilenameAtIndex(folder, i);
      const gir = girs[i];
      gir.save(filename);
    }
  }

  private loadFilesForDay(day: Date): GlobalInfectionRecord[] {
    const girs = [];
    const folder = this.getFolderForDay(day);
    if (!fs.existsSync(folder)) {
      console.error(`Folder ${folder} does not exist`);
      return [];
    }
    const files = fs.readdirSync(folder);
    console.log('look files in folder', folder);
    for (let i = 0; i < files.length; i++) {
      const filename = this.getFilenameAtIndex(folder, i);
      if (!fs.existsSync(filename)) {
        console.error(`File ${filename} does not exist`);
        break;
      }
      girs.push(
        GlobalInfectionRecord.FromFile(filename, BLOOM_FILTERS_PARAMS.nbHashes)
      );
    }
    return girs;
  }

  private getFilenameAtIndex(folder: string, index: number) {
    return path.join(folder, `${index}.dat`);
  }
}

const girService = new GIRService();

export default girService;
