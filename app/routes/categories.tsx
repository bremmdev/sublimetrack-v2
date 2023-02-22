import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  useTransition,
  useActionData,
  Link,
} from "@remix-run/react";
import categoryStyles from "~/styles/categories.css";
import {
  getCategoriesByUserId,
  deleteCategory,
  type Category,
} from "~/models/category.server";
import CategoryTag from "~/components/Categories/CategoryTag";
import invariant from "tiny-invariant";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const links = () => [{ href: categoryStyles, rel: "stylesheet" }];

type LoaderData = {
  categories: Category[];
};

type ActionData = null | {
  error: string;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const originRoute = formData.get("origin_route");

  if (action === "delete") {
    const categoryId = formData.get("category_id");
    const categoryName = formData.get("category_name");
    invariant(typeof categoryId === "string", "category not found!");
    invariant(typeof categoryName === "string", "category not found!");

    try {
      const deletedCategory = await deleteCategory(categoryId);
      if (!deletedCategory) {
        throw new Error();
      }
    } catch (e) {
      let errorMessage: string = "";
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2003") {
          errorMessage = `Deletion failed. There are expenses for category '${categoryName}'. Please delete these first.`;
        }
      } else {
        errorMessage = `Deleting category '${categoryName}' failed`;
      }
      return json<ActionData>({ error: errorMessage });
    }
  }

  //if we delete a category while on the '/categories/new' route, we stay on this Route
  if (originRoute === "/categories/new") {
    return redirect(originRoute);
  }
  return null;
};

export const loader: LoaderFunction = async () => {
  try {
    const categories = await getCategoriesByUserId(
      "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
    );

    return json<LoaderData>({ categories });
  } catch (e) {
    throw new Response("Fetching categories failed", { status: 404 });
  }
};

export default function CategoriesRoute() {
  const { categories } = useLoaderData() as LoaderData;

  const actionData = useActionData() as ActionData;

  const transition = useTransition();

  if (transition.type === "normalLoad") {
    return <div className="spinner"></div>;
  }

  let categoriesContent: React.ReactNode = "";

  if (categories.length === 0) {
    categoriesContent = (
      <p className="my-2">There are currently no categories.</p>
    );
  }

  if (categories.length > 0) {
    categoriesContent = (
      <div className="category-tags my-2">
        {categories.map((category) => (
          <CategoryTag key={category.id} category={category} />
        ))}
        {actionData?.error && (
          <div className="error centered">{actionData.error}</div>
        )}
      </div>
    );
  }

  return (
    <div className="container-constrained">
      <div className="flex">
        <h2>Categories</h2>
        <Link
          to="new"
          prefetch="intent"
          className="btn btn-primary align-right"
        >
          Add Category
        </Link>
      </div>
      {/*New category outlet */}
      <Outlet />
      {categoriesContent}
    </div>
  );
}
