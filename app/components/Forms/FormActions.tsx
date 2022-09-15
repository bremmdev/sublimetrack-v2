import React from "react";
import { Link } from "@remix-run/react";

type Props = {
  redirectTo: string;
  isAdding: boolean;
  shouldDisableSubmit: boolean;
};

const FormActions = (props: Props) => {
  const { redirectTo, isAdding, shouldDisableSubmit} = props;

  return (
    <div className="form-actions flex justify-center">
      <button type="submit" className="btn btn-primary" disabled={shouldDisableSubmit} name="_action" value="create">
        {isAdding ? "Adding..." : "Add"}
      </button>
      <Link
        to={redirectTo}
        prefetch="intent"
        className={`btn-secondary btn ${isAdding ? "disabled-link" : ""}`}
      >
        Go Back
      </Link>
    </div>
  );
};

export default FormActions;
