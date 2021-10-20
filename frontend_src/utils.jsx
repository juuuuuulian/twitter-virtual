const getAppVars = () => {
  const appVars = window.APP_VARS;
  if (appVars == null) {
    // eslint-disable-next-line no-console
    console.warn('no window.APP_VARS available');
    return {};
  }
  return appVars;
};

const getLastAppUseValue = () => {
  const appVars = getAppVars();
  const { last_app_use: lastAppUse } = appVars;
  if (lastAppUse == null) return null;
  return new Date(lastAppUse);
};

const getSecondsTilNextAppAvail = () => {
  const lastAppUse = getLastAppUseValue();
  if (lastAppUse == null) return 0;
  const msInADay = 60 * 60 * 24 * 1000;
  const nextAvailableAppUse = new Date(lastAppUse.getTime() + msInADay);
  const now = new Date();

  if (now.getTime() > nextAvailableAppUse.getTime()) return 0;

  return Math.floor((nextAvailableAppUse.getTime() - now.getTime()) / 1000);
};

const getErrorMessage = () => (getAppVars().error_message);

export {
  getAppVars, getLastAppUseValue, getSecondsTilNextAppAvail, getErrorMessage,
};
