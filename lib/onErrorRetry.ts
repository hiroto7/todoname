import { AxiosError } from "axios";
import { SWRConfig, SWRConfiguration } from "swr";

const onErrorRetry: NonNullable<SWRConfiguration["onErrorRetry"]> = (
  err,
  ...args
) => {
  if (
    err instanceof AxiosError &&
    err.response &&
    [401, 403, 404].includes(err.response.status)
  ) {
    return;
  }

  SWRConfig.defaultValue.onErrorRetry(err, ...args);
};

export default onErrorRetry;
