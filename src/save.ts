// src/save.ts

import { encode, decode } from '@msgpack/msgpack';
import { inflateSync, deflateSync, strFromU8, unzlibSync } from 'fflate';
import { base64ToBytes } from 'byte-base64';
import type { PointercrateDemon, SimplifiedDemon, RouletteState } from './types';

export function simplifyDemon(demon: PointercrateDemon): SimplifiedDemon {
    // This regex extracts the 11-character YouTube video ID from a full URL
    const match = demon.video?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return {
        name: demon.name,
        creator: demon.publisher.name,
        position: demon.position,
        levelID: demon.level_id, // Include levelID if it's consistently available and needed
        video: match ? match[1] : null, // Store only the video ID
        link: `https://pointercrate.com/demonlist/${demon.position}/`, // Construct the link
    };
}

export function compressState(state: RouletteState): Uint8Array {
    console.log("Compressing state:", state);
    const dataToEncode = {
        ...state,
        // CRITICAL FIX: Map demons to arrays of values as expected by handleOldSave for version 1
        demons: state.demons.map(demon => [
            demon.position,
            demon.name,
            demon.creator,
            demon.video, // This should be the video ID
            demon.levelID || null, // Include levelID if present
            demon.link || null // Include link if present
        ]),
        version: 1, // Explicitly setting version 1 for this format
    };

    try {
        const encoded = encode(dataToEncode);
        console.log("Encoded (MessagePack):", encoded);

        // Deflate (compress) the encoded data
        const compressed = deflateSync(encoded);
        console.log("Compressed (fflate deflateSync):", compressed);

        return compressed;
    } catch (error) {
        console.error("Error during compression:", error);
        // Return an empty array or throw to indicate failure
        return new Uint8Array();
    }
}

// Helper function to check if Uint8Array contains only base64 characters
function isBase64Character(char: number): boolean {
    return (
        (char >= 65 && char <= 90) || // A-Z
        (char >= 97 && char <= 122) || // a-z
        (char >= 48 && char <= 57) || // 0-9
        char === 43 || // +
        char === 47 || // /
        char === 61    // =
    );
}

// Handles decompression for the old base64 + zlib + msgpack format
function handleOldSave(data: Uint8Array): RouletteState {
    console.log("Attempting to handle old save format...");
    try {
        const base64String = strFromU8(data);
        console.log("Old save base64 string:", base64String.substring(0, 100) + '...'); // Log first 100 chars

        const bytesFromBase64 = base64ToBytes(base64String);
        console.log("Bytes from base64:", bytesFromBase64);

        const unzipped = unzlibSync(bytesFromBase64);
        console.log("Unzipped (fflate unzlibSync):", unzipped);

        const decoded = decode(unzipped) as any;
        console.log("Decoded old save (MessagePack):", decoded);

        return {
            current: decoded.demon,
            percent: decoded.percent,
            percents: decoded.percents,
            playing: decoded.playing,
            selectedLists: {
                main: decoded.main,
                extended: decoded.extended,
                legacy: decoded.legacy,
            },
            demons: decoded.demons.map((demonArray: any[]) => {
                // Ensure demonArray has enough elements to prevent errors
                if (demonArray.length < 4) {
                    console.warn("Malformed demon array in old save:", demonArray);
                    return {
                        position: 0, name: "Unknown", creator: "Unknown", video: null, link: ""
                    } as SimplifiedDemon;
                }
                return {
                    position: demonArray[0],
                    name: demonArray[1],
                    creator: demonArray[2],
                    video: demonArray[3], // This should be the video ID
                    levelID: demonArray[4] || undefined, // Optional levelID
                    link: demonArray[5] || "", // Optional link
                } as SimplifiedDemon;
            }),
        };
    } catch (error) {
        console.error("Error during old save decompression:", error);
        throw new Error("Failed to decompress old save file.");
    }
}

export function decompressState(data: Uint8Array): RouletteState {
    console.log("Decompressing state. Received data length:", data.length);
    // Check if the data looks like a base64 encoded string (old format)
    // This check is a heuristic; it might need refinement if new formats also look like base64
    if (data.every(i => isBase64Character(i))) {
        console.log("Data appears to be base64 encoded. Attempting old save handler.");
        return handleOldSave(data);
    }

    // Assume it's the new format (deflated MessagePack)
    try {
        console.log("Attempting to decompress new save format (inflateSync then decode).");
        const uncompressed = inflateSync(data);
        console.log("Uncompressed (fflate inflateSync):", uncompressed);
        const decoded = decode(uncompressed) as RouletteState;
        console.log("Decoded new save (MessagePack):", decoded);

        // If the new format is loaded, ensure demons are objects, not arrays of values
        if (decoded.demons && decoded.demons.length > 0 && Array.isArray(decoded.demons[0])) {
            // This means it was encoded as Object.values, convert back if necessary for new format
            // However, with the fix in compressState, this path should ideally not be hit for new saves
            // if the version is explicitly handled. For now, assume compressState saves correctly.
            console.warn("Demons in new save appear to be arrays, converting to objects.");
            decoded.demons = (decoded.demons as any[]).map(demonArray => ({
                position: demonArray[0],
                name: demonArray[1],
                creator: demonArray[2],
                video: demonArray[3],
                levelID: demonArray[4] || undefined,
                link: demonArray[5] || "",
            })) as SimplifiedDemon[];
        }

        return decoded;
    } catch (error) {
        console.error("Error during new save decompression:", error);
        // If new format decompression fails, it might still be an old format that slipped through the check
        // Or a corrupted file. Re-throw for now.
        throw new Error("Failed to decompress new save file. It might be corrupted or an old format.");
    }
}
