import { Navigate, useLocation, useParams } from "react-router-dom";
import { appHref, DEFAULT_APP_ID, readStoredAppId } from "../../utils/appId";

export function RedirectToApp() {
  const location = useLocation();
  const suffix = location.pathname === "/" ? "" : location.pathname;
  return <Navigate to={`${appHref(readStoredAppId(), suffix)}${location.search}`} replace />;
}

export function RedirectToAppIndex() {
  const { appId = DEFAULT_APP_ID } = useParams();
  return <Navigate to={appHref(appId)} replace />;
}
