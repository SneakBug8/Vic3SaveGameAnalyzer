export function Sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function SleepSync(ms: number) {
    const start = Date.now();
    let now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}