import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "./utils/routes.ts";
import { PublicLayout } from "./(public)/layout";
import { CreatePage } from "./(public)/create/page.tsx";
import JobPage from "./(public)/job/page.tsx";

function App() {
  const router = createBrowserRouter([
    {
      id: "root",
      path: "/",
      children: [
        {
          path: "/",
          element: <PublicLayout />,
          children: [
            {
              path: ROUTES.create.path,
              element: <CreatePage />,
              handle: {
                data: { title: ROUTES.create.title },
              },
            },
            {
              path: `${ROUTES.job.path}/:id`,
              element: <JobPage />,
              handle: {
                data: { title: ROUTES.job.title },
              },
            },
          ],
        },
      ],
    },
    // Uncomment and complete these routes if needed
    // {
    //   path: ROUTES.job.path,
    //   element: <PrivateLayout />,
    //   loader: protectedLoader,
    //   children: [
    //     {
    //       index: true,
    //       element: <Navigate to={ROUTES.dashboard.copilots.path} />,
    //       handle: {
    //         crumb: () => ROUTES.dashboard.copilots.title,
    //         data: { title: ROUTES.dashboard.copilots.title },
    //       },
    //     },
    //     {
    //       path: ROUTES.dashboard.copilots.name,
    //       element: <Outlet />,
    //       handle: {
    //         crumb: () => ROUTES.dashboard.copilots.title,
    //         data: { title: ROUTES.dashboard.copilots.title },
    //       },
    //       children: [
    //         {
    //           index: true,
    //           element: <CustomerCopilots />,
    //           handle: {
    //             crumb: () => ROUTES.dashboard.copilots.title,
    //             data: { title: ROUTES.dashboard.copilots.title },
    //           },
    //         },
    //         {
    //           path: ROUTES.dashboard.copilots.copilotId.name,
    //           element: <CustomerCopilot />,
    //           loader: async ({ params }) =>
    //             await copilotLoader({ params, queryClient }),
    //           handle: {
    //             crumb: (data: Tables<"copilots">) =>
    //               data.title ?? "Copilot",
    //             data: {
    //               title: ROUTES.dashboard.copilots.title ?? "Copilot",
    //             },
    //           },
    //         },
    //         {
    //           path: ROUTES.dashboard.copilots.create.name,
    //           element: <CreateCopilot />,
    //           handle: {
    //             crumb: () => ROUTES.dashboard.copilots.create.title,
    //             data: { title: ROUTES.dashboard.copilots.create.title },
    //           },
    //         },
    //       ],
    //     },
    //     {
    //       path: ROUTES.dashboard.support.name,
    //       element: <CustomerSupport />,
    //       handle: {
    //         crumb: () => ROUTES.dashboard.support.title,
    //         data: { title: ROUTES.dashboard.support.title },
    //       },
    //     },
    //     {
    //       path: ROUTES.dashboard.success.name,
    //       element: <SuccessPage />,
    //     },
    //   ],
    // },
    // {
    //   path: "*",
    //   element: <Error message="404" />,
    //   handle: {
    //     data: { title: "Error" },
    //   },
    // },
  ]);

  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}

// async function protectedLoader({ request }: LoaderFunctionArgs) {
//   // If the user is not logged in and tries to access `/protected`, we redirect
//   // them to `/login` with a `from` parameter that allows login to redirect back
//   // to the from page upon successful authentication

//   const auth = await supabase.auth.getSession();

//   // Something like this: const session = supabase.auth.session();
//   if (!auth.data.session) {
//     const params = new URLSearchParams();

//     params.set("from", new URL(request.url).pathname);

//     return redirect("/login?" + params.toString());
//   }

//   return { auth };
// }

export default App;
