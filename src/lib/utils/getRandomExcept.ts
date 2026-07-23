export const getRandomExcept = (
  min: number,
  max: number,
  excluded: number,
): number => {
  let random: number;

  do {
    random = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (random === excluded);

  return random;
};
