// query helper functions
const _query = async (endpoint: string, query: string): Promise<any> => {
  const resp = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ query }),
  });

  if (resp.status !== 200) {
    console.log('query:', query)
    console.log('invalid resp:', resp)
    throw new Error("invalid response status: " + resp.status);
  }

  const data = await resp.json();

  const errors = data.errors;
  if (errors && errors.length > 0) {
    console.error("Fetch Subgraph Errors", { errors, query });
    throw new Error(`Fetch Subgraph Errors: ${JSON.stringify(errors)}`);
  }

  return data.data;
};

export default _query;
