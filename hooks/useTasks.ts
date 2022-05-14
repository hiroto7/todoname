import type { tasks_v1 } from "googleapis";
import useSWR from "swr";
import fetcher from "../lib/fetcher";
import onErrorRetry from "../lib/onErrorRetry";

const useTasks = (tasklist: string | null | undefined) => {
  const { data } = useSWR<readonly tasks_v1.Schema$Task[]>(
    tasklist && `/api/tasklists/${tasklist}/tasks`,
    fetcher,
    { onErrorRetry }
  );
  return data;
};

export default useTasks;
