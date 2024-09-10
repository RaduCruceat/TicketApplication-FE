import { SECRET_LINK } from "$env/static/private";

export function load() {
  return {
    secretLink: SECRET_LINK,
  };
}