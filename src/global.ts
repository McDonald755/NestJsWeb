import {ethers} from 'ethers';

export let gConfig: { [key: string]: any } | null = null;
export let contractsMap = new Map;
export let wssStatus: boolean = false
export let httpsStatus: boolean = false
export let httpsInterval: NodeJS.Timer
export let jsonProvider: any
export let webSocketConnect: any

export const initConfig = (config: { [key: string]: any }) => {
    gConfig = config;
}


export function initContract(address: string, value: any) {
    contractsMap.set(address, value);
}


export function initJsonRpcProvider(url: string) {
    jsonProvider = new ethers.providers.JsonRpcProvider(url);
}

export function changeWssStatus(status: boolean) {
    wssStatus = status;
}

export function changeHttpsStatus(status: boolean) {
    httpsStatus = status;
}

export function changeHttpsInterval(interval: NodeJS.Timer) {
    httpsInterval = interval;
}

export function cleanHttpsInterval() {
    clearInterval(httpsInterval);
    httpsStatus = false;
}

export function initWebSocketConnect(provider: any) {
    webSocketConnect = provider;
}

export async function closeWebSocketConnect() {
    await webSocketConnect.destroy();
}