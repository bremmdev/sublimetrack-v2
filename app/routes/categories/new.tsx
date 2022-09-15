import {
  type ActionFunction,
  json,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useTransition,
} from "@remix-run/react";
import globalStyles from "~/styles/global.css";
import utilStyles from "~/styles/utils.css";
import formStyles from "~/styles/form.css";
import { v4 as uuid } from "uuid";
import { getCategoriesByUserId, createCategory, type Category } from "~/models/category.server";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import FormActions from "~/components/Forms/FormActions";

export const links = () => [
  { href: globalStyles, rel: "stylesheet" },
  { href: utilStyles, rel: "stylesheet" },
  { href: formStyles, rel: "stylesheet" },
];

/* VALIDATION FUNCTIONS */
const validateName = (name: string, categories: Category[]) => {
  const existingNames = categories.map((cat) => cat.name.toLowerCase());

  const lowerCaseName = name.toLowerCase();

  if (name.length <= 2) {
    return "Name must be at least 2 characters";
  }

  if (existingNames.includes(lowerCaseName)) {
    return `Category '${lowerCaseName}' already exists`;
  }

  //no error
  return null;
};

/* TYPE DEFS */
type FormValues = Record<string, string>;
type ErrorObj = Record<string, string | null>;

type ActionData = {
  error: ErrorObj;
  values: FormValues;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData) as FormValues;
  const { name, color } = values;

  //fetch categories, needed for validation
  const categories = await getCategoriesByUserId(
    "70e0cff2-7589-4de8-9f2f-4e372a5a15f3"
  );

  if (!categories) {
    throw new Response("Categories not found", { status: 404 });
  }

  const error = {
    name: validateName(name, categories),
    color: color.length > 0 ? null : 'Please choose a color'
  };

  //check if any of the fields is invalid
  const hasError = Object.values(error).some((v) => v);

  //send filled in user values back to client along with the errors
  if (hasError) {
    return json<ActionData>({ error, values }, { status: 400 });
  }

  //no errors so add category
  const category = {
    id: uuid(),
    name: name.toLowerCase(),
    color,
    userId: "70e0cff2-7589-4de8-9f2f-4e372a5a15f3",
  };
  await createCategory(category);

  return redirect("/categories");
};

export const loader: LoaderFunction = async ({ request }) => {
  return null
};

export default function NewCategoryRoute() {
  const actionData = useActionData() as ActionData;

  const [color, setColor] = useState<string>('#cccccc')
  const transition = useTransition();

  const isAdding = transition?.submission?.formData.get('_action') === 'create';

  return (
    <div className="form-wrapper">
      <Form method="post" className="form">
        <fieldset disabled={isAdding}>
          <div className="form-control">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" />
          </div>
          {actionData?.error.name && (
            <div className="error">{actionData.error.name}</div>
          )}
          <div className="form-control">
            <label htmlFor="color">Color</label>
            <HexColorPicker color={color} onChange={setColor}/>
            <input type="hidden" name="color" value={color}/>
          </div>
         
          {actionData?.error.color && (
            <div className="error">{actionData.error.color}</div>
          )}
        </fieldset>
       <FormActions redirectTo="/categories" isAdding={isAdding} shouldDisableSubmit={isAdding}/>
       </Form>
    </div>
  );
}
