export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export const timeout = (prom, time, timeoutVal) =>
    Promise.race([
        prom,
        new Promise((_r, rej) => setTimeout(() => rej(timeoutVal), time)),
    ]);
export const _getTransaction = (transaction_id) => {

}

export const raceAll = async (promises, timeoutTime, timeoutVal) => {
    return await Promise.all(
        promises.map((p) => {
            return timeout(p, timeoutTime, timeoutVal);
        })
    );
};

export const isRepeatable = (message) => {
    const bool = (message?.includes('undefined') || message?.includes("billed") || message?.includes("transaction") || message?.includes("Failed to fetch"))
    return bool

}