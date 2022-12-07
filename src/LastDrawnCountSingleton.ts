
type Listener = (lastDrawnCount: number) => void;

class LastDrawnCountSingleton {

    private lastDrawnCount = 0;

    private readonly listeners: Set<Listener> = new Set();

    public increment() {

        this.lastDrawnCount++;

        this.listeners.forEach(listener => listener(this.lastDrawnCount));
    }

    public addListener(listener: Listener) {

        this.listeners.add(listener);
    }

    public removeListener(listener: Listener) {

        this.listeners.delete(listener);
    }
}

export const lastDrawnCountSingleton = new LastDrawnCountSingleton();
