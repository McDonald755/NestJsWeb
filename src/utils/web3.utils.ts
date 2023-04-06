import { ethers } from 'ethers';
import { changeWssStatus, gConfig, initWebSocketConnect } from '../global';
import { Logger } from './log4js';

const WebSocketProviderClass = (): new () => ethers.providers.WebSocketProvider => (class {
} as never);

let urlInterval = 0;

export class WebSocketProvider extends WebSocketProviderClass() {

  private provider?: ethers.providers.WebSocketProvider;
  private events: ethers.providers.WebSocketProvider['_events'] = [];
  private requests: ethers.providers.WebSocketProvider['_requests'] = {};

  private handler = {
    get(target: WebSocketProvider, prop: string, receiver: unknown) {
      const value = target.provider && Reflect.get(target.provider, prop, receiver);

      return value instanceof Function ? value.bind(target.provider) : value;
    },
  };

  constructor(private providerUrl) {
    super();
    this.create();

    return new Proxy(this, this.handler);
  }

  private create() {
    if (this.provider) {
      this.events = [...this.events, ...this.provider._events];
      this.requests = { ...this.requests, ...this.provider._requests };
    }

    const provider = new ethers.providers.WebSocketProvider(this.providerUrl, this.provider?.network?.chainId);
    let pingInterval: NodeJS.Timer | undefined;
    let pongTimeout: NodeJS.Timeout | undefined;

    // 定时任务定时ping wss连接

    /**
     * 这里try catch 处理外部节点因为超过限制会返回limit或者返回其他无法预知的结果
     */
    try {
      provider._websocket.on('open', () => {
        //wss状态
        changeWssStatus(true);
        pingInterval = setInterval(() => {
          provider._websocket.ping();
          console.log('------------------------ping---------------------');
          pongTimeout = setTimeout(() => {
            provider._websocket.terminate();
          }, gConfig.WEBSOCKET_PONG_TIMEOUT);
        }, gConfig.WEBSOCKET_PING_INTERVAL);

        let event;
        while ((event = this.events.pop())) {
          provider._events.push(event);
          provider._startEvent(event);
        }

        for (const key in this.requests) {
          provider._requests[key] = this.requests[key];
          provider._websocket.send(this.requests[key].payload);
          delete this.requests[key];
        }
      });
    } catch (e) {
      //未知异常
      console.log('------------------------', e, '---------------------');
      urlInterval++;
      this.getUrl(urlInterval);
      setTimeout(() => this.create(), gConfig.WEBSOCKET_RECONNECT_DELAY);
    }


    provider._websocket.on('pong', () => {
      if (pongTimeout) clearTimeout(pongTimeout);
    });

    // 监听关闭连接
    provider._websocket.on('close', (code: number) => {
      //wss状态
      changeWssStatus(false);
      provider._wsReady = false;
      console.log('------------------------close---------------------');
      Logger.info("------------------------connect close------------------------")
      //清除定时器
      if (pingInterval) clearInterval(pingInterval);
      if (pongTimeout) clearTimeout(pongTimeout);

      if (code !== 1000) {
        //重新连接
        console.log('------------------------reconnect---------------------');
        Logger.info("------------------------reconnect------------------------")
        urlInterval++;
        this.getUrl(urlInterval);
        setTimeout(() => this.create(), gConfig.WEBSOCKET_RECONNECT_DELAY);
      }
    });
    this.provider = provider;

    //全局状态管理
    initWebSocketConnect(this.provider)
  }

  // 更换url
  private getUrl(num: number){
    // 取余
    const number = num % gConfig.nodes.length;
    console.log(number)
    this.providerUrl =  gConfig.nodes[number].node;
  }
}
