export function getLocalStorage(): string[] {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem("favorites");
        return data ? JSON.parse(data) : [];
    }
    return [];
}

export function saveToLocalStorage(name: string): void {
    if (typeof window !== "undefined") {
        let favorites: string[] = getLocalStorage();
        if (!favorites.includes(name)) {
            favorites.push(name);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

export function removeFromLocalStorage(name: string): void {
    if (typeof window !== "undefined") {
        let favorites: string[] = getLocalStorage();
        favorites = favorites.filter(city => city !== name);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}
