import { AxiosError } from "axios";
import { SWRConfig, type BareFetcher, type Fetcher } from "swr";
import type {
  PublicConfiguration,
  Revalidator,
  RevalidatorOptions,
} from "swr/dist/types";

const onErrorRetry = <
  Data = any,
  Error = any,
  Fn extends Fetcher = BareFetcher
>(
  err: Error,
  key: string,
  config: Readonly<PublicConfiguration<Data, Error, Fn>>,
  revalidate: Revalidator,
  revalidateOpts: Required<RevalidatorOptions>
) => {
  if (
    err instanceof AxiosError &&
    err.response &&
    [401, 403, 404].includes(err.response.status)
  ) {
    return;
  }

  SWRConfig.default.onErrorRetry(
    err,
    key,
    // @ts-expect-error
    config,
    revalidate,
    revalidateOpts
  );
};

export default onErrorRetry;
