export default {
    getXlsxData: (z, worksheet) => {
        let stop = 0;
        for (let i = 0; i < z.length; i += 1) {
            if (!Number.isNaN(Number.parseInt(z[i], 0))) {
                stop = i;
                break;
            }
        }
        return {
            col: z.substring(0, stop),
            row: parseInt(z.substring(stop), 0),
            value: worksheet[z].v,
        };
    },
};
