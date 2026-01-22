import { sendMessage } from './message';
import baseConfig from '@/config/config';
import emitter from '@/emitter';
import { EventNames } from '@/emitter';

import type { RequestAction, RequestConfig, RequestResolve } from './type';

const getData = <T>(
  action: RequestAction,
  args: any[] = [],
  config: RequestConfig = { escape: false }
): Promise<RequestResolve<T>> => {
  return new Promise((resolve) => {
    if (action === 'getGlobalData') {
      resolve({ result: window.parent.getGlobalData() as any });
    } else {
      window.parent.Controller[action](
        ...args,
        (result: any, event: any) => {
          resolve({ result, event });
        },
        config
      );
    }
  });
};

/**
 * 封装request模块
 * @param {string} action // 对应调用的controller的方法名称
 * @param {array} args // 入参
 * @param {object} config // 请求配置
 * @param {string} visialforce // 对应不同的Visialforce Page, 可在requestEnum配置
 * @returns
 */
export const request = async <T>(
  action: RequestAction,
  args: any[] = [],
  config: RequestConfig = { escape: false },
  visialforce: string
): Promise<T> => {
  let res: RequestResolve<any>;
  if (baseConfig.isDevelopment) {
    res = await sendMessage<T>(action, args, config, visialforce);
  } else {
    res = await getData<T>(action, args, config);
  }

  console.log(res);
  console.groupEnd();
  const { result, event } = res;
  if (action === 'getGlobalData') {
    return result as T;
  } else {
    if (event.status) {
      console.log(result);
      const res = JSON.parse(result);
      if ((res?.msg && res.msg !== 'ok') || res.IsSuccess === false) {
        emitter.emit(EventNames.API_ERROR, res.msg || res.Message);
        return Promise.reject(res.msg || res.Message);
      } else {
        return res;
      }
    } else {
      emitter.emit(EventNames.API_ERROR, event.message);
      return Promise.reject(event.message);
    }
  }
};
