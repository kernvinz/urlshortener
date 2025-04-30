import { UrlPayload } from "../types";


export const shortenUrl = async (payload: UrlPayload) => {
    const api = import.meta.env.VITE_API_DOMAIN;

    try {
        const response = await fetch(`${api}/shortenurl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error shortening URL:', error);
        throw error;
    }
};