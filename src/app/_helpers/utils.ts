export function randomInt(min: number, max: number) {
  const rand = min + Math.floor(Math.random() * (max - min));

  if (rand === max) alert("random number is equal to max");
  return rand;
}
