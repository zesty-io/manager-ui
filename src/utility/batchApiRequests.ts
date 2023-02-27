import {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/dist/query";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";

export interface BatchResponses {
  success: QueryReturnValue<any, FetchBaseQueryError, unknown>[];
  error: QueryReturnValue<any, FetchBaseQueryError, unknown>[];
}

/* 
  This function takes an array of requests and sends them in batches of the specified size
  It returns an object with two arrays: one for successful responses and one for errors
  If the rejectOnError flag is set, it will reject the promise if any of the requests fail
  This is useful for batch operations where you want to know if any of the requests failed
  but you don't want to stop the entire batch if one of the requests fails.

  Current implementation expects a RTK Query fetch resolver (fetchWithBQ) to send the requests in order to take advantage
  of its built-in features and to type match our RTK Query endpoints.
*/
export async function batchApiRequests(
  requests: string[] | FetchArgs[],
  fetchWithBQ: (
    args: string | FetchArgs
  ) => MaybePromise<
    QueryReturnValue<any, FetchBaseQueryError, FetchBaseQueryMeta>
  >,
  batchSize = 10,
  rejectOnError = false
): Promise<{
  success: QueryReturnValue<any, FetchBaseQueryError, unknown>[];
  error: QueryReturnValue<any, FetchBaseQueryError, unknown>[];
}> {
  const queue = [...requests];

  const responses: BatchResponses = {
    success: [],
    error: [],
  };

  async function sendRequest(request: any): Promise<void> {
    const response = await fetchWithBQ(request);

    // If the response is an error, add it to the error array
    if (response.error) {
      responses.error.push(response);

      // If the rejectOnError flag is set, throw the error to reject the promise
      if (rejectOnError) throw response.error;
    } else {
      responses.success.push(response);
    }
  }

  // Send requests in batches of the specified size
  while (queue.length > 0) {
    const batch = queue.splice(0, batchSize);
    await Promise.all(batch.map(sendRequest));
  }

  return responses;
}
