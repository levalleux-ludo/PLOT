import { TestBed } from '@angular/core/testing';

import { SimulationService, Simulation, Individual, GlobalInfectionRecord } from './simulation.service';


export const sim1Data = {
    nbTimeSlotsPerDay: 80,
    durationInDays: 15,
    areaSideSize: 80,
    peopleNames: ['Alice', 'Bob', 'Charlie', 'Denise', 'Edward', 'Fred', 'Gerard', 'Homer', 'Isidor', 'Juliana', 'Kelly', 'Ludo', 'Martin', 'Nelly'],
    // peopleNames: ['Alice', 'Bob', 'Charlie', 'Denise'],
    incubationPeriod: 4,
    infectionTimes: [
      { index: 0, name: 'Alice', time: { day: 0, slot: 0}},
      { index: 1, name: 'Bob', time: { day: 1, slot: 1}},
      { index: 2, name: 'Charlie', time: { day: 2, slot: 2}},
      { index: 3, name: 'Denise', time: { day: 3, slot: 3}}
    ]
};

export const Sim1Locations = [
  [
    {x: 0, y: 0},
    {x: 0, y: 1},
    {x: 0, y: 2},
    {x: 0, y: 3},
    {x: 0, y: 2},
    {x: 0, y: 1},
  ],
  [
    {x: 0, y: 2},
    {x: 0, y: 4},
    {x: 0, y: 2},
    {x: 0, y: 4},
    {x: 0, y: 2},
    {x: 0, y: 0},
  ],
  [
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 1, y: 2},
    {x: 1, y: 1},
  ],
  [
    {x: 1, y: 2},
    {x: 1, y: 4},
    {x: 1, y: 6},
    {x: 1, y: 4},
    {x: 1, y: 2},
    {x: 1, y: 0},
  ],
];

export function setLocation(simulation: Simulation, index: number) {
  const individual = simulation.individuals[index];
  const simLocations = Sim1Locations[index % Sim1Locations.length];
  for (const timeSlot of simulation.timeSlots) {
    const location = simLocations[timeSlot.time % simLocations.length];
    individual.locations[timeSlot.time].x = location.x;
    individual.locations[timeSlot.time].y = location.y;
  }
}

export function setInfected(indivIndex: number, infectedTime: {day: number, slot: number}, simulation: Simulation): Individual {
  const individual = simulation.individuals[indivIndex];
  expect(individual).toBeTruthy();
  individual.infectedTime = infectedTime.day * sim1Data.nbTimeSlotsPerDay + infectedTime.slot;
  return individual;
}

// describe('SimulationService', () => {
//   let service: SimulationService;
//   let simulation1: Simulation;
//   let contactsPerPerson: Map<string, Map<number, Individual[]>> = new Map();
//   let globalInfectionRecord1: GlobalInfectionRecord;

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//     service = TestBed.inject(SimulationService);
//   });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });
//   it('create a simulation', () => {
//     simulation1 = service.createSimulation(
//       sim1Data.nbTimeSlotsPerDay,
//       sim1Data.durationInDays,
//       sim1Data.areaSideSize,
//       sim1Data.peopleNames
//     );
//     expect(simulation1).toBeTruthy();
//     expect(simulation1.nbTimeSlots).toEqual(sim1Data.nbTimeSlotsPerDay * sim1Data.durationInDays);
//     expect(simulation1.allX.length).toEqual(sim1Data.areaSideSize);
//     expect(simulation1.allX[0]).toEqual(0);
//     expect(simulation1.allX[simulation1.allX.length - 1]).toEqual(sim1Data.areaSideSize - 1);
//     expect(simulation1.allY.length).toEqual(sim1Data.areaSideSize);
//     expect(simulation1.allY[0]).toEqual(0);
//     expect(simulation1.allY[simulation1.allY.length - 1]).toEqual(sim1Data.areaSideSize - 1);
//     expect(simulation1.allDays.length).toEqual(sim1Data.durationInDays);
//     expect(simulation1.allDays[0]).toEqual(0);
//     expect(simulation1.allDays[simulation1.allDays.length - 1]).toEqual(sim1Data.durationInDays - 1);
//     expect(simulation1.allSlotsInDay.length).toEqual(sim1Data.nbTimeSlotsPerDay);
//     expect(simulation1.allSlotsInDay[0]).toEqual(0);
//     expect(simulation1.allSlotsInDay[simulation1.allSlotsInDay.length - 1]).toEqual(sim1Data.nbTimeSlotsPerDay - 1);
//     contactsPerPerson = new Map();
//     for (const timeSlot of simulation1.timeSlots) {
//       const contacts = simulation1.detectContact(timeSlot);
//       for (const contact of contacts) {
//         let contactForIndividual1: Map<number, Individual[]> = contactsPerPerson.get(contact.individual1.name);
//         if (!contactForIndividual1) {
//           contactForIndividual1 = new Map();
//           contactsPerPerson.set(contact.individual1.name, contactForIndividual1);
//         }
//         let contactsAtThisTime = contactForIndividual1.get(timeSlot.time);
//         if (!contactsAtThisTime) {
//           contactsAtThisTime = [];
//           contactForIndividual1.set(timeSlot.time, contactsAtThisTime);
//         }
//         if (!contactsAtThisTime.includes(contact.individual2)) {
//           contactsAtThisTime.push(contact.individual2);
//           // tslint:disable-next-line: no-console
//           console.info(`contact at time ${timeSlot.time} between ${contact.individual1.name} and ${contact.individual2.name}`);
//         }
//       }
//     }
//   });
//   it('create a GlobalInfectionRecord', () => {
//     globalInfectionRecord1 = new GlobalInfectionRecord(
//       simulation1,
//       sim1Data.incubationPeriod
//     );
//     expect(globalInfectionRecord1).toBeTruthy();
//   });
//   it('expect no infected zone', () => {
//     for (const individual of simulation1.individuals) {
//       for (const timeSlot of simulation1.timeSlots) {
//         const individualLocation = individual.locations[timeSlot.time];
//         expect(
//           globalInfectionRecord1.isInfected(timeSlot.time, individualLocation.x, individualLocation.y)
//         ).toBeFalse();
//       }
//     }
//   });
//   it('expect no contact with infected people', () => {
//     for (const individual of simulation1.individuals) {
//       for (const timeSlot of simulation1.timeSlots) {
//         expect(
//           globalInfectionRecord1.computeNbInfectedContacts(
//             individual,
//             timeSlot
//           )
//         ).toEqual(0);
//       }
//     }
//   });
//   it('first individual infected', () => {
//     const individual = setInfected(sim1Data.infectionTimes[0].index, sim1Data.infectionTimes[0].time, simulation1);
//     globalInfectionRecord1.refresh();
//     for (const timeSlot of simulation1.timeSlots) {
//       const individualLocation = individual.locations[timeSlot.time];
//       expect(
//         globalInfectionRecord1.isInfected(timeSlot.time, individualLocation.x, individualLocation.y)
//       ).toBeTrue();
//     }

//     const indivContactsByTime: Map<number, Individual[]> = contactsPerPerson.get(individual.name);
//     expect(indivContactsByTime).toBeTruthy();
//     let nbContacts = 0;
//     for (const time of indivContactsByTime.keys()) {
//       const contacts: Individual[] = indivContactsByTime.get(time);
//       expect(contacts).toBeTruthy();
//       for (const contact of contacts) {
//         const contactLocation = contact.locations[time];
//         const indivLocation = individual.locations[time];
//         expect(contactLocation.equals(indivLocation)).toBeTrue();
//         nbContacts++;
//         const day = Math.floor(time / sim1Data.nbTimeSlotsPerDay);
//         const slotInDay = time - day * sim1Data.nbTimeSlotsPerDay;
//         expect(
//           globalInfectionRecord1.computeNbInfectedContacts(contact, {time, day, slotInDay})
//         ).toBeGreaterThan(0);
//       }
//     }
//     // tslint:disable-next-line: no-console
//     console.info(`Nb contacts with ${individual.name}: ${nbContacts}`);
//   });
//   it('second individual infected', () => {
//     const bob = setInfected(sim1Data.infectionTimes[1].index, sim1Data.infectionTimes[1].time, simulation1);
//     globalInfectionRecord1.refresh();
//     for (const timeSlot of simulation1.timeSlots) {
//       const individualLocation = bob.locations[timeSlot.time];
//       expect(
//         globalInfectionRecord1.isInfected(timeSlot.time, individualLocation.x, individualLocation.y)
//       ).toBeTrue();
//     }

//     const bobContactsByTime: Map<number, Individual[]> = contactsPerPerson.get(bob.name);
//     expect(bobContactsByTime).toBeTruthy();
//     let nbContacts = 0;
//     for (const time of bobContactsByTime.keys()) {
//       const contacts: Individual[] = bobContactsByTime.get(time);
//       expect(contacts).toBeTruthy();
//       for (const contact of contacts) {
//         const contactLocation = contact.locations[time];
//         const bobLocation = bob.locations[time];
//         expect(contactLocation.equals(bobLocation)).toBeTrue();
//         nbContacts++;
//         const day = Math.floor(time / sim1Data.nbTimeSlotsPerDay);
//         const slotInDay = time - day * sim1Data.nbTimeSlotsPerDay;
//         expect(
//           globalInfectionRecord1.computeNbInfectedContacts(contact, {time, day, slotInDay})
//         ).toBeGreaterThan(0);
//       }
//     }
//     // tslint:disable-next-line: no-console
//     console.info(`Nb contacts with ${bob.name}: ${nbContacts}`);
//   });
// });
