import config from '@/config/config';

export const toDetail = (id: string) => {
  return config.baseUrl + id;
};
