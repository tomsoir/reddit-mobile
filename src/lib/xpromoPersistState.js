import { localstorage as ls } from 'app/constants';
import localStorageAvailable from './localStorageAvailable';
import TimeChecker from 'lib/timeChecker';

export const status = {
  MAKE_VISIBLE : 'MAKE_VISIBLE',
  SHOW__SAME_SESSION : 'SHOW__SAME_SESSION',
  SHOW__NEW_SESSION : 'SHOW__NEW_SESSION',
  HIDE__STOP_TIMER: 'HIDE__STOP_TIMER',
};

const { 
  BANNER_LAST_CLOSED, 
  BANNER_PERSIST_SHOWED 
} = ls;

const config = { 
  showTime  : 1*10*1000,
  hideTime  : 1*20*1000,
};

const timer = new TimeChecker(1000);

const isXpromoClosed = () => {
  if (localStorageAvailable()) {
    return !!localStorage.getItem(BANNER_LAST_CLOSED);
  }
};
const getLocalStorage = () => {
  if (localStorageAvailable()) {
    const time = localStorage.getItem(BANNER_PERSIST_SHOWED);
    return time ? (new Date(time)).getTime() : setLocalStorage();
  }
};
export const setLocalStorage = () => {
  if (localStorageAvailable()) {
    return localStorage.setItem(BANNER_PERSIST_SHOWED, new Date());
  }
};

const checkDisplayStatus = (dismissedState, callback) => {
  if (!isXpromoClosed()) {
    callback(status.MAKE_VISIBLE);
    return true;
  }

  const lsTime = getLocalStorage();

  // Can we show the persistent banner 
  // — show up the banner.
  if (Date.now() <= (lsTime + config.showTime)) {
    callback(status.SHOW__SAME_SESSION);
    return true;
  }
  // If more then HIDE time and the session is new 
  // — change to show the banner
  if ((Date.now() > (lsTime + config.hideTime)) && !dismissedState) {
    setLocalStorage();
    callback(status.SHOW__NEW_SESSION);
    return true;
  } 
  // For other cases we dont need to show up the bunner
  // — stop timer and hide the banner 
  callback(status.HIDE__STOP_TIMER);
  return false
}

export const runStatusCheck = (dismissedState, statusCallback) => {
  const checker = () => {
    return checkDisplayStatus(
      dismissedState, 
      statusCallback
    );
  }
  timer.start(checker);
}
