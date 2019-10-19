export function getData(z, worksheet) {

        let stop = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                stop = i;
                break;
            }
        }
        return {
            col: z.substring(0, stop),
            row: parseInt(z.substring(stop)),
            value: worksheet[z].v
        }

}