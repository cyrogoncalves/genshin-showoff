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

export const guard = <T extends string>(possibleValues: string[], value): value is T =>
    typeof value === 'string' && possibleValues.includes(value);
