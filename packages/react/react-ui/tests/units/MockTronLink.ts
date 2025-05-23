import type { ReqestAccountsResponse, TronLinkWallet, TronWeb } from '@tronweb3/tronwallet-adapter-tronlink';
jest.useFakeTimers();
export class MockTronLink implements TronLinkWallet {
    ready: boolean;

    address: string;

    constructor() {
        this.address = 'address';
        this.ready = true;
    }
    get tronWeb() {
        // @ts-ignore
        return {
            ready: true,
            defaultAddress: {
                base58: this.address,
            },
            fullNode: { host: '' },
            solidityNode: { host: '' },
            eventServer: { host: '' },
            toHex(m: string) {
                return m;
            },
            trx: {
                sign(message: any) {
                    return message;
                },
            },
        } as TronWeb;
    }

    request() {
        return new Promise<ReqestAccountsResponse | null>((resolve) => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    message: 'success',
                });
            }, 200);
        });
    }

    setReadyState(state: boolean) {
        this.ready = state;
        // @ts-ignore
        this.tronWeb.ready = state;
    }
}
