import { createBrowserRouter } from "react-router-dom";
import MyTreeNotes from "./routes/MyTreeNotes";
import TreeNotes from "./routes/TreeNotes";
import Redirect from "./routes/Redirect";

export const router = createBrowserRouter([
  { path: "/", element: <TreeNotes /> },
  { path: "/u/:userId", element: <MyTreeNotes /> },
  { path: "/login", element: <Redirect isLogin={true} /> },
  { path: "/logout", element: <Redirect isLogin={false} /> },
]);
