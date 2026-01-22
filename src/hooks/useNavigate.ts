import config from '@/config/config';

declare global {
  interface Window {
    sforce: {
      one: {
        navigateToSObject: (recordId: string, view: 'detail') => void;
        back: () => void;
        showToast: (toastParams: { message: string; type: Message }) => void;
      };
    };
  }
}

type Message = 'success' | 'error' | 'info';

export function useNavigate() {
  const sforce = window.parent.sforce;
  const navigateToSObject = (function () {
    if (sforce) {
      return function (Id: string) {
        sforce.one.navigateToSObject(Id, 'detail');
      };
    } else {
      return function (Id: string) {
        window.parent.location.href = config.baseUrl + Id;
      };
    }
  })();

  const navigateBack = (function () {
    if (sforce) {
      return function () {
        sforce.one.back();
      };
    } else {
      return function () {
        window.parent.history.back();
      };
    }
  })();

  const showToast = (function () {
    if (sforce) {
      return function (message: string, type: Message = 'info') {
        sforce.one.showToast({
          message,
          type,
        });
      };
    } else {
      return function (message: string, type: Message = 'info') {
        switch (type) {
          case 'success':
            ElMessage.success(message);
            break;
          case 'error':
            ElMessage.error(message);
            break;
          default:
            ElMessage.info(message);
            break;
        }
      };
    }
  })();

  return {
    navigateToSObject,
    navigateBack,
    showToast,
  };
}
