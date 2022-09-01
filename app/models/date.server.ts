export function getCurrDate() {
  const currDate = new Date();
  const today_minus_30 = new Date(new Date().setDate(currDate.getDate()-30))
  const startOfMonth = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
  const endOfMonth = new Date(currDate.getFullYear(), currDate.getMonth() + 1,1);
  return { currDate, startOfMonth, endOfMonth, today_minus_30 };
}
