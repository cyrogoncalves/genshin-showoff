const agh = `
0\t1\t1,144\t20\t57\t-
20\t2,967\t51\t149\t-
1\t20\t3,948\t67\t198\t-
40\t5,908\t101\t297\t-
2\t40\t6,605\t113\t332\t7.2%
50\t7,599\t130\t382\t7.2%
3\t50\t8,528\t146\t428\t14.4%
60\t9,533\t163\t479\t14.4%
4\t60\t10,230\t175\t514\t14.4%
70\t11,243\t192\t564\t14.4%
5\t70\t11,940\t204\t599\t21.6%
80\t12,965\t222\t651\t21.6%
6/MAX\t80\t13,662\t233\t686\t28.8%
90\t14,695\t251\t738\t28.8%
`
const stats = [{}, {}, {}, {}, {}, {}, {}];
agh.replace(/[%,(\/MAX)]/g, "").replace(/-/g, "0").split("\n").filter(l => l).forEach((line, i) => {
    const args = line.split("\t");
    if (args.length === 6) args.shift();
    stats[Math.floor(i/2)][args[0]] = { "HP": Number(args[1]), "ATK": Number(args[2]), "DEF": Number(args[3]), "SUB": Number(args[4]) };
});
console.log(JSON.stringify({stats}));