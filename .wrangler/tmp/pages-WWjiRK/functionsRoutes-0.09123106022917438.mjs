import { onRequest as __submit_js_onRequest } from "/Users/dongyiye/projects/luln/my-web/functions/submit.js"

export const routes = [
    {
      routePath: "/submit",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [__submit_js_onRequest],
    },
  ]