export function saveRedirectPath(path?: string) {
  const redirectPath = path || window.location.pathname;
  localStorage.setItem("loginRedirectPath", redirectPath);
}