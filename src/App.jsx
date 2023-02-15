import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/layout";
import RequireAuth from "./components/require-auth";
import AuthContext from "./context/auth";
import Home from "./routes/home";
import ProtectedErrorBoundary from "./routes/protected-error-boundary";
import SignIn from "./routes/sign-in";
import SuperAdmin from "./routes/super-admin";
import { cuisineApi, userApi } from "./services";
import { getUserFromToken } from "./utils";
import User from "./routes/user";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader() {
          return cuisineApi.index();
        },
      },
      {
        path: "/sign-in",
        element: <SignIn />,
      },

      // Keep the '/super' route above the 'regular' user route
      {
        path: "/super",
        element: (
          <RequireAuth>
            <SuperAdmin />
          </RequireAuth>
        ),
        errorElement: <ProtectedErrorBoundary />,

        // TODO: Avoid calling this if we aren't a super admin
        loader() {
          return userApi.index();
        },
        async action({ request }) {
          const fd = await request.formData();
          const id = fd.get("id");

          return userApi.destroy(id);
        },
      },
      {
        path: "/:id",
        element: <User />,
      },
    ],
  },
]);

function App() {
  const [user, setUser] = useState(getUserFromToken());

  return (
    <AuthContext.Provider value={[user, setUser]}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

export default App;
