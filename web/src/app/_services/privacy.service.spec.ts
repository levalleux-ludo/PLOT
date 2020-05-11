import { TestBed } from '@angular/core/testing';

import { PrivacyService, BloomedGlobalRecord, BloomedLocationRecord } from './privacy.service';
import { Simulation, Individual, GlobalInfectionRecord, TimeSlot, Location } from './simulation.service';
import { sim1Data, setInfected, setLocation } from './simulation.service.spec';

const bloomSize = 256;

function computeFalsePositive(
  simulation: Simulation,
  bloomedGlobalRecord: BloomedGlobalRecord,
  globalInfectionRecord: GlobalInfectionRecord
  ): Map<number, number[]> {
  const falsePositivePerDay: Map<number, number[]> = new Map();

  for (const day of simulation.allDays) {
    const bloomFilter = bloomedGlobalRecord.globalBloomPerDay.get(day);
    const falsePositive: number[] = [];
    falsePositivePerDay.set(day, falsePositive);
    let nbFalsePositive = 0;
    let nbInfected = 0;
    for (const slot of simulation.allSlotsInDay) {
      const time = day * simulation.nbTimeSlotsPerDay + slot;
      for (const x of simulation.allX) {
        for (const y of simulation.allY) {
          const infectedWithoutPrivacy = globalInfectionRecord.isInfected(time, x, y);
          const md_val = BloomedLocationRecord.md_convert(slot, x, y);
          const infectedWithPrivacy = bloomFilter.test(md_val);
          if (infectedWithoutPrivacy) {
            nbInfected++;
            if (!infectedWithPrivacy) {
              console.error('Found a location infectedWithoutPrivacy but not infectedWithPrivacy', day, slot, x, y);
              expect(false).toBeTrue();
            }
          } else if (infectedWithoutPrivacy !== infectedWithPrivacy) {
            nbFalsePositive++;
            falsePositive.push(md_val);
          }
        }
      }
    }
    if (nbFalsePositive > 0) {
      const ratio = nbFalsePositive/(simulation.nbTimeSlotsPerDay * simulation.areaSideSize * simulation.areaSideSize);
      expect(ratio).toBeLessThan(0.0001);
      console.info("day", day, "nbFalsePositive", nbFalsePositive, "ratio", ratio);
    }
  }
  return falsePositivePerDay;
}

function compareGlobalRecords(
  globalRecordWithPrivacy: BloomedGlobalRecord,
  globalRecordWithoutPrivacy: GlobalInfectionRecord,
  simulation: Simulation,
  incubationPeriod: number,
  falsePositivePerDay: Map<number, number[]>
) {
  for (const individual of simulation.individuals) {
    // const individual = simulation1.individuals[1];
    for (const timeSlot of simulation.timeSlots) {
      let nbFalsePositives = 0;
      let nbContactsWithoutPrivacy = 0;
      for (let time = 0; time <= timeSlot.time; time++) {
        const day = Math.floor(time / sim1Data.nbTimeSlotsPerDay);
        const slotInDay = time - day * sim1Data.nbTimeSlotsPerDay;
        nbContactsWithoutPrivacy += globalRecordWithoutPrivacy.computeNbInfectedContacts(individual, {time, day, slotInDay});

        const location = individual.locations[time];
        const md_val = BloomedLocationRecord.md_convert(slotInDay, location.x, location.y);
        if (falsePositivePerDay.get(day).includes(md_val)) {
          nbFalsePositives++;
        }
      }
      const nbContactsWithPrivacy = globalRecordWithPrivacy.testIndividualRecordAtTime(
        individual,
        timeSlot,
        simulation.nbTimeSlotsPerDay
      );
      if (nbContactsWithPrivacy !== nbContactsWithoutPrivacy) {
        console.info(
          'individual:', individual.name,
          'timeSlot', timeSlot,
          'nbContactsWithPrivacy', nbContactsWithPrivacy,
           'nbFalsePositives', nbFalsePositives,
           'nbContactsWithoutPrivacy', nbContactsWithoutPrivacy);
        expect(nbContactsWithPrivacy - nbFalsePositives).toEqual(nbContactsWithoutPrivacy);
      }
    }
  }
}

describe('PrivacyService', () => {
  let service: PrivacyService;
  let simulation1: Simulation;
  let bloomedGlobalRecord1: BloomedGlobalRecord;
  let bloomedRecordPerIndividual: Map<string, BloomedLocationRecord>;
  let globalInfectionRecord1: GlobalInfectionRecord;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrivacyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('create a simulation', () => {
    simulation1 = new Simulation(
      sim1Data.nbTimeSlotsPerDay,
      sim1Data.durationInDays,
      sim1Data.areaSideSize,
      sim1Data.peopleNames
    );
    // for (let i = 0; i < simulation1.individuals.length; i++) {
    //   setLocation(simulation1, i);
    // }
    expect(simulation1).toBeTruthy();
  });
  it('create a BloomedGlobalRecord', () => {
    bloomedGlobalRecord1 = new BloomedGlobalRecord(
      bloomSize,
      simulation1
    );
    expect(bloomedGlobalRecord1).toBeTruthy();
  });
  it('create a BloomedLocationRecord for each individual', () => {
    bloomedRecordPerIndividual = new Map();
    for (const individual of simulation1.individuals) {
      const bloomedLocationRecord = new BloomedLocationRecord(
        bloomSize,
        individual,
        simulation1,
        sim1Data.incubationPeriod
      );
      expect(bloomedLocationRecord).toBeTruthy();
      bloomedRecordPerIndividual.set(individual.name, bloomedLocationRecord);
    }
  });
  it('expect no infected zone', () => {
    for (const day of simulation1.allDays) {
      const bloomFilter = bloomedGlobalRecord1.globalBloomPerDay.get(day);
      for (const slot of simulation1.allSlotsInDay) {
        for (const x of simulation1.allX) {
          for (const y of simulation1.allY) {
            expect(
              bloomFilter.test(BloomedLocationRecord.md_convert(slot, x, y))
            ).toBeFalse();
          }
        }
      }
    }
  });
  it('expect no contact with infected people', () => {
    for (const individual of simulation1.individuals) {
      for (const timeSlot of simulation1.timeSlots) {
        expect(
          bloomedGlobalRecord1.testIndividualRecordAtTime(
            individual,
            timeSlot,
            simulation1.nbTimeSlotsPerDay
          )
        ).toEqual(0);
      }
    }
  });
  it('first individual infected', () => {
    const infectionIndex = 0;
    const individual = setInfected(sim1Data.infectionTimes[infectionIndex].index, sim1Data.infectionTimes[infectionIndex].time, simulation1)
    bloomedGlobalRecord1.mergeIndividualRecord(bloomedRecordPerIndividual.get(individual.name));

    // create a global infection record to check we have the same results with and without privacy
    const globalRecordWithoutPrivacy = new GlobalInfectionRecord(simulation1, sim1Data.incubationPeriod);
    const falsePositivePerDay = computeFalsePositive(simulation1, bloomedGlobalRecord1, globalRecordWithoutPrivacy);

    compareGlobalRecords(bloomedGlobalRecord1, globalRecordWithoutPrivacy, simulation1, sim1Data.incubationPeriod, falsePositivePerDay);
  });
  it('second individual infected', () => {
    const infectionIndex = 1;
    const individual = setInfected(sim1Data.infectionTimes[infectionIndex].index, sim1Data.infectionTimes[infectionIndex].time, simulation1)
    bloomedGlobalRecord1.mergeIndividualRecord(bloomedRecordPerIndividual.get(individual.name));

    // create a global infection record to check we have the same results with and without privacy
    const globalRecordWithoutPrivacy = new GlobalInfectionRecord(simulation1, sim1Data.incubationPeriod);
    const falsePositivePerDay = computeFalsePositive(simulation1, bloomedGlobalRecord1, globalRecordWithoutPrivacy);

    compareGlobalRecords(bloomedGlobalRecord1, globalRecordWithoutPrivacy, simulation1, sim1Data.incubationPeriod, falsePositivePerDay);
  });
  it('third individual infected', () => {
    const infectionIndex = 2;
    const individual = setInfected(sim1Data.infectionTimes[infectionIndex].index, sim1Data.infectionTimes[infectionIndex].time, simulation1)
    bloomedGlobalRecord1.mergeIndividualRecord(bloomedRecordPerIndividual.get(individual.name));

    // create a global infection record to check we have the same results with and without privacy
    const globalRecordWithoutPrivacy = new GlobalInfectionRecord(simulation1, sim1Data.incubationPeriod);
    const falsePositivePerDay = computeFalsePositive(simulation1, bloomedGlobalRecord1, globalRecordWithoutPrivacy);

    compareGlobalRecords(bloomedGlobalRecord1, globalRecordWithoutPrivacy, simulation1, sim1Data.incubationPeriod, falsePositivePerDay);
  });
  it('fourth individual infected', () => {
    const infectionIndex = 3;
    const individual = setInfected(sim1Data.infectionTimes[infectionIndex].index, sim1Data.infectionTimes[infectionIndex].time, simulation1)
    bloomedGlobalRecord1.mergeIndividualRecord(bloomedRecordPerIndividual.get(individual.name));

    // create a global infection record to check we have the same results with and without privacy
    const globalRecordWithoutPrivacy = new GlobalInfectionRecord(simulation1, sim1Data.incubationPeriod);
    const falsePositivePerDay = computeFalsePositive(simulation1, bloomedGlobalRecord1, globalRecordWithoutPrivacy);

    compareGlobalRecords(bloomedGlobalRecord1, globalRecordWithoutPrivacy, simulation1, sim1Data.incubationPeriod, falsePositivePerDay);
  });
});
