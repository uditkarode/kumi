export const array = (from: number, to: number) => {
  return [...Array(to).keys()].map((v) => v + from);
};

export const lined = (...strings: string[]) => strings.join("\n");
