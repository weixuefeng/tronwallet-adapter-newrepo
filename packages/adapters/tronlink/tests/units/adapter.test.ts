import {
    WalletConnectionError,
    WalletDisconnectedError,
    WalletNotFoundError,
    AdapterState,
} from '@tronweb3/tronwallet-abstract-adapter';
import { TronLinkAdapter } from '../../src/index.js';
const noop = () => {
    //
};
window.open = jest.fn();
beforeEach(function () {
    global.document = window.document;
    global.navigator = window.navigator;
    jest.useFakeTimers();
});
afterAll(function () {
    setTimeout(process.exit, 500);
});
describe('TronLinkAdapter', function () {
    describe('#adapter()', function () {
        test('constructor', () => {
            const adapter = new TronLinkAdapter();
            expect(adapter.name).toEqual('TronLink');
            expect(adapter).toHaveProperty('icon');
            expect(adapter).toHaveProperty('url');
            expect(adapter).toHaveProperty('state');
            expect(adapter).toHaveProperty('address');
            expect(adapter).toHaveProperty('connecting');
            expect(adapter).toHaveProperty('connected');

            expect(adapter).toHaveProperty('connect');
            expect(adapter).toHaveProperty('disconnect');
            expect(adapter).toHaveProperty('signMessage');
            expect(adapter).toHaveProperty('signTransaction');

            expect(adapter).toHaveProperty('on');
            expect(adapter).toHaveProperty('off');
        });

        test('should work fine when TronLink is not installed', function () {
            (window as any).tronLink = undefined;
            const adapter = new TronLinkAdapter();
            expect(adapter.state).toEqual(AdapterState.NotFound);
            expect(adapter.connected).toEqual(false);
        });
        test('should work fine when TronLink is installed but not connected', function () {
            (window as any).tronLink = {
                ready: false,
                tronWeb: false,
                request: noop,
            };
            const adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.connected).toEqual(false);
        });
        test('should work fine when TronLink is connected', function () {
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: { base58: 'xxx' },
                },
            };
            const adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.connected).toEqual(true);
            expect(adapter.address).toEqual('xxx');
        });
    });
    describe('#connect()', function () {
        test('should throw error when TronLink is not installed', async function () {
            (window as any).tronLink = undefined;
            try {
                const adapter = new TronLinkAdapter();
                await adapter.connect();
                throw new Error();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletNotFoundError);
            }
        });
        test('should throw error when TronLink is locked', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve('');
                },
            };
            const connecor = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should throw error when user denied the connection', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 4001 });
                },
            };
            const connecor = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should throw error when last connection is not completed', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 4000 });
                },
            };
            const connecor = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            try {
                await connecor.connect();
            } catch (e) {
                expect(e).toBeInstanceOf(WalletConnectionError);
            }
        });
        test('should work fine when TronLink is installed', async function () {
            const address = 'xxxxx';
            (window as any).tronLink = {
                ready: true,
                tronWeb: {
                    defaultAddress: {
                        base58: address,
                    },
                },
                request: noop,
            };
            const adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            await adapter.connect();
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual(address);
            expect(adapter.connected).toEqual(true);
        });
    });
    describe('#signMessage()', function () {
        test('should throw Disconnected error when TronLink is not installed', async function () {
            (window as any).tronLink = undefined;
            const adapter = new TronLinkAdapter();
            try {
                await adapter.signMessage('some str');
            } catch (e) {
                expect(e).toBeInstanceOf(WalletDisconnectedError);
            }
        });
        test('should throw Disconnected error when TronLink is disconnected', async function () {
            (window as any).tronLink = {
                ready: false,
            };
            const adapter = new TronLinkAdapter();
            try {
                await adapter.signMessage('some str');
            } catch (e) {
                expect(e).toBeInstanceOf(WalletDisconnectedError);
            }
        });
        test.skip('should work fine when TronLink is connected', async function () {
            (window as any).tronLink = {
                ready: false,
                tronWeb: {
                    defaultAddress: {
                        base58: 'address',
                    },
                    trx: {
                        sign() {
                            return '123';
                        },
                    },
                    toHex() {
                        return '123';
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 200 });
                },
            };
            const adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            await adapter.connect();
            const signedMsg = await adapter.signMessage('some str');
            expect(signedMsg).toEqual('123');
        });
    });
    describe('#signTransaction()', function () {
        test('should throw Disconnected error when TronLink is not installed', async function () {
            (window as any).tronLink = undefined;
            const adapter = new TronLinkAdapter();
            try {
                await adapter.signTransaction({} as any);
            } catch (e) {
                expect(e).toBeInstanceOf(WalletDisconnectedError);
            }
        });
        test('should throw Disconnected error when TronLink is disconnected', async function () {
            (window as any).tronLink = {
                ready: false,
            };
            const adapter = new TronLinkAdapter();
            try {
                await adapter.signTransaction({} as any);
            } catch (e) {
                expect(e).toBeInstanceOf(WalletDisconnectedError);
            }
        });
        test('should work fine when TronLink is connected', async function () {
            (window as any).tronLink = {
                ready: false,
                tronWeb: {
                    defaultAddress: {
                        base58: 'address',
                    },
                    trx: {
                        sign() {
                            return '123';
                        },
                    },
                },
                request: function () {
                    return Promise.resolve({ code: 200 });
                },
            };
            const adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            await adapter.connect();
            const signedTransaction = await adapter.signTransaction({} as any);
            expect(signedTransaction).toEqual('123');
        });
    });
});