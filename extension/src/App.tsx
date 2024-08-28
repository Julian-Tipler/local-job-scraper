import {
  RouterProvider,
  createHashRouter,
  Outlet,
  redirect,
} from "react-router-dom";
import { Login } from "./views/Login";
import { supabase } from "./clients/supabase-client";
import { Splash } from "./views/Splash";

const App = () => {
  const router = createHashRouter([
    {
      id: "root",
      path: "/",
      element: (
        <div className="app">
          <Outlet />
        </div>
      ),
      children: [
        {
          path: "/",
          element: <Splash />,
          loader: protectedLoader,
        },
        {
          path: "/login",
          index: true,
          element: <Login />,
        },
        {
          path: "*",
          element: <div>Error</div>,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} fallbackElement={<></>} />;
};

export default App;

async function protectedLoader() {
  const sessionToken = await isAuthenticated();
  console.log(sessionToken);
  if (!sessionToken) {
    return redirect("/login");
  }

  const auth = await supabase.auth.getUser(sessionToken);
  if (!auth.data?.user) {
    return redirect("/login");
  }
  return { sessionToken };
}

const isAuthenticated = async (): Promise<string | false> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["wiseFlashcardsSessionToken"], function(result) {
      if (result.wiseFlashcardsSessionToken) {
        resolve(result.wiseFlashcardsSessionToken);
      } else {
        resolve(false);
      }
    });
  });
};
