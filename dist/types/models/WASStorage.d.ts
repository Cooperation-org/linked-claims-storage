export declare class LCWStorage {
    signer: any;
    zcap: any;
    spaceId: string;
    constructor({ signer, zcap, spaceId }: {
        signer: any;
        zcap: any;
        spaceId: string;
    });
    private getStorageClient;
    private getResource;
    add(key: string, value: any): Promise<{
        ok: boolean;
        headers: [string, string][];
        status: number;
        blob(): Promise<import("buffer").Blob>;
        json(): Promise<unknown>;
    }>;
    read(key: string): Promise<unknown>;
    update(key: string, value: any): Promise<{
        ok: boolean;
        headers: [string, string][];
        status: number;
        blob(): Promise<import("buffer").Blob>;
        json(): Promise<unknown>;
    }>;
    delete(key: string): Promise<boolean>;
    list(): Promise<void>;
}
