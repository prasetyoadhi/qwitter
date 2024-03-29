const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        name: "Home",
        path: "",
        component: () => import("src/pages/PageHome.vue"),
      },
      {
        name: "About",
        path: "/about",
        component: () => import("src/pages/PageAbout.vue"),
      },
      {
        name: "Employee",
        path: "/employee",
        component: () => import("src/pages/PageEmployee.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
