"use client"

export function saveToLocalStorage(name: string): void {
    if (typeof window !== "undefined") {
        let favorites: string[] = getLocalStorage();
        if (!favorites.includes(name)) {
            favorites.push(name);
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

export function getLocalStorage(): string[] {
    if (typeof window !== "undefined") {
        let data = localStorage.getItem("favorites");
        try {
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error("Error parsing localStorage data:", error);
            return [];
        }
    }
    return [];
}

export function removeFromLocalStorage(name: string): void {
    if (typeof window !== "undefined") {
        let favorites: string[] = getLocalStorage();
        favorites = favorites.filter(city => city !== name);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}
