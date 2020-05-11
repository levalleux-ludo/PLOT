import { Injectable } from '@angular/core';
import { Individual, Simulation, TimeSlot } from './simulation.service';
import { BloomFilter } from '../_helpers/BloomFilter';
// import { BloomFilter } from 'bloomfilter';



export class BloomedLocationRecord {
  indivBloomPerDay: Map<number, BloomFilter> = new Map();

  public static md_convert(slotInDay: number, x: number, y: number): number {
    if (slotInDay >= 2 ** 8) {
      throw new Error('Overflow on slotInDay value' + slotInDay);
    }
    if (x >= 2 ** 12) {
      throw new Error('Overflow on x value' + x);
    }
    if (y >= 2 ** 12) {
      throw new Error('Overflow on y value' + y);
    }
    // tslint:disable-next-line: no-bitwise
    return (x << 20) + (y << 8) + slotInDay;
  }

  public static md_parse(n: number): {slotInDay: number, x: number, y: number} {
    // tslint:disable-next-line: no-bitwise
    const slotInDay = n & 0xFF;
    // tslint:disable-next-line: no-bitwise
    const y = (n & 0xFFF00) >> 8;
    // tslint:disable-next-line: no-bitwise
    const x = (n & 0xFFF00000) >> 20;
    return {slotInDay, x, y};
  }

  constructor(bloomSize: number, individual: Individual, simulation: Simulation, incubationPeriod: number) {
    this.indivBloomPerDay = new Map();
    for (let timeSlot of simulation.timeSlots) {
      const locations = [];
      let bloom = this.indivBloomPerDay.get(timeSlot.day);
      if (!bloom) {
        bloom = new BloomFilter(32 * bloomSize, 16);
        this.indivBloomPerDay.set(timeSlot.day, bloom);
      }
      const infectedDay = Math.floor(individual.infectedTime / simulation.nbTimeSlotsPerDay);
      if (timeSlot.day >= infectedDay - incubationPeriod) {
        const location = individual.locations[timeSlot.time];
        const md_val = BloomedLocationRecord.md_convert(timeSlot.slotInDay, location.x, location.y);
        bloom.add(md_val);
      }
    }
  }
}

export class BloomedGlobalRecord {
  globalBloomPerDay: Map<number, BloomFilter> = new Map();

  constructor(bloomSize: number, simulation: Simulation) {
    for (let day of simulation.allDays) {
      this.globalBloomPerDay.set(day, new BloomFilter(32 * bloomSize, 16));
    }
  }

  mergeIndividualRecord(individualRecord: BloomedLocationRecord) {
    for (const day of this.globalBloomPerDay.keys()) {
      const globalBloom = this.globalBloomPerDay.get(day);
      const indivBloom = individualRecord.indivBloomPerDay.get(day);
      globalBloom.merge(indivBloom.buckets);
    }
  }

  testIndividualRecordAtTime(individual: Individual, timeSlot: TimeSlot, nbTimeSlotsPerDay: number) {
    let nbContacts = 0;
    for (let time = 0; time <= timeSlot.time; time++) {
      const day = Math.floor(time / nbTimeSlotsPerDay);
      const slotInDay = time - day * nbTimeSlotsPerDay;
      const bloom = this.globalBloomPerDay.get(day);
      const indivLocation = individual.locations[time];
      const md_value = BloomedLocationRecord.md_convert(slotInDay, indivLocation.x, indivLocation.y);
      if (bloom.test(md_value)) {
        // console.log("contact at time", time, 'location', indivLocation);
        nbContacts++;
      }
    }
    return nbContacts;
  }
}

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {

  constructor() { }


}
