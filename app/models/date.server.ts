export function getCurrDate() {
  const currDate = new Date();
  const startOfMonth = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
  const endOfMonth = new Date(currDate.getFullYear(), currDate.getMonth() + 1,1);
  return { currDate, startOfMonth, endOfMonth };
}
