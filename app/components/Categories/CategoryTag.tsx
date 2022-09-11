import { useTransition, Form, useLocation } from '@remix-run/react';
import React from 'react'
import type { Category } from '~/models/category.server';
import { FaRegTimesCircle } from "react-icons/fa";

type Props = {
  category: Category;
}

const CategoryTag = (props: Props) => {
  const { category } = props;

  const transition = useTransition();
  const location = useLocation()

  //used to disable the delete button of all items when an item is being deleted
  const isDeletingAnyItem = transition.submission?.formData.get('_action') === 'delete'

  //used to hide the specific item that is being deleted
  const isDeletingSpecificItem =
  transition.submission?.formData.get("category_id") === category.id;

  const style = {
    border: `2px solid ${category.color}`,
    display: isDeletingSpecificItem ? "none" : "flex",
  };

  return (
    <>
      <div style={style} className="category-tag flex align-center">
        <span>{category.name}</span>
        <Form method="post">
          <button type="submit" className="btn-invisible" disabled={isDeletingAnyItem}>
            <input type="hidden" name="_action" value="delete" />
            <input type="hidden" name="category_id" value={category.id} />
            <input type="hidden" name="category_name" value={category.name} />
            <input type="hidden" name="origin_route" value={location.pathname}/> 
            <FaRegTimesCircle className="delete-cat-icon" />
          </button>
        </Form>
      </div>
    </>
  );
};

export default CategoryTag