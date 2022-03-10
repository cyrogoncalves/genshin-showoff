export function format(msg: string, params: {[propName: string]: any}): string {
  return Object.entries(params).reduce((str, [k, v]) => str.replace(`$${k}`, v), msg);
}

export const parseArgs = (args: string[], separator = "="): {[propName: string]: string} => {
  return args.reduce((obj, arg: string) => {
    const [key, value] = arg.split(separator);
    if (obj[key]) console.warn(`duplicate \`${key}\` argument.`);
    obj[key] = value;
    return obj;
  }, {});
};

export const guard = <T>(possibleValues: readonly any[], value, type = "string"): value is T =>
    typeof value === type && possibleValues.includes(value);

export const capitalize = (string: string): string =>
    string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

export const match = (s: string, toMatch: string[]): string =>
    toMatch.find(m => m.toLowerCase().includes(s?.toLowerCase().replace("_", " ")));

export const groupBy = <V>(
    list: V[], keyGetter: (V) => string|number
): { [d in string|number]?: V[] } => list.reduce((map, item) => {
  const key = keyGetter(item);
  if (!map[key]) map[key] = [];
  map[key].push(item);
  return map;
}, {} as { [d in string|number]?: V[] });