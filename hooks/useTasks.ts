import type { tasks_v1 } from "googleapis";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const useTasks = (tasklist: string | null | undefined) => {
  const { data } = useSWR<readonly tasks_v1.Schema$Task[]>(
    tasklist && `/api/tasklists/${tasklist}/tasks`,
    fetcher
  );
  return data;
};

export default useTasks;
